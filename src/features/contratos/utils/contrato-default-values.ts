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
        produto: "imovel",

        valorCarta: 0,
        prazo: 0,
        valorParcela: null,
        dataAdesao: null,
        assembleiaDia: null,
        observacoes: null,

        numeroContrato: null,
        dataAssinatura: null,

        parceiroId: null,
        repassePercentual: null,
        repasseValor: null,
        parceiroObservacoes: null,

        contractStatus: mode === "registerExisting" ? "alocado" : null,
        cotaSituacao: mode === "registerExisting" ? "ativa" : null,
    };
}