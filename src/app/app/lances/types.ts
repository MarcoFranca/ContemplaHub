export type StatusCota = "ativa" | "contemplada" | "cancelada";
export type StatusMes =
    | "pendente"
    | "planejado"
    | "feito"
    | "sem_lance"
    | "contemplada"
    | "cancelada";

export type Produto = "imobiliario" | "auto";

export type LanceCartaListItem = {
    cota_id: string;
    lead_id?: string | null;
    cliente_nome?: string | null;
    administradora_id?: string | null;
    administradora_nome?: string | null;
    produto: Produto;
    grupo_codigo: string;
    numero_cota: string;
    valor_carta?: number | null;
    valor_parcela?: number | null;
    prazo?: number | null;
    status: StatusCota;
    autorizacao_gestao: boolean;
    embutido_permitido: boolean;
    embutido_max_percent?: number | null;
    fgts_permitido: boolean;
    tipo_lance_preferencial?: string | null;
    opcoes_lance_fixo?: CotaLanceFixoOpcao[];
    estrategia?: string | null;
    assembleia_dia_origem?: string | null;
    assembleia_dia?: number | null;
    assembleia_prevista?: string | null;
    competencia: string;
    status_mes: StatusMes;
    tem_pendencia_configuracao: boolean;
};

export type LanceCartaListResponse = {
    items: LanceCartaListItem[];
    page: number;
    page_size: number;
    total: number;
};

export type LancesCartaDetalhe = {
    cota: {
        id: string;
        status: StatusCota;
        produto: Produto;
        grupo_codigo: string;
        numero_cota: string;
        valor_carta?: number | null;
        valor_parcela?: number | null;
        prazo?: number | null;
        objetivo?: string | null;
        estrategia?: string | null;
        tipo_lance_preferencial?: string | null;
        autorizacao_gestao: boolean;
        embutido_permitido: boolean;
        embutido_max_percent?: number | null;
        fgts_permitido: boolean;
        assembleia_dia?: number | null;
        data_ultimo_lance?: string | null;
    };
    lead?: {
        id: string;
        nome?: string | null;
        telefone?: string | null;
        email?: string | null;
    } | null;
    administradora?: {
        id: string;
        nome?: string | null;
    } | null;
    regra_assembleia: {
        origem?: string | null;
        produto?: string | null;
        dia_base_assembleia?: number | null;
        ajustar_fim_semana?: boolean | null;
        tipo_ajuste?: string | null;
        assembleia_prevista?: string | null;
    };
    controle_mes_atual: {
        id?: string | null;
        competencia: string;
        status_mes: StatusMes;
        lance_id?: string | null;
        observacoes?: string | null;
    };
    historico_lances: Array<{
        id: string;
        assembleia_data?: string | null;
        tipo?: string | null;
        percentual?: number | null;
        valor?: number | null;
        origem?: string | null;
        resultado?: string | null;
        pagamento?: Record<string, unknown> | null;
        created_at?: string | null;
    }>;
    contemplacao?: {
        id: string;
        motivo: string;
        lance_percentual?: number | null;
        data: string;
    } | null;
    diagnostico?: {
        estrategia_lance?: string | null;
        lance_base_pct?: number | null;
        lance_max_pct?: number | null;
        readiness_score?: number | null;
    } | null;
    opcoes_lance_fixo?: CotaLanceFixoOpcao[];
};

export type CotaLanceFixoOpcao = {
    id: string;
    cota_id: string;
    percentual: number;
    ordem: number;
    ativo: boolean;
    observacoes?: string | null;
    created_at?: string | null;
};

export type LancesFiltersInput = {
    competencia: string;
    status_cota?: string;
    administradora_id?: string;
    produto?: string;
    somente_autorizadas?: boolean;
    q?: string;
    page?: number;
    page_size?: number;
};

export type RegraOperadora = {
    id: string;
    org_id: string;
    administradora_id: string;
    administradora_nome?: string | null;
    produto?: string | null;
    dia_base_assembleia: number;
    ajustar_fim_semana: boolean;
    tipo_ajuste: string;
    observacoes?: string | null;
    created_at?: string | null;
};