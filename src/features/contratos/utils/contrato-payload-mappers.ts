import type {
    ContratoFormMode,
    ContratoFormValues,
} from "../types/contrato-form.types";

function emptyToNull(value?: string | null) {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
}

function numberToBackendString(value?: number | null) {
    if (value == null || Number.isNaN(value)) return null;
    return value.toFixed(2);
}

export function mapContratoFormToApi(
    mode: ContratoFormMode,
    values: ContratoFormValues
) {
    const hasPartner = !!values.parceiroId;

    const base = {
        lead_id: values.leadId,
        deal_id: values.dealId ?? null,

        administradora_id: values.administradoraId,
        grupo_codigo: values.grupoCodigo,
        numero_cota: values.numeroCota,
        produto: values.produto,

        valor_carta: numberToBackendString(values.valorCarta),
        prazo: values.prazo,
        valor_parcela: numberToBackendString(values.valorParcela),
        data_adesao: emptyToNull(values.dataAdesao),
        assembleia_dia: values.assembleiaDia ?? null,
        observacoes: emptyToNull(values.observacoes),

        numero_contrato: emptyToNull(values.numeroContrato),
        data_assinatura: emptyToNull(values.dataAssinatura),

        parceiro_id: hasPartner ? values.parceiroId : null,
        repasse_percentual:
            hasPartner && values.repassePercentual != null
                ? String(values.repassePercentual)
                : null,
        repasse_valor:
            hasPartner ? numberToBackendString(values.repasseValor) : null,
        parceiro_observacoes: hasPartner
            ? emptyToNull(values.parceiroObservacoes)
            : null,
    };

    if (mode === "fromLead") {
        return base;
    }

    return {
        ...base,
        contract_status: values.contractStatus,
        cota_situacao: values.cotaSituacao,
    };
}