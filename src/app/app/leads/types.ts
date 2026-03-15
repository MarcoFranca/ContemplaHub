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

export interface LeadCard {
    id: string;
    nome: string | null;
    etapa: Stage;

    telefone?: string | null;
    email?: string | null;
    origem?: CanalOrigem | null;
    owner_id?: string | null;

    created_at?: string | null;
    first_contact_at?: string | null;

    utm_source?: string | null;

    valor_interesse?: string | null;
    prazo_meses?: number | null;

    interest?: LeadCardInterest | null;
    interest_insight?: InterestInsight | null;

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
    raw?: any;
}

export type KanbanColumns = Record<Stage, LeadCard[]>;