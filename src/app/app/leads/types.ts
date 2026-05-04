export type Stage =
    | "novo"
    | "diagnostico"
    | "proposta"
    | "negociacao"
    | "contrato"
    | "ativo"
    | "perdido";

export type CanalOrigem = "lp" | "whatsapp" | "indicacao" | "orgânico" | "pago" | "outro";

export type ContractStatus =
    | "pendente_assinatura"
    | "pendente_pagamento"
    | "alocado"
    | "contemplado"
    | "cancelado";

export type Interest = {
    produto?: string | null;
    valorTotal?: string | null;
    prazoMeses?: number | null;
    objetivo?: string | null;
    perfilDesejado?: string | null;
    observacao?: string | null;
};

export type InterestInsight = {
    score: number;
    missing_fields: string[];
    next_best_action: string;
    suggested_questions: string[];
    likely_objections: string[];
    priority: "baixa" | "media" | "alta";
    strategy_ideas?: string[] | null;
    suggested_ticket_splits?: string[] | null;
};

export type LeadCardInterest = Interest;

export type MetaAdsSummary = {
    objetivo_consorcio_label?: string | null;
    valor_mensal_pretendido_label?: string | null;
    renda_mensal_label?: string | null;
    leadgen_id?: string | null;
    platform?: string | null;
    campaign_name?: string | null;
    adset_name?: string | null;
    ad_name?: string | null;
    form_name?: string | null;
};

export interface LeadCard {
    id: string;
    nome: string | null;
    etapa: Stage;

    telefone?: string | null;
    email?: string | null;
    origem?: string | null;
    owner_id?: string | null;

    created_at?: string | null;
    first_contact_at?: string | null;

    utm_source?: string | null;
    source_label?: string | null;
    form_label?: string | null;
    channel?: string | null;
    utm_campaign?: string | null;
    utm_term?: string | null;
    utm_content?: string | null;

    valor_interesse?: string | null;
    prazo_meses?: number | null;

    interest?: LeadCardInterest | null;
    interest_insight?: InterestInsight | null;
    meta_ads_form_answers?: Record<string, unknown> | null;
    meta_ads_summary?: MetaAdsSummary | null;

    readiness_score?: number | null;
    score_risco?: number | null;
    prob_conversao?: number | null;

    interest_summary?: string | null;

    // enriquecimento para coluna contrato
    contract_id?: string | null;
    contract_status?: ContractStatus | null;
    contract_number?: string | null;

    cota_id?: string | null;
    cota_numero?: string | null;
    grupo_codigo?: string | null;

    valor_carta?: string | null;
    administradora_id?: string | null;
    administradora_nome?: string | null;
}

export type MetricsByStage = Partial<Record<Stage, number>>;

export interface KanbanMetrics {
    avgDays?: MetricsByStage | null;
    conversion?: MetricsByStage | null;
    diagCompletionPct?: MetricsByStage | null;
    readinessAvg?: MetricsByStage | null;
    tFirstContactAvgMin?: MetricsByStage | null;
    raw?: unknown;
}

export type KanbanColumns = Record<Stage, LeadCard[]>;
