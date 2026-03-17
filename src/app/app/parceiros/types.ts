export type PixTipo = "cpf" | "cnpj" | "email" | "telefone" | "aleatoria";

export type Parceiro = {
  id: string;
  org_id?: string;
  nome: string;
  cpf_cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  pix_tipo?: PixTipo | null;
  pix_chave?: string | null;
  ativo: boolean;
  observacoes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ParceiroExtratoItem = {
  id: string;
  contrato_id?: string | null;
  cota_id?: string | null;
  competencia_prevista?: string | null;
  competencia_real?: string | null;
  valor_bruto: number;
  valor_imposto: number;
  valor_liquido: number;
  status: "previsto" | "disponivel" | "pago" | "cancelado";
  repasse_status: "pendente" | "pago" | "cancelado";
  repasse_previsto_em?: string | null;
  repasse_pago_em?: string | null;
  observacoes?: string | null;
};

export type ParceiroExtratoResponse = {
  parceiro: Parceiro;
  items: ParceiroExtratoItem[];
  resumo?: {
    total_bruto?: number;
    total_imposto?: number;
    total_liquido?: number;
    pendente_repasse?: number;
    pago_repasse?: number;
  } | null;
};
