// src/app/app/leads/types.ts

export type Stage =
    | "novo"
    | "diagnostico"
    | "proposta"
    | "negociacao"
    | "contrato"
    | "ativo"
    | "perdido";

export type CanalOrigem = "lp" | "whatsapp" | "indicacao" | "orgânico" | "pago" | "outro";

export type LeadCardInterest = {
    produto?: string | null;
    valorTotal?: string | null;   // numeric como string
    prazoMeses?: number | null;
    objetivo?: string | null;
    perfilDesejado?: string | null;
    observacao?: string | null;
};

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

    // legado (schema antigo)
    valor_interesse?: string | null;
    prazo_meses?: number | null;

    // resumo do interesse aberto mais recente
    interest?: LeadCardInterest | null;

    // campo que o backend pode mandar já “mastigado”
    interest_summary?: string | null;
}

export type KanbanColumns = Record<Stage, LeadCard[]>;
