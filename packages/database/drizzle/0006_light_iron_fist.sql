CREATE TABLE "lead_interesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"lead_id" uuid,
	"produto" "produto",
	"valor_total" numeric,
	"prazo_meses" integer,
	"objetivo" text,
	"perfil_desejado" "perfil_psico",
	"observacao" text,
	"status" text DEFAULT 'aberto',
	"linked_cota_id" uuid,
	"closed_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "lead_interesses" ADD CONSTRAINT "lead_interesses_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_interesses" ADD CONSTRAINT "lead_interesses_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_interesses" ADD CONSTRAINT "lead_interesses_linked_cota_id_cotas_id_fk" FOREIGN KEY ("linked_cota_id") REFERENCES "public"."cotas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_interesses" ADD CONSTRAINT "lead_interesses_created_by_profiles_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_interesses_lead_status" ON "lead_interesses" USING btree ("lead_id","status");--> statement-breakpoint
CREATE INDEX "idx_interesses_org" ON "lead_interesses" USING btree ("org_id");