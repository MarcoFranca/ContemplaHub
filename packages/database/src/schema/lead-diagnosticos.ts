import { pgTable, uuid, timestamp, numeric, boolean, integer, text, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { leads } from './crm';
import { orgs } from './orgs-profiles';


export const leadDiagnosticos = pgTable('lead_diagnosticos', {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
    leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),


// Perfil & Objetivo
    objetivo: text('objetivo'), // "morar", "renda", "troca", etc.
    prazoMetaMeses: integer('prazo_meta_meses'),
    preferenciaProduto: text('preferencia_produto'), // "imovel" | "auto"
    regiaoPreferencia: text('regiao_preferencia'),


// Capacidade & Risco
    rendaMensal: numeric('renda_mensal'),
    reservaInicial: numeric('reserva_inicial'),
    comprometimentoMaxPct: numeric('comprometimento_max_pct'), // 0..100
    rendaProvada: boolean('renda_provada').default(false),
    scoreRisco: integer('score_risco'), // 0..100


// Carta & Estratégia
    valorCartaAlvo: numeric('valor_carta_alvo'),
    prazoAlvoMeses: integer('prazo_alvo_meses'),
    estrategiaLance: text('estrategia_lance'), // livre | fixo | embutido
    lanceBasePct: numeric('lance_base_pct'),
    lanceMaxPct: numeric('lance_max_pct'),
    janelaPreferidaSemanas: integer('janela_preferida_semanas'),


// Índices calculados
    readinessScore: integer('readiness_score'), // 0..100
    probConversao: numeric('prob_conversao'), // 0..1
    probContemplacaoShort: numeric('prob_contemplacao_short'), // 0..1
    probContemplacaoMed: numeric('prob_contemplacao_med'), // 0..1
    probContemplacaoLong: numeric('prob_contemplacao_long'), // 0..1


// Extras / LGPD
    consentScope: text('consent_scope'),
    consentTs: timestamp('consent_ts'),
    extras: jsonb('extras').$type<Record<string, unknown>>(),


    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
    byOrg: index('idx_lead_diag_org').on(t.orgId),
    byLead: index('idx_lead_diag_lead').on(t.leadId),
}));


export const leadDiagnosticosRelations = relations(leadDiagnosticos, ({ one }) => ({
    lead: one(leads, { fields: [leadDiagnosticos.leadId], references: [leads.id] }),
    org: one(orgs, { fields: [leadDiagnosticos.orgId], references: [orgs.id] }),
}));