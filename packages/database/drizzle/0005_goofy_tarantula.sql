-- === 1) allowed_domains: converter para text[] de forma resiliente ===

-- 1.1) coluna temporária (destino) text[]
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "allowed_domains_tmp" text[]; --> statement-breakpoint

-- 1.2) preenche a temporária respeitando o TIPO atual de allowed_domains
DO $$
DECLARE
  v_is_array boolean;
BEGIN
  SELECT (data_type = 'ARRAY') INTO v_is_array
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name   = 'landing_pages'
    AND column_name  = 'allowed_domains';

  IF v_is_array IS TRUE THEN
    -- Já é text[]: copia direto
    EXECUTE $sql$
      UPDATE "landing_pages"
      SET "allowed_domains_tmp" = "allowed_domains"::text[]
    $sql$;
  ELSE
    -- Ainda é text: normaliza (JSON -> array; senão CSV -> array)
    EXECUTE $sql$
      UPDATE "landing_pages"
      SET "allowed_domains_tmp" = (
        CASE
          WHEN "allowed_domains" IS NULL OR btrim("allowed_domains") = '' THEN NULL
          WHEN left("allowed_domains", 1) = '[' THEN (
            SELECT coalesce(array_agg(value::text), '{}')
            FROM jsonb_array_elements_text("landing_pages"."allowed_domains"::jsonb)
          )
          ELSE array_remove(
            string_to_array(regexp_replace("allowed_domains", '\s', '', 'g'), ','),
            ''
          )
        END
      )
    $sql$;
  END IF;
END$$; --> statement-breakpoint

-- 1.3) remove a coluna antiga (se existir) e renomeia a temporária
ALTER TABLE "landing_pages" DROP COLUMN IF EXISTS "allowed_domains"; --> statement-breakpoint
ALTER TABLE "landing_pages" RENAME COLUMN "allowed_domains_tmp" TO "allowed_domains"; --> statement-breakpoint
-- (tipo já é text[] neste ponto)

-- === 2) leads.created_by + FK + índice ===

ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "created_by" uuid; --> statement-breakpoint

DO $$
BEGIN
  ALTER TABLE "leads"
    ADD CONSTRAINT "leads_created_by_profiles_user_id_fk"
    FOREIGN KEY ("created_by")
    REFERENCES "public"."profiles"("user_id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$; --> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_leads_created_by" ON "leads" USING btree ("created_by"); --> statement-breakpoint

-- === 3) (opcional) updated_at automático em leads/deals ===

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$; --> statement-breakpoint

DROP TRIGGER IF EXISTS trg_leads_updated_at ON "leads"; --> statement-breakpoint
CREATE TRIGGER trg_leads_updated_at
BEFORE UPDATE ON "leads"
FOR EACH ROW EXECUTE FUNCTION set_updated_at(); --> statement-breakpoint

DROP TRIGGER IF EXISTS trg_deals_updated_at ON "deals"; --> statement-breakpoint
CREATE TRIGGER trg_deals_updated_at
BEFORE UPDATE ON "deals"
FOR EACH ROW EXECUTE FUNCTION set_updated_at(); --> statement-breakpoint
