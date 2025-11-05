import {
    pgTable,
    uuid,
    text,
    timestamp,
    uniqueIndex,
    integer,
    date,
    index,
    numeric,
    boolean,
    jsonb,
} from "drizzle-orm/pg-core";
import { orgs, profiles } from "./orgs-profiles";
import {
    produtoEnum,
    lanceTipo,
    contemplacaoMotivo,
    fontePagamentoLance,
    lanceBaseCalc,
} from "./enums";
import { leads } from "./crm";
import { deals } from "./deals-propostas";

/* =========================================================
   ADMINISTRADORAS
========================================================= */
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

/* =========================================================
   GRUPOS
   (mantido para referência e alertas de assembleia)
========================================================= */
export const grupos = pgTable(
    "grupos",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        administradoraId: uuid("administradora_id").references(() => administradoras.id, { onDelete: "cascade" }),
        codigo: text("codigo"),
        produto: produtoEnum("produto"),
        assembleiaDia: integer("assembleia_dia"), // ex: 21
        observacoes: text("observacoes"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        unqGrupo: uniqueIndex("unq_grupo_admin_codigo").on(t.administradoraId, t.codigo),
    })
);

/* =========================================================
   COTAS
========================================================= */
export const cotas = pgTable(
    "cotas",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        // relacionamento
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        leadId: uuid("lead_id").references(() => leads.id),
        administradoraId: uuid("administradora_id").references(() => administradoras.id),

        // identificação da carta
        numeroCota: text("numero_cota").notNull(),
        grupoCodigo: text("grupo_codigo").notNull(),

        // financeiro base
        valorCarta: numeric("valor_carta"),
        valorParcela: numeric("valor_parcela"),
        prazo: integer("prazo"), // meses
        formaPagamento: text("forma_pagamento"),
        indiceCorrecao: text("indice_correcao"),

        // parcela reduzida
        parcelaReduzida: boolean("parcela_reduzida").default(false),
        percentualReducao: numeric("percentual_reducao"),
        valorParcelaSemRedutor: numeric("valor_parcela_sem_redutor"),

        // taxa administrativa
        taxaAdminPercentual: numeric("taxa_admin_percentual"),
        taxaAdminValorMensal: numeric("taxa_admin_valor_mensal"),

        // embutido (permite e teto)
        embutidoPermitido: boolean("embutido_permitido").default(false),
        embutidoMaxPercent: numeric("embutido_max_percent"),

        // FGTS e autorizações
        fgtsPermitido: boolean("fgts_permitido").default(false),
        autorizacaoGestao: boolean("autorizacao_gestao").default(false),

        // “furo” — parcelas retroativas
        furoMeses: integer("furo_meses"),

        // estratégia e andamento
        tipoLancePreferencial: lanceTipo("tipo_lance_preferencial"),
        dataUltimoLance: date("data_ultimo_lance"),
        aporte: numeric("aporte"),
        objetivo: text("objetivo"),
        estrategia: text("estrategia"),
        observacoes: text("observacoes"),

        // status e controle
        situacao: text("situacao").default("ativa"), // ativa/contemplada/quitada/cancelada
        produto: produtoEnum("produto").notNull(),
        dataAdesao: date("data_adesao"),
        assembleiaDia: integer("assembleia_dia"), // 1–31

        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        byOrgSituacao: index("idx_cotas_org_situacao").on(t.orgId, t.situacao),
    })
);

/* =========================================================
   LANCES
========================================================= */
export const lances = pgTable(
    "lances",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        cotaId: uuid("cota_id").references(() => cotas.id, { onDelete: "cascade" }),

        assembleiaData: date("assembleia_data"), // data do lance (mês da assembleia)

        // tipo de lance
        tipo: lanceTipo("tipo").notNull(),

        // base de cálculo (% do saldo ou da carta)
        baseCalculo: lanceBaseCalc("base_calculo").default("saldo_devedor"),

        // valores
        percentual: numeric("percentual"),
        valor: numeric("valor"),

        // composição flexível (JSON)
        pagamento: jsonb("pagamento").$type<{
            itens: Array<{
                fonte: typeof fontePagamentoLance["enumValues"][number];
                percentual?: number;
                valor?: number;
            }>;
            observacao?: string;
        }>(),

        origem: text("origem").default("planejado"), // planejado, executado, ajuste
        resultado: text("resultado"), // contemplado, aguardando, não contemplado

        createdBy: uuid("created_by").references(() => profiles.userId),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        unqCotaAssembleia: uniqueIndex("unq_lance_cota_data").on(t.cotaId, t.assembleiaData),
    })
);

/* =========================================================
   CONTEMPLAÇÕES
========================================================= */
export const contemplacoes = pgTable(
    "contemplacoes",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        cotaId: uuid("cota_id").references(() => cotas.id, { onDelete: "cascade" }),
        motivo: contemplacaoMotivo("motivo").notNull(),
        lancePercentual: numeric("lance_percentual"),
        data: date("data").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        unqCota: uniqueIndex("unq_contemplacao_cota").on(t.cotaId),
    })
);

/* =========================================================
   CONTRATOS
========================================================= */
export const contratos = pgTable("contratos", {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
    dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }),
    cotaId: uuid("cota_id").references(() => cotas.id),
    numero: text("numero"),
    dataAssinatura: date("data_assinatura"),
    status: text("status").default("ativo"), // ativo, suspenso, cancelado, quitado
    pdfPath: text("pdf_path"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* =========================================================
   PAGAMENTOS
========================================================= */
export const pagamentos = pgTable(
    "pagamentos",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orgId: uuid("org_id").references(() => orgs.id, { onDelete: "cascade" }),
        contratoId: uuid("contrato_id").references(() => contratos.id, { onDelete: "cascade" }),
        tipo: text("tipo").notNull(),
        competencia: date("competencia"),
        valor: numeric("valor").notNull(),
        pagoEm: timestamp("pago_em", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        byCompetencia: index("idx_pgto_comp").on(t.competencia),
    })
);
