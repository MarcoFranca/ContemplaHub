-- 1) Trigger function genérica (idempotente)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
RETURN NEW;
END $$; --> statement-breakpoint

-- 2) Trigger em lead_interesses
DROP TRIGGER IF EXISTS trg_lead_interesses_updated_at ON "lead_interesses"; --> statement-breakpoint
CREATE TRIGGER trg_lead_interesses_updated_at
    BEFORE UPDATE ON "lead_interesses"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at(); --> statement-breakpoint

-- 3) Backfill: cria interesse “aberto” a partir de dados antigos (se houver)
INSERT INTO "lead_interesses" ("org_id","lead_id","valor_total","prazo_meses","status","created_by")
SELECT l.org_id, l.id, l.valor_interesse, l.prazo_meses, 'aberto', l.created_by
FROM "leads" l
WHERE (l.valor_interesse IS NOT NULL OR l.prazo_meses IS NOT NULL)
  AND NOT EXISTS (
    SELECT 1 FROM "lead_interesses" i WHERE i.lead_id = l.id
); --> statement-breakpoint

-- 4) (Opcional) CHECK: pelo menos um contato (telefone OU e-mail)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_contact_at_least_one'
  ) THEN
ALTER TABLE "leads"
    ADD CONSTRAINT leads_contact_at_least_one
        CHECK (telefone IS NOT NULL OR email IS NOT NULL);
END IF;
END$$; --> statement-breakpoint
