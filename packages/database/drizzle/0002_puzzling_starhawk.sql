ALTER TABLE "orgs" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "orgs" ADD COLUMN "active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "orgs" ADD COLUMN "whatsapp_phone" text;--> statement-breakpoint
ALTER TABLE "orgs" ADD COLUMN "email_from" text;--> statement-breakpoint
ALTER TABLE "orgs" ADD COLUMN "brand" jsonb;--> statement-breakpoint
ALTER TABLE "orgs" ADD COLUMN "timezone" text DEFAULT 'America/Sao_Paulo';--> statement-breakpoint
ALTER TABLE "orgs" ADD COLUMN "cnpj" text;--> statement-breakpoint
ALTER TABLE "orgs" ADD COLUMN "susep" text;