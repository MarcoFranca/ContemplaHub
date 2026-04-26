ALTER TABLE "leads" ADD COLUMN "source_label" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "form_label" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "channel" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "referrer_url" text;--> statement-breakpoint
ALTER TABLE "landing_pages" ADD COLUMN "allowed_domains" text;--> statement-breakpoint
ALTER TABLE "landing_pages" ADD COLUMN "webhook_secret" varchar(128);