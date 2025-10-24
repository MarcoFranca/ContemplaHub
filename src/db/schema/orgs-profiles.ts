import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const orgs = pgTable("orgs", {
    id: uuid("id").defaultRandom().primaryKey(),
    nome: text("nome").notNull(),
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
