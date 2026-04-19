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
        taxaAdminPercentual: null,
        taxaAdminValorMensal: null,
        fundoReservaPercentual: null,
        fundoReservaValorMensal: null,
        seguroPrestamistaAtivo: false,
        seguroPrestamistaPercentual: null,
        seguroPrestamistaValorMensal: null,
        taxaAdminAntecipadaAtivo: false,
        taxaAdminAntecipadaPercentual: null,
        taxaAdminAntecipadaFormaPagamento: null,
        taxaAdminAntecipadaParcelas: null,
        taxaAdminAntecipadaValorTotal: null,
        taxaAdminAntecipadaValorParcela: null,
        valorParcelaSemRedutor: null,
        dataAdesao: null,
        assembleiaDia: null,
        observacoes: null,

        numeroContrato: null,
        dataAssinatura: null,

        parcelaReduzida: false,
        percentualReducao: null,
        autorizacaoGestao: false,
        fgtsPermitido: false,
        embutidoPermitido: false,
        embutidoMaxPercent: null,
        opcoesLanceFixo: [],

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
