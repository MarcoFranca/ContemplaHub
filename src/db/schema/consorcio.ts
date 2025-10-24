import {
    pgTable, uuid, text, timestamp, uniqueIndex, integer, date, index, numeric
} from "drizzle-orm/pg-core";
import { orgs, profiles } from "./orgs-profiles";
import { produtoEnum, lanceTipo, contemplacaoMotivo } from "./enums";
import { leads } from "./crm";
import { deals } from "./deals-propostas";

export const administradoras = pgTable(
    "administradoras",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        nome: text("nome").notNull(),
        cnpj: text("cnpj"),
        site: text("site"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        nomeUnq: uniqueIndex("administradora_nome_unique").on(t.nome),
    })
);

export const grupos = pgTable(
    "grupos",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        administradoraId: uuid("administradora_id").references(() => administradoras.id, { onDelete: "cascade" }),
        codigo: text("codigo"),
        produto: produtoEnum("produto"),
        assembleiaDia: integer("assembleia_dia"),
        observacoes: text("observacoes"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        unqGrupo: uniqueIndex("unq_grupo_admin_codigo").on(t.administradoraId, t.codigo),
    })
);

export const assembleias = pgTable(
    "assembleias",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        grupoId: uuid("grupo_id").references(() => grupos.id, { onDelete: "cascade" }),
        data: date("data").notNull(),
        observacoes: text("observacoes"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        unqPorData: uniqueIndex("unq_assembleia_grupo_data").on(t.grupoId, t.data),
    })
);

export const cotas = pgTable(
    "cotas",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        leadId: uuid("lead_id").references(() => leads.id),
        dealId: uuid("deal_id").references(() => deals.id),
        administradoraId: uuid("administradora_id").references(() => administradoras.id),
        grupoId: uuid("grupo_id").references(() => grupos.id),
        valorCarta: numeric("valor_carta").notNull(),
        produto: produtoEnum("produto").notNull(),
        situacao: text("situacao").default("ativa"), // ativa/contemplada/quitada/cancelada
        dataAdesao: date("data_adesao"),
        observacoes: text("observacoes"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        byOrgSituacao: index("idx_cotas_org_situacao").on(t.orgId, t.situacao),
    })
);

export const lances = pgTable(
    "lances",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        cotaId: uuid("cota_id").references(() => cotas.id, { onDelete: "cascade" }),
        assembleiaId: uuid("assembleia_id").references(() => assembleias.id, { onDelete: "cascade" }),
        tipo: lanceTipo("tipo").notNull(),
        percentual: numeric("percentual"),
        valor: numeric("valor"),
        origem: text("origem").default("recurso_proprio"), // recurso_proprio/embutido/misto
        createdBy: uuid("created_by").references(() => profiles.userId),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        unqCotaAssembleia: uniqueIndex("unq_lance_cota_assembleia").on(t.cotaId, t.assembleiaId),
    })
);

export const contemplacoes = pgTable(
    "contemplacoes",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        cotaId: uuid("cota_id").references(() => cotas.id, { onDelete: "cascade" }),
        assembleiaId: uuid("assembleia_id").references(() => assembleias.id),
        motivo: contemplacaoMotivo("motivo").notNull(),
        lancePercentual: numeric("lance_percentual"),
        data: date("data").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        unqCota: uniqueIndex("unq_contemplacao_cota").on(t.cotaId),
    })
);

export const contratos = pgTable("contratos", {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
    dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }),
    cotaId: uuid("cota_id").references(() => cotas.id),
    numero: text("numero"),
    dataAssinatura: date("data_assinatura"),
    status: text("status").default("ativo"), // ativo/suspenso/cancelado/quitado
    pdfPath: text("pdf_path"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const pagamentos = pgTable(
    "pagamentos",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        contratoId: uuid("contrato_id").references(() => contratos.id, { onDelete: "cascade" }),
        tipo: text("tipo").notNull(), // use pgEnum pagamentoTipo se quiser restrição
        competencia: date("competencia"),
        valor: numeric("valor").notNull(),
        pagoEm: timestamp("pago_em", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        byCompetencia: index("idx_pgto_comp").on(t.competencia),
    })
);
