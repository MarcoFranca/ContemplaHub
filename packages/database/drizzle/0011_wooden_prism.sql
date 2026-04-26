CREATE TABLE "lead_diagnosticos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"lead_id" uuid NOT NULL,
	"objetivo" text,
	"prazo_meta_meses" integer,
	"preferencia_produto" text,
	"regiao_preferencia" text,
	"renda_mensal" numeric,
	"reserva_inicial" numeric,
	"comprometimento_max_pct" numeric,
	"renda_provada" boolean DEFAULT false,
	"score_risco" integer,
	"valor_carta_alvo" numeric,
	"prazo_alvo_meses" integer,
	"estrategia_lance" text,
	"lance_base_pct" numeric,
	"lance_max_pct" numeric,
	"janela_preferida_semanas" integer,
	"readiness_score" integer,
	"prob_conversao" numeric,
	"prob_contemplacao_short" numeric,
	"prob_contemplacao_med" numeric,
	"prob_contemplacao_long" numeric,
	"consent_scope" text,
	"consent_ts" timestamp,
	"extras" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "lead_diagnosticos" ADD CONSTRAINT "lead_diagnosticos_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_diagnosticos" ADD CONSTRAINT "lead_diagnosticos_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_lead_diag_org" ON "lead_diagnosticos" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_lead_diag_lead" ON "lead_diagnosticos" USING btree ("lead_id");