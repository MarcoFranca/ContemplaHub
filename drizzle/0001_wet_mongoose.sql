CREATE TABLE "landing_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"slug" text,
	"public_hash" text NOT NULL,
	"utm_defaults" jsonb,
	"active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "landing_id" uuid;--> statement-breakpoint
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_owner_user_id_profiles_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unq_landing_hash" ON "landing_pages" USING btree ("public_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_landing_slug" ON "landing_pages" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_landing_id_landing_pages_id_fk" FOREIGN KEY ("landing_id") REFERENCES "public"."landing_pages"("id") ON DELETE no action ON UPDATE no action;