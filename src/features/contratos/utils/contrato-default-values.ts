import type {
    ContratoFormMode,
    ContratoFormValues,
} from "../types/contrato-form.types";

interface Params {
    mode: ContratoFormMode;
    leadId: string;
    dealId?: string | null;
}

export function getContratoDefaultValues({
                                             mode,
                                             leadId,
                                             dealId,
                                         }: Params): ContratoFormValues {
    return {
        leadId,
        dealId: dealId ?? null,

        administradoraId: "",
        grupoCodigo: "",
        numeroCota: "",
        produto: "imobiliario",

        valorCarta: 0,
        prazo: 0,
        valorParcela: null,
        dataAdesao: null,
        assembleiaDia: null,
        observacoes: null,

        numeroContrato: null,
        dataAssinatura: null,

        percentualComissao: 4,
        impostoRetidoPct: 10,
        comissaoObservacoes: null,

        parceiroId: null,
        repassePercentualComissao: null,
        parceiroObservacoes: null,

        contractStatus: mode === "registerExisting" ? "alocado" : null,
        cotaSituacao: mode === "registerExisting" ? "ativa" : null,
    };
}