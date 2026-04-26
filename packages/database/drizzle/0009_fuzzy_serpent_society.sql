CREATE TYPE "public"."fonte_pagamento_lance" AS ENUM('embutido', 'fgts', 'proprio', 'outro');--> statement-breakpoint
CREATE TYPE "public"."lance_base_calc" AS ENUM('saldo_devedor', 'valor_carta');--> statement-breakpoint
ALTER TABLE "assembleias" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "assembleias" CASCADE;--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "contemplacoes" DROP CONSTRAINT IF EXISTS "contemplacoes_assembleia_id_assembleias_id_fk";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "cotas" DROP CONSTRAINT IF EXISTS "cotas_deal_id_deals_id_fk";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "cotas" DROP CONSTRAINT IF EXISTS "cotas_grupo_id_grupos_id_fk";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "lances" DROP CONSTRAINT IF EXISTS "lances_assembleia_id_assembleias_id_fk";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;
--> statement-breakpoint
DROP INDEX "unq_lance_cota_assembleia";--> statement-breakpoint
ALTER TABLE "cotas" ALTER COLUMN "valor_carta" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lances" ALTER COLUMN "origem" SET DEFAULT 'planejado';--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "numero_cota" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "grupo_codigo" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "valor_parcela" numeric;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "prazo" integer;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "forma_pagamento" text;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "indice_correcao" text;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "parcela_reduzida" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "percentual_reducao" numeric;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "valor_parcela_sem_redutor" numeric;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "taxa_admin_percentual" numeric;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "taxa_admin_valor_mensal" numeric;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "embutido_permitido" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "embutido_max_percent" numeric;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "fgts_permitido" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "autorizacao_gestao" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "furo_meses" integer;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "tipo_lance_preferencial" "lance_tipo";--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "data_ultimo_lance" date;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "aporte" numeric;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "objetivo" text;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "estrategia" text;--> statement-breakpoint
ALTER TABLE "cotas" ADD COLUMN "assembleia_dia" integer;--> statement-breakpoint
ALTER TABLE "lances" ADD COLUMN "assembleia_data" date;--> statement-breakpoint
ALTER TABLE "lances" ADD COLUMN "base_calculo" "lance_base_calc" DEFAULT 'saldo_devedor';--> statement-breakpoint
ALTER TABLE "lances" ADD COLUMN "pagamento" jsonb;--> statement-breakpoint
ALTER TABLE "lances" ADD COLUMN "resultado" text;--> statement-breakpoint
CREATE UNIQUE INDEX "unq_lance_cota_data" ON "lances" USING btree ("cota_id","assembleia_data");--> statement-breakpoint
ALTER TABLE "contemplacoes" DROP COLUMN "assembleia_id";--> statement-breakpoint
ALTER TABLE "cotas" DROP COLUMN "deal_id";--> statement-breakpoint
ALTER TABLE "cotas" DROP COLUMN "grupo_id";--> statement-breakpoint
ALTER TABLE "lances" DROP COLUMN "assembleia_id";