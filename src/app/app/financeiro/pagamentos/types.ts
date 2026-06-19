import type { ComissaoLancamento, ResumoFinanceiroContratoResponse, TimelineContratoResponse } from "@/app/app/comissoes/types";
import type {
    ComissaoEvento,
    CotaComissaoResponse,
    ParceiroSelectOption,
} from "@/app/app/lances/types";

export type PagamentoStatus =
    | "previsto"
    | "emitido"
    | "pago"
    | "atrasado"
    | "inadimplente"
    | "cancelado";

export type FinanceiroContratoOption = {
    selection_id: string;
    tem_contrato: boolean;
    contrato_id: string;
    contrato_numero?: string | null;
    contrato_status?: string | null;
    cota_status?: string | null;
    cota_id?: string | null;
    lead_id?: string | null;
    numero_cota?: string | null;
    grupo_codigo?: string | null;
    valor_carta?: string | number | null;
    cliente_nome?: string | null;
    administradora_nome?: string | null;
    possui_comissao_ativa: boolean;
    percentual_comissao?: string | number | null;
    modo_comissao?: string | null;
    parceiro_vinculado: boolean;
    parceiro_nome?: string | null;
    parceiro_percentual?: string | number | null;
};

export type PagamentoItem = {
    id: string;
    contrato_id: string;
    competencia: string;
    valor: string;
    vencimento?: string | null;
    status: PagamentoStatus;
    pago_em?: string | null;
    observacoes?: string | null;
    referencia?: string | null;
    origem?: string | null;
    tipo?: string | null;
    cota_id?: string | null;
    contrato_numero?: string | null;
    numero_cota?: string | null;
    grupo_codigo?: string | null;
    cliente_nome?: string | null;
    competencia_id?: string | null;
    competencia_status?: string | null;
    gera_comissao?: boolean | null;
    participou_assembleia?: boolean | null;
    lancamentos_total?: number;
    lancamentos_previstos?: number;
    lancamentos_disponiveis?: number;
    lancamentos_pagos?: number;
    lancamentos_cancelados?: number;
    repasses_pendentes?: number;
};

export type PagamentoListResponse = {
    ok: boolean;
    items: PagamentoItem[];
    total: number;
};

export type PagamentoProcessamentoFeedback = {
    pagamentoId?: string;
    contratoId?: string;
    competenciaId?: string;
    competenciaStatus?: string;
    lancamentoId?: string;
    lancamentoStatus?: string;
    comissaoGerada: boolean;
    comissaoBloqueada: boolean;
    comissaoCancelada: boolean;
};

export type PagamentoActionState = {
    ok: boolean;
    error?: string;
    message?: string;
    item?: PagamentoItem;
    processing?: PagamentoProcessamentoFeedback;
};

export type RecebimentoComissaoTipo = "avista" | "linear" | "variavel";

export type FinanceiroProjectionResponse = {
    ok: boolean;
    projection_only?: boolean;
    detail?: string;
    lancamentos?: ComissaoLancamento[];
    resumo?: Record<string, unknown> | null;
    existing_lancamentos?: Array<Record<string, unknown>>;
};

export type FinanceiroComissaoWorkspaceData = {
    contratos: FinanceiroContratoOption[];
    selectedContratoId: string;
    contratoSelecionado: FinanceiroContratoOption | null;
    comissaoAtual: CotaComissaoResponse | null;
    parceirosDisponiveis: ParceiroSelectOption[];
    resumoFinanceiro: ResumoFinanceiroContratoResponse | null;
    timeline: TimelineContratoResponse | null;
    lancamentos: ComissaoLancamento[];
    pagamentos: PagamentoItem[];
};

export type FinanceiroComissaoActionResult = {
    ok: boolean;
    message?: string;
    error?: string;
    comissao?: CotaComissaoResponse | null;
    projection?: FinanceiroProjectionResponse | null;
};

export type FinanceiroContratoNumeroResult = {
    ok: boolean;
    message?: string;
    error?: string;
    contrato_numero?: string;
};

export type FinanceiroCronogramaPersistResult = {
    ok: boolean;
    message?: string;
    error?: string;
    pagamentos_processados?: number;
    pagamentos_criados?: number;
    pagamentos_atualizados?: number;
    pagamentos_cancelados?: number;
};

export type FinanceiroPagamentoOperacaoResult = {
    ok: boolean;
    message?: string;
    error?: string;
    pagamento_id?: string;
    pagamentos_afetados?: number;
};

export type FinanceiroCronogramaPreviewItem = {
    ordem: number;
    tipo_evento: ComissaoEvento;
    offset_meses: number;
    percentual_comissao: number;
    valor_total: number;
    parceiro_bruto: number;
    parceiro_imposto: number;
    parceiro_liquido: number;
    empresa_liquida: number;
};
