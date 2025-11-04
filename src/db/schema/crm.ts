import {
    pgTable, uuid, text, integer, boolean, timestamp, numeric,
    index, uniqueIndex, bigserial
} from "drizzle-orm/pg-core";
import { canalOrigem, leadStage, perfilPsico, atividadeTipo } from "./enums";
import { orgs, profiles } from "./orgs-profiles";
import {landingPages} from "@/db/schema/marketing";

export const leads = pgTable(
    "leads",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        nome: text("nome"),
        telefone: text("telefone"),
        email: text("email"),
        origem: canalOrigem("origem"),
        perfil: perfilPsico("perfil").default("nao_informado"),
        valorInteresse: numeric("valor_interesse"),
        prazoMeses: integer("prazo_meses"),
        consentimento: boolean("consentimento").default(false),
        consentScope: text("consent_scope"),
        consentTs: timestamp("consent_ts", { withTimezone: true }),
        utmSource: text("utm_source"),
        utmMedium: text("utm_medium"),
        utmCampaign: text("utm_campaign"),
        utmTerm: text("utm_term"),
        utmContent: text("utm_content"),
        etapa: leadStage("etapa").default("novo"),
        ownerId: uuid("owner_id").references(() => profiles.userId),
        firstContactAt: timestamp("first_contact_at", { withTimezone: true }),
        lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
        landingId: uuid("landing_id").references(() => landingPages.id),
        sourceLabel: text("source_label"), // "Campanha Natal 2025"
        formLabel: text("form_label"),     // "LP Principal / Google"
        channel: text("channel"),          // "google_ads", "instagram", etc.
        referrerUrl: text("referrer_url"),
        userAgent: text("user_agent"),
        createdBy: uuid("created_by").references(() => profiles.userId),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        byOrgEtapa: index("idx_leads_org_etapa").on(t.orgId, t.etapa),
        byOwner: index("idx_leads_owner").on(t.ownerId),
        byCreated: index("idx_leads_created").on(t.createdAt),
        byCreatedBy: index("idx_leads_created_by").on(t.createdBy),
        contatoUnique: uniqueIndex("leads_contato_unique").on(t.orgId, t.telefone, t.email),
    })
);

export const leadStageHistory = pgTable(
    "lead_stage_history",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
        fromStage: leadStage("from_stage"),
        toStage: leadStage("to_stage").notNull(),
        movedBy: uuid("moved_by").references(() => profiles.userId),
        reason: text("reason"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        byLead: index("idx_stagehist_lead").on(t.leadId, t.createdAt),
    })
);

export const activities = pgTable(
    "activities",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
        tipo: atividadeTipo("tipo").notNull(),
        assunto: text("assunto"),
        conteudo: text("conteudo"),
        dueAt: timestamp("due_at", { withTimezone: true }),
        done: boolean("done").default(false),
        doneAt: timestamp("done_at", { withTimezone: true }),
        createdBy: uuid("created_by").references(() => profiles.userId),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        byLeadDue: index("idx_acts_lead_due").on(t.leadId, t.dueAt),
        byOrgTipo: index("idx_acts_org_tipo").on(t.orgId, t.tipo),
    })
);

export const notes = pgTable("notes", {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdBy: uuid("created_by").references(() => profiles.userId),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const attachments = pgTable("attachments", {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
    storagePath: text("storage_path").notNull(),
    filename: text("filename"),
    mimeType: text("mime_type"),
    sizeBytes: integer("size_bytes"),
    uploadedBy: uuid("uploaded_by").references(() => profiles.userId),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
