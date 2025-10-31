import {pgTable, uuid, text, timestamp, boolean, jsonb} from "drizzle-orm/pg-core";

export const orgs = pgTable("orgs", {
    id: uuid("id").defaultRandom().primaryKey(),
    nome: text("nome").notNull(),
    slug: text("slug"), // unique opcional (adicione uniqueIndex se quiser)
    active: boolean("active").default(true),
    whatsappPhone: text("whatsapp_phone"),
    emailFrom: text("email_from"),
    brand: jsonb("brand"),                 // {logoUrl, primary:"#10b981", ...}
    timezone: text("timezone").default("America/Sao_Paulo"),
    cnpj: text("cnpj"),
    susep: text("susep"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// No Supabase, o usuário real está em auth.users.
// Aqui mantemos apenas a PK (UUID) e referenciamos por app logic/RLS SQL.
export const profiles = pgTable("profiles", {
    userId: uuid("user_id").primaryKey(),
    orgId: uuid("org_id").references(() => orgs.id, { onDelete: "set null" }),
    nome: text("nome"),
    telefone: text("telefone"),
    role: text("role").default("vendedor"), // admin/gestor/vendedor/op/viewer
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
