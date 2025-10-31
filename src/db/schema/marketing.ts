// src/db/schema/marketing.ts
import { pgTable, uuid, text, boolean, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { orgs, profiles } from "./orgs-profiles";

export const landingPages = pgTable("landing_pages", {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }).notNull(),
    ownerUserId: uuid("owner_user_id").references(() => profiles.userId, { onDelete: "set null" }).notNull(),
    slug: text("slug"),                              // opcional, SEO
    publicHash: text("public_hash").notNull(),       // ex.: a8F9xK
    utmDefaults: jsonb("utm_defaults"),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, t => ({
    unqHash: uniqueIndex("unq_landing_hash").on(t.publicHash),
    unqSlug: uniqueIndex("unq_landing_slug").on(t.slug),
}));
