import {
    pgTable, uuid, text, integer, numeric, timestamp, jsonb, index
} from "drizzle-orm/pg-core";
import { dealStatus, produtoEnum } from "./enums";
import { orgs, profiles } from "./orgs-profiles";
import { leads } from "./crm";

export const deals = pgTable(
    "deals",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
        titulo: text("titulo"),
        status: dealStatus("status").default("aberto"),
        motivoPerda: text("motivo_perda"),
        valorCarta: numeric("valor_carta"),
        prazoMeses: integer("prazo_meses"),
        administradora: text("administradora"),
        createdBy: uuid("created_by").references(() => profiles.userId),
        closedAt: timestamp("closed_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        byOrgStatus: index("idx_deals_org_status").on(t.orgId, t.status),
    })
);

export const propostas = pgTable(
    "propostas",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
        dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }),
        tipo: produtoEnum("tipo").notNull(), // imobiliario/auto
        valorCarta: numeric("valor_carta").notNull(),
        prazoMeses: integer("prazo_meses").notNull(),
        taxaAdmin: numeric("taxa_admin"),
        indexador: text("indexador"),
        resultado: jsonb("resultado"), // estrutura livre p/ simulador
        generatedPdfPath: text("generated_pdf_path"),
        createdBy: uuid("created_by").references(() => profiles.userId),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        byLead: index("idx_prop_lead_created").on(t.leadId, t.createdAt),
    })
);
