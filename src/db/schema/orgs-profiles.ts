// src/db/schema/orgs-profiles.ts
import { pgTable, uuid, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const orgs = pgTable("orgs", {
    id: uuid("id").defaultRandom().primaryKey(),
    nome: text("nome").notNull(),
    slug: text("slug"),
    active: boolean("active").default(true),
    whatsappPhone: text("whatsapp_phone"),
    emailFrom: text("email_from"),
    brand: jsonb("brand"),
    timezone: text("timezone").default("America/Sao_Paulo"),
    cnpj: text("cnpj"),
    susep: text("susep"),
    ownerUserId: uuid("owner_user_id").notNull(), // << DONO da org (criador)
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const profiles = pgTable("profiles", {
    userId: uuid("user_id").primaryKey(),
    orgId: uuid("org_id").references(() => orgs.id, { onDelete: "set null" }),
    nome: text("nome"),
    telefone: text("telefone"),
    role: text("role").default("vendedor"), // admin | gestor | vendedor | viewer
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
