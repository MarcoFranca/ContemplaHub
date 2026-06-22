import type { ComissaoLancamento, ComissaoResumo } from "../comissoes/types";

export type Parceiro = {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  ativo: boolean;
  cpf_cnpj?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PartnerUser = {
  id: string;
  parceiro_id: string;
  email: string;
  nome?: string | null;
  telefone?: string | null;

  ativo: boolean;

  invite_sent_at?: string | null;
  access_enabled_at?: string | null;
  last_login_at?: string | null;

  disabled_at?: string | null;
  disabled_reason?: string | null;

  can_view_client_data: boolean;
  can_view_contracts: boolean;
  can_view_commissions: boolean;
};

export type ParceiroWithAccess = Parceiro & {
  partner_user?: PartnerUser;
};

export type ParceiroExtratoResponse = {
  ok: boolean;
  parceiro: Parceiro;
  items: ComissaoLancamento[];
  resumo: ComissaoResumo | null;
};

export type ParceiroRankingItem = {
  parceiro_id: string;
  nome: string;
  vendas: number;
  volume_cartas: string;
  total_cotas: number;
  cotas_canceladas: number;
  taxa_cancelamento: string;
  repasse_pago: string;
  repasse_pendente: string;
};

export type ParceirosRankingResponse = {
  ok: boolean;
  items: ParceiroRankingItem[];
  competencia_de: string | null;
  competencia_ate: string | null;
};