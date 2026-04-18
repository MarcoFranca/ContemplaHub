import type { ContratoBaseFormValues } from "../schemas/contrato-base.schema";

export type ContratoFormMode = "fromLead" | "registerExisting";

export type ContratoStatus =
    | "pendente_assinatura"
    | "pendente_pagamento"
    | "alocado"
    | "contemplado"
    | "cancelado";

export type CotaSituacao = "ativa" | "contemplada" | "cancelada";

export type Produto = "imobiliario" | "auto";

export interface AdministradoraOption {
    id: string;
    nome: string;
}

export interface ParceiroOption {
    id: string;
    nome: string;
}

export type ContratoFormValues = {
    leadId: string;
    dealId?: string | null;

    administradoraId: string;
    grupoCodigo: string;
    numeroCota: string;
    produto: "imobiliario" | "auto";

    valorCarta: number;
    prazo: number;
    valorParcela?: number | null;
    dataAdesao?: string | null;
    assembleiaDia?: number | null;
    observacoes?: string | null;

    numeroContrato?: string | null;
    dataAssinatura?: string | null;

    percentualComissao: number;
    impostoRetidoPct?: number | null;
    comissaoObservacoes?: string | null;

    parceiroId?: string | null;
    repassePercentualComissao?: number | null;
    parceiroObservacoes?: string | null;

    contractStatus?:
        | "pendente_assinatura"
        | "pendente_pagamento"
        | "alocado"
        | "contemplado"
        | "cancelado"
        | null;

    cotaSituacao?: "ativa" | "contemplada" | "cancelada" | null;
};


export interface ContratoFormShellV2Props {
    mode: ContratoFormMode;
    leadId: string;
    dealId?: string | null;
    administradoras: AdministradoraOption[];
    parceiros?: ParceiroOption[];
    existingContractId?: string | null;
    onSuccess?: (params: { contractId: string | null }) => void;
    insideSheet?: boolean;
}