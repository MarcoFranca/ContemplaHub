export type ComissaoStatus = "previsto" | "disponivel" | "pago" | "cancelado";
export type RepasseStatus = "nao_aplicavel" | "pendente" | "pago" | "cancelado";
export type BeneficiarioTipo = "empresa" | "parceiro";
export type ComissaoEvento = "adesao" | "primeira_cobranca_valida" | "proxima_cobranca" | "contemplacao" | "manual";

export type ComissaoLancamento = {
  id: string;
  contrato_id: string;
  cota_id: string;
  cota_comissao_config_id?: string | null;
  regra_id?: string | null;
  parceiro_id?: string | null;
  beneficiario_tipo: BeneficiarioTipo;
  tipo_evento: ComissaoEvento;
  ordem: number;
  competencia_prevista?: string | null;
  competencia_real?: string | null;
  percentual_base: number | string;
  valor_base: number | string;
  valor_bruto: number | string;
  imposto_pct: number | string;
  valor_imposto: number | string;
  valor_liquido: number | string;
  status: ComissaoStatus;
  liberado_por_evento_em?: string | null;
  pago_em?: string | null;
  repasse_status: RepasseStatus;
  repasse_previsto_em?: string | null;
  repasse_pago_em?: string | null;
  repasse_observacoes?: string | null;
  observacoes?: string | null;
  parceiros_corretores?: {
    id: string;
    nome?: string | null;
  } | null;
};

export type ComissaoResumo = {
  total_lancamentos: number;
  total_bruto_empresa: number | string;
  total_bruto_parceiros: number | string;
  total_liquido_parceiros: number | string;
  total_impostos_parceiros: number | string;
  repasses_pendentes: number;
  repasses_pagos: number;
};

export type ComissaoFilters = {
  parceiro_id?: string;
  contrato_id?: string;
  cota_id?: string;
  status?: ComissaoStatus | "";
  repasse_status?: RepasseStatus | "";
  competencia_de?: string;
  competencia_ate?: string;
};

export type ComissaoLancamentosResponse = {
  items: ComissaoLancamento[];
  resumo: ComissaoResumo | null;
};

export type ParceiroOption = {
  id: string;
  nome: string;
};

export type CompetenciaStatus =
    | "prevista"
    | "sem_boleto"
    | "aguardando_pagamento"
    | "paga_sem_assembleia"
    | "elegivel_comissao"
    | "cancelada";

export type CotaPagamentoCompetencia = {
  id: string;
  contrato_id: string;
  cota_id: string;
  competencia: string;
  tem_boleto: boolean;
  boleto_previsto_em?: string | null;
  boleto_valor?: number | string | null;
  pagamento_id?: string | null;
  pago: boolean;
  pago_em?: string | null;
  valor_pago?: number | string | null;
  vencimento?: string | null;
  pago_no_prazo?: boolean | null;
  participou_assembleia?: boolean | null;
  motivo_nao_participacao?: string | null;
  gera_comissao: boolean;
  status: CompetenciaStatus;
};

export type CompetenciasContratoResponse = {
  ok: boolean;
  contrato: Record<string, unknown>;
  items: CotaPagamentoCompetencia[];
  total: number;
};

export type ResumoFinanceiroContratoResponse = {
  ok: boolean;
  contrato: Record<string, unknown>;
  totais: {
    total_bruto: string;
    total_imposto: string;
    total_liquido: string;
    empresa: {
      bruto: string;
      liquido: string;
    };
    parceiro: {
      bruto: string;
      imposto: string;
      liquido: string;
    };
  };
  quantidades: {
    lancamentos: number;
    por_status: Record<string, number>;
    por_repasse_status: Record<string, number>;
  };
  items: ComissaoLancamento[];
};

export type TimelineContratoItem = {
  tipo: "pagamento" | "competencia" | "lancamento_comissao";
  titulo: string;
  data_ref?: string | null;
  timestamp?: string | null;
  payload: Record<string, unknown>;
};

export type TimelineContratoResponse = {
  ok: boolean;
  contrato: Record<string, unknown>;
  items: TimelineContratoItem[];
  total: number;
};