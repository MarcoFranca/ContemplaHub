import type {
    ContratoFormMode,
    ContratoFormValues,
} from "../types/contrato-form.types";

function emptyToNull(value?: string | null) {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
}

function numberToBackendMoneyString(value?: number | null) {
    if (value == null || Number.isNaN(value)) return null;

    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function numberToBackendPercentString(value?: number | null) {
    if (value == null || Number.isNaN(value)) return null;
    return value.toFixed(4);
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

        valor_carta: numberToBackendMoneyString(values.valorCarta),
        prazo: values.prazo,
        valor_parcela: numberToBackendMoneyString(values.valorParcela),
        taxa_admin_percentual: numberToBackendPercentString(values.taxaAdminPercentual),
        taxa_admin_valor_mensal: numberToBackendMoneyString(values.taxaAdminValorMensal),
        fundo_reserva_percentual: numberToBackendPercentString(
            values.fundoReservaPercentual
        ),
        fundo_reserva_valor_mensal: numberToBackendMoneyString(
            values.fundoReservaValorMensal
        ),
        seguro_prestamista_ativo: values.seguroPrestamistaAtivo,
        seguro_prestamista_percentual: values.seguroPrestamistaAtivo
            ? numberToBackendPercentString(values.seguroPrestamistaPercentual)
            : null,
        seguro_prestamista_valor_mensal: values.seguroPrestamistaAtivo
            ? numberToBackendMoneyString(values.seguroPrestamistaValorMensal)
            : null,
        taxa_admin_antecipada_ativo: values.taxaAdminAntecipadaAtivo,
        taxa_admin_antecipada_percentual: values.taxaAdminAntecipadaAtivo
            ? numberToBackendPercentString(values.taxaAdminAntecipadaPercentual)
            : null,
        taxa_admin_antecipada_forma_pagamento: values.taxaAdminAntecipadaAtivo
            ? values.taxaAdminAntecipadaFormaPagamento ?? null
            : null,
        taxa_admin_antecipada_parcelas: values.taxaAdminAntecipadaAtivo
            ? values.taxaAdminAntecipadaFormaPagamento === "avista"
                ? 1
                : values.taxaAdminAntecipadaParcelas ?? null
            : null,
        taxa_admin_antecipada_valor_total: values.taxaAdminAntecipadaAtivo
            ? numberToBackendMoneyString(values.taxaAdminAntecipadaValorTotal)
            : null,
        taxa_admin_antecipada_valor_parcela: values.taxaAdminAntecipadaAtivo
            ? numberToBackendMoneyString(values.taxaAdminAntecipadaValorParcela)
            : null,
        data_adesao: emptyToNull(values.dataAdesao),
        assembleia_dia: values.assembleiaDia ?? null,
        observacoes: emptyToNull(values.observacoes),

        numero_contrato: emptyToNull(values.numeroContrato),
        data_assinatura: emptyToNull(values.dataAssinatura),

        parcela_reduzida: values.parcelaReduzida,
        fgts_permitido: values.fgtsPermitido,
        embutido_permitido: values.embutidoPermitido,
        autorizacao_gestao: values.autorizacaoGestao,
        opcoes_lance_fixo: values.opcoesLanceFixo
            .filter((item) => item.ativo && item.percentual != null)
            .map((item) => ({
                id: item.id ?? null,
                ordem: item.ordem,
                percentual: item.percentual,
                ativo: item.ativo,
                observacoes: emptyToNull(item.observacoes),
            })),

        percentual_comissao: numberToBackendPercentString(values.percentualComissao),
        imposto_retido_pct: numberToBackendPercentString(
            values.impostoRetidoPct ?? 10
        ),
        comissao_observacoes: emptyToNull(values.comissaoObservacoes),

        parceiro_id: hasPartner ? values.parceiroId : null,
        repasse_percentual_comissao:
            hasPartner && values.repassePercentualComissao != null
                ? numberToBackendPercentString(values.repassePercentualComissao)
                : null,
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
