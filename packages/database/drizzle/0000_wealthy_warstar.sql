CREATE TYPE "public"."atividade_tipo" AS ENUM('whatsapp', 'ligacao', 'email', 'reuniao', 'anotacao', 'tarefa');--> statement-breakpoint
CREATE TYPE "public"."canal_origem" AS ENUM('lp', 'whatsapp', 'indicacao', 'orgânico', 'pago', 'outro');--> statement-breakpoint
CREATE TYPE "public"."contemplacao_motivo" AS ENUM('lance', 'sorteio', 'outro');--> statement-breakpoint
CREATE TYPE "public"."deal_status" AS ENUM('aberto', 'ganho', 'perdido');--> statement-breakpoint
CREATE TYPE "public"."lance_tipo" AS ENUM('livre', 'embutido', 'fixo');--> statement-breakpoint
CREATE TYPE "public"."lead_stage" AS ENUM('novo', 'diagnostico', 'proposta', 'negociacao', 'fechamento', 'ativo', 'perdido');--> statement-breakpoint
CREATE TYPE "public"."pagamento_tipo" AS ENUM('parcela', 'taxa_adesao', 'taxa_admin', 'outro');--> statement-breakpoint
CREATE TYPE "public"."perfil_psico" AS ENUM('disciplinado_acumulador', 'sonhador_familiar', 'corporativo_racional', 'impulsivo_emocional', 'estrategico_oportunista', 'nao_informado');--> statement-breakpoint
CREATE TYPE "public"."produto" AS ENUM('imobiliario', 'auto');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"org_id" uuid,
	"actor_id" uuid,
	"entity" text,
	"entity_id" uuid,
	"action" text,
	"diff" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consent_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"lead_id" uuid,
	"consentimento" boolean NOT NULL,
	"scope" text,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "administradoras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"nome" text NOT NULL,
	"cnpj" text,
	"site" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assembleias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"grupo_id" uuid,
	"data" date NOT NULL,
	"observacoes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contemplacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"cota_id" uuid,
	"assembleia_id" uuid,
	"motivo" "contemplacao_motivo" NOT NULL,
	"lance_percentual" numeric,
	"data" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contratos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"deal_id" uuid,
	"cota_id" uuid,
	"numero" text,
	"data_assinatura" date,
	"status" text DEFAULT 'ativo',
	"pdf_path" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cotas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"lead_id" uuid,
	"deal_id" uuid,
	"administradora_id" uuid,
	"grupo_id" uuid,
	"valor_carta" numeric NOT NULL,
	"produto" "produto" NOT NULL,
	"situacao" text DEFAULT 'ativa',
	"data_adesao" date,
	"observacoes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "grupos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"administradora_id" uuid,
	"codigo" text,
	"produto" "produto",
	"assembleia_dia" integer,
	"observacoes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"cota_id" uuid,
	"assembleia_id" uuid,
	"tipo" "lance_tipo" NOT NULL,
	"percentual" numeric,
	"valor" numeric,
	"origem" text DEFAULT 'recurso_proprio',
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pagamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"contrato_id" uuid,
	"tipo" text NOT NULL,
	"competencia" date,
	"valor" numeric NOT NULL,
	"pago_em" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"lead_id" uuid,
	"tipo" "atividade_tipo" NOT NULL,
	"assunto" text,
	"conteudo" text,
	"due_at" timestamp with time zone,
	"done" boolean DEFAULT false,
	"done_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"lead_id" uuid,
	"storage_path" text NOT NULL,
	"filename" text,
	"mime_type" text,
	"size_bytes" integer,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_stage_history" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"lead_id" uuid,
	"from_stage" "lead_stage",
	"to_stage" "lead_stage" NOT NULL,
	"moved_by" uuid,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"nome" text,
	"telefone" text,
	"email" text,
	"origem" "canal_origem",
	"perfil" "perfil_psico" DEFAULT 'nao_informado',
	"valor_interesse" numeric,
	"prazo_meses" integer,
	"consentimento" boolean DEFAULT false,
	"consent_scope" text,
	"consent_ts" timestamp with time zone,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_term" text,
	"utm_content" text,
	"etapa" "lead_stage" DEFAULT 'novo',
	"owner_id" uuid,
	"first_contact_at" timestamp with time zone,
	"last_activity_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"lead_id" uuid,
	"body" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"lead_id" uuid,
	"titulo" text,
	"status" "deal_status" DEFAULT 'aberto',
	"motivo_perda" text,
	"valor_carta" numeric,
	"prazo_meses" integer,
	"administradora" text,
	"created_by" uuid,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "propostas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"lead_id" uuid,
	"deal_id" uuid,
	"tipo" "produto" NOT NULL,
	"valor_carta" numeric NOT NULL,
	"prazo_meses" integer NOT NULL,
	"taxa_admin" numeric,
	"indexador" text,
	"resultado" jsonb,
	"generated_pdf_path" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orgs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"org_id" uuid,
	"nome" text,
	"telefone" text,
	"role" text DEFAULT 'vendedor',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "administradoras" ADD CONSTRAINT "administradoras_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assembleias" ADD CONSTRAINT "assembleias_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assembleias" ADD CONSTRAINT "assembleias_grupo_id_grupos_id_fk" FOREIGN KEY ("grupo_id") REFERENCES "public"."grupos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contemplacoes" ADD CONSTRAINT "contemplacoes_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contemplacoes" ADD CONSTRAINT "contemplacoes_cota_id_cotas_id_fk" FOREIGN KEY ("cota_id") REFERENCES "public"."cotas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contemplacoes" ADD CONSTRAINT "contemplacoes_assembleia_id_assembleias_id_fk" FOREIGN KEY ("assembleia_id") REFERENCES "public"."assembleias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_cota_id_cotas_id_fk" FOREIGN KEY ("cota_id") REFERENCES "public"."cotas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cotas" ADD CONSTRAINT "cotas_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cotas" ADD CONSTRAINT "cotas_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cotas" ADD CONSTRAINT "cotas_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cotas" ADD CONSTRAINT "cotas_administradora_id_administradoras_id_fk" FOREIGN KEY ("administradora_id") REFERENCES "public"."administradoras"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cotas" ADD CONSTRAINT "cotas_grupo_id_grupos_id_fk" FOREIGN KEY ("grupo_id") REFERENCES "public"."grupos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_administradora_id_administradoras_id_fk" FOREIGN KEY ("administradora_id") REFERENCES "public"."administradoras"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lances" ADD CONSTRAINT "lances_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lances" ADD CONSTRAINT "lances_cota_id_cotas_id_fk" FOREIGN KEY ("cota_id") REFERENCES "public"."cotas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lances" ADD CONSTRAINT "lances_assembleia_id_assembleias_id_fk" FOREIGN KEY ("assembleia_id") REFERENCES "public"."assembleias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lances" ADD CONSTRAINT "lances_created_by_profiles_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_contrato_id_contratos_id_fk" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_profiles_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_profiles_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_stage_history" ADD CONSTRAINT "lead_stage_history_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_stage_history" ADD CONSTRAINT "lead_stage_history_moved_by_profiles_user_id_fk" FOREIGN KEY ("moved_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_owner_id_profiles_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_created_by_profiles_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_created_by_profiles_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_created_by_profiles_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "administradora_nome_unique" ON "administradoras" USING btree ("nome");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_assembleia_grupo_data" ON "assembleias" USING btree ("grupo_id","data");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_contemplacao_cota" ON "contemplacoes" USING btree ("cota_id");--> statement-breakpoint
CREATE INDEX "idx_cotas_org_situacao" ON "cotas" USING btree ("org_id","situacao");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_grupo_admin_codigo" ON "grupos" USING btree ("administradora_id","codigo");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_lance_cota_assembleia" ON "lances" USING btree ("cota_id","assembleia_id");--> statement-breakpoint
CREATE INDEX "idx_pgto_comp" ON "pagamentos" USING btree ("competencia");--> statement-breakpoint
CREATE INDEX "idx_acts_lead_due" ON "activities" USING btree ("lead_id","due_at");--> statement-breakpoint
CREATE INDEX "idx_acts_org_tipo" ON "activities" USING btree ("org_id","tipo");--> statement-breakpoint
CREATE INDEX "idx_stagehist_lead" ON "lead_stage_history" USING btree ("lead_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_leads_org_etapa" ON "leads" USING btree ("org_id","etapa");--> statement-breakpoint
CREATE INDEX "idx_leads_owner" ON "leads" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_leads_created" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "leads_contato_unique" ON "leads" USING btree ("org_id","telefone","email");--> statement-breakpoint
CREATE INDEX "idx_deals_org_status" ON "deals" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "idx_prop_lead_created" ON "propostas" USING btree ("lead_id","created_at");