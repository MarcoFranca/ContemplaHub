import { pgTable, bigserial, uuid, boolean, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { leads } from "./crm";

export const consentLogs = pgTable("consent_logs", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
    consentimento: boolean("consentimento").notNull(),
    scope: text("scope"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    orgId: uuid("org_id"),
    actorId: uuid("actor_id"), // profiles.userId
    entity: text("entity"),
    entityId: uuid("entity_id"),
    action: text("action"), // create/update/delete
    diff: jsonb("diff"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
