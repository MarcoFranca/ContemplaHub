export type AdminOption = { id: string; nome: string };

export type LanceFixoOpcaoForm = {
    id: string;
    percentual: string;
    ordem: number;
    ativo: boolean;
    observacoes: string;
};

export type ProposalScenario = {
    id?: string;
    titulo?: string | null;
    produto?: "imobiliario" | "auto" | "outro" | null;
    administradora?: string | null;
    valor_carta?: number | null;
    prazo_meses?: number | null;
    parcela_reduzida?: number | null;
    parcela_cheia?: number | null;
    redutor_percent?: number | null;
    fundo_reserva_pct?: number | null;
    taxa_admin_anual?: number | null;
    taxa_admin_total?: number | null;
    lance_fixo_pct_1?: number | null;
    lance_fixo_pct_2?: number | null;
    permite_lance_embutido?: boolean | null;
    lance_embutido_pct_max?: number | null;
    seguro_prestamista?: boolean | null;
    com_redutor?: boolean | null;
    observacoes?: string | null;
};

export type LeadProposalListItem = {
    id: string;
    titulo: string | null;
    campanha: string | null;
    status: string | null;
    created_at: string | null;
    public_hash: string | null;
    payload?: {
        propostas?: ProposalScenario[];
    } | null;
};

export type ContractFormState = {
    administradoraId: string;
    numeroCota: string;
    grupoCodigo: string;
    produto: string;
    valorCarta: string;
    prazo: string;
    valorParcela: string;
    formaPagamento: string;
    indiceCorrecao: string;
    dataAdesao: string;
    dataAssinatura: string;
    numero: string;

    parcelaReduzida: boolean;
    autorizacaoGestao: boolean;
    fgtsPermitido: boolean;
    embutidoPermitido: boolean;
};

export const EMPTY_CONTRACT_FORM: ContractFormState = {
    administradoraId: "",
    numeroCota: "",
    grupoCodigo: "",
    produto: "imobiliario",
    valorCarta: "",
    prazo: "",
    valorParcela: "",
    formaPagamento: "",
    indiceCorrecao: "",
    dataAdesao: "",
    dataAssinatura: "",
    numero: "",
    parcelaReduzida: false,
    autorizacaoGestao: false,
    fgtsPermitido: false,
    embutidoPermitido: false,
};