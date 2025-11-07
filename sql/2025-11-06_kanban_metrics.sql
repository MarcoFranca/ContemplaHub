-- 🔐 (opcional) tudo numa transação:
BEGIN;

-- 0) Remover views dependentes antes
DROP VIEW IF EXISTS kanban_conversion;
DROP VIEW IF EXISTS kanban_avg_days;

-- 1) Remover a base para podermos recriar livremente
DROP VIEW IF EXISTS lead_stage_spans;

-- 2) (Garantia) Adiciona valor 'contrato' ao enum se ainda não existir
DO $$
BEGIN
  -- Se já existir, ignora
BEGIN
ALTER TYPE lead_stage ADD VALUE 'contrato';
EXCEPTION
    WHEN duplicate_object THEN NULL;
WHEN invalid_parameter_value THEN NULL;
END;
END $$;

-- 3) View base com assinatura FIXA (defina a lista de colunas explicitamente)
CREATE VIEW lead_stage_spans (
                              org_id,
                              lead_id,
                              stage,
                              entered_at,
                              next_change_at,
                              duration_days
    ) AS
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
    l.org_id                                              AS org_id,
    ordered.lead_id                                       AS lead_id,
    ordered.stage_entered                                 AS stage,
    ordered.entered_at                                    AS entered_at,
    ordered.next_change_at                                AS next_change_at,
    EXTRACT(EPOCH FROM COALESCE(ordered.next_change_at, NOW()) - ordered.entered_at) / 86400.0
                                                          AS duration_days
FROM ordered
         JOIN leads l ON l.id = ordered.lead_id;

-- 4) View de tempo médio por etapa
CREATE VIEW kanban_avg_days (
                             org_id,
                             stage,
                             avg_days
    ) AS
SELECT
    org_id,
    stage,
    ROUND(AVG(duration_days)::numeric, 1) AS avg_days
FROM lead_stage_spans
GROUP BY 1,2;

-- 5) View de conversão por etapa
CREATE VIEW kanban_conversion (
                               org_id,
                               stage,
                               conversion_pct
    ) AS
WITH entries AS (
    SELECT org_id, stage, COUNT(*) AS entered
    FROM lead_stage_spans
    GROUP BY 1,2
), exits AS (
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

-- 6) RPC para retornar um JSON compacto pro app
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
               'avgDays',    (SELECT jsonb_object_agg(stage, avg_days)        FROM a),
               'conversion', (SELECT jsonb_object_agg(stage, conversion_pct)  FROM c)
       );
$$;

COMMIT;
