-- ENUM: adiciona 'contrato' (não remove 'fechamento' para evitar break)
ALTER TYPE lead_stage ADD VALUE IF NOT EXISTS 'contrato' BEFORE 'ativo';

-- (opcional) migrar dados legados de 'fechamento' -> 'contrato'
-- UPDATE leads SET etapa = 'contrato' WHERE etapa = 'fechamento';
-- UPDATE lead_stage_history SET to_stage = 'contrato' WHERE to_stage = 'fechamento';
-- UPDATE lead_stage_history SET from_stage = 'contrato' WHERE from_stage = 'fechamento';

-- VIEW: spans por etapa (entrada/saída)
CREATE OR REPLACE VIEW lead_stage_spans AS
WITH ordered AS (
  SELECT
    lsh.lead_id,
    lsh.to_stage        AS stage_entered,
    lsh.created_at      AS entered_at,
    LEAD(lsh.created_at) OVER (
      PARTITION BY lsh.lead_id ORDER BY lsh.created_at
    )                   AS next_change_at
  FROM lead_stage_history lsh
)
SELECT
    l.org_id                    AS org_id,
    ordered.lead_id,
    ordered.stage_entered       AS stage,
    ordered.entered_at,
    ordered.next_change_at,
    EXTRACT(EPOCH FROM COALESCE(ordered.next_change_at, NOW()) - ordered.entered_at) / 86400.0
                                AS duration_days
FROM ordered
         JOIN leads l ON l.id = ordered.lead_id;

-- tempo médio (dias) por etapa/organização
CREATE OR REPLACE VIEW kanban_avg_days AS
SELECT
    org_id,
    stage,
    ROUND(AVG(duration_days)::numeric, 1) AS avg_days
FROM lead_stage_spans
GROUP BY 1,2;

-- conversão por etapa (% que sai da etapa)
CREATE OR REPLACE VIEW kanban_conversion AS
WITH entries AS (
  SELECT org_id, stage, COUNT(*) AS entered
  FROM lead_stage_spans
  GROUP BY 1,2
),
exits AS (
  SELECT org_id, stage, COUNT(*) AS exited
  FROM lead_stage_spans
  WHERE next_change_at IS NOT NULL
  GROUP BY 1,2
)
SELECT
    e.org_id,
    e.stage,
    CASE WHEN e.entered = 0 THEN 0
         ELSE ROUND((COALESCE(x.exited,0)::numeric / e.entered::numeric) * 100, 0)
        END AS conversion_pct
FROM entries e
         LEFT JOIN exits x
                   ON x.org_id = e.org_id AND x.stage = e.stage;

-- RPC: retorna JSON com avgDays + conversion
CREATE OR REPLACE FUNCTION get_kanban_metrics(p_org uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  WITH a AS (
    SELECT stage, avg_days FROM kanban_avg_days WHERE org_id = p_org
  ),
  c AS (
    SELECT stage, conversion_pct FROM kanban_conversion WHERE org_id = p_org
  )
SELECT jsonb_build_object(
               'avgDays',    (SELECT jsonb_object_agg(stage, avg_days)      FROM a),
               'conversion', (SELECT jsonb_object_agg(stage, conversion_pct) FROM c)
       );
$$;

-- (Opcional) Trigger para garantir histórico mesmo se o app falhar
-- Ajuste moved_by conforme seu schema (mantive NULL).
CREATE OR REPLACE FUNCTION trg_leads_etapa_history()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') AND (NEW.etapa IS DISTINCT FROM OLD.etapa) THEN
    INSERT INTO lead_stage_history (lead_id, from_stage, to_stage, moved_by, reason, created_at)
    VALUES (NEW.id, OLD.etapa, NEW.etapa, NULL, NULL, NOW());
END IF;
RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS t_leads_stage_hist ON leads;
CREATE TRIGGER t_leads_stage_hist
    AFTER UPDATE OF etapa ON leads
    FOR EACH ROW
    EXECUTE FUNCTION trg_leads_etapa_history();
