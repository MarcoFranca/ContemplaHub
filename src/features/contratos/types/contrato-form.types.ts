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

export type LanceFixoOptionFormValue = {
    id?: string;
    ordem: number;
    percentual: number | null;
    ativo: boolean;
    observacoes?: string | null;
};

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
    valorParcelaSemRedutor?: number | null;
    dataAdesao?: string | null;
    assembleiaDia?: number | null;
    observacoes?: string | null;

    numeroContrato?: string | null;
    dataAssinatura?: string | null;

    parcelaReduzida: boolean;
    percentualReducao?: number | null;
    autorizacaoGestao: boolean;
    fgtsPermitido: boolean;
    embutidoPermitido: boolean;
    embutidoMaxPercent?: number | null;
    opcoesLanceFixo: LanceFixoOptionFormValue[];

    percentualComissao: number;
    impostoRetidoPct?: number | null;
    comissaoObservacoes?: string | null;

    parceiroId?: string | null;
    repassePercentualComissao?: number | null;
    parceiroObservacoes?: string | null;

    contractStatus?: ContratoStatus | null;
    cotaSituacao?: CotaSituacao | null;
};

export interface ContratoFormShellV2Props {
    mode: ContratoFormMode;
    leadId: string;
    dealId?: string | null;
    administradoras: AdministradoraOption[];
    parceiros?: ParceiroOption[];
    existingContractId?: string | null;
    onSuccess?: (params: {
        contractId: string | null;
        cotaId: string | null;
    }) => void;
    insideSheet?: boolean;
}
