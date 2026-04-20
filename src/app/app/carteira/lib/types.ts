export type ClienteSort =
    | "entrada_desc"
    | "nome_asc"
    | "total_desc"
    | "qtd_cartas_desc"
    | "maior_carta_desc";

export type CarteiraFilters = {
    include_all?: boolean;
    produto?: string | null;
    q?: string | null;
    status_carteira?: string | null;
    sort?: ClienteSort | null;
};

export type LeadRow = {
    id: string;
    nome: string | null;
    telefone: string | null;
    email: string | null;
    etapa: string | null;
};

export type UltimoLanceRow = {
    id: string;
    cota_id: string | null;
    tipo: string | null;
    percentual: number | null;
    valor: number | null;
    assembleia_data: string | null;
    created_at?: string | null;
};

export type CarteiraRow = {
    id: string;
    org_id: string;
    lead_id: string;
    status: string;
    origem_entrada: string;
    entered_at: string | null;
    observacoes: string | null;
};

export type CotaRow = {
    id: string;
    org_id: string | null;
    lead_id: string | null;
    administradora_id: string | null;
    numero_cota: string | null;
    grupo_codigo: string | null;
    produto: string | null;
    valor_carta: number | null;
    valor_parcela: number | null;
    prazo: number | null;
    assembleia_dia: number | null;
    situacao: string | null;
    fgts_permitido: boolean | null;
    embutido_permitido: boolean | null;
    embutido_max_percent: number | null;
    parcela_reduzida: boolean | null;
    data_ultimo_lance: string | null;
    autorizacao_gestao: boolean | null;
    created_at?: string | null;
};

export type ContratoRow = {
    id: string;
    org_id: string | null;
    cota_id: string | null;
    numero: string | null;
    status: string | null;
    data_assinatura: string | null;
    data_pagamento: string | null;
    data_alocacao: string | null;
    data_contemplacao: string | null;
    created_at?: string | null;
};

export type AdministradoraRow = {
    id: string;
    nome: string | null;
};

export type CarteiraClienteCartaResumo = {
    cota_id: string;
    numero_cota: string | null;
    grupo_codigo: string | null;
    produto: string | null;
    valor_carta: number | null;
    valor_parcela: number | null;
    prazo: number | null;
    assembleia_dia: number | null;
    situacao: string | null;
    fgts_permitido: boolean | null;
    embutido_permitido: boolean | null;
    embutido_max_percent: number | null;
    parcela_reduzida: boolean | null;
    administradora: string | null;
    parceiro_nome?: string | null;
    ultimo_lance?: {
        data: string | null;
        tipo: string | null;
        percentual: number | null;
        valor: number | null;
    } | null;
    status_contrato: string | null;
};

export type CarteiraClienteItem = {
    cliente: {
        carteira_id: string;
        lead_id: string;
        nome: string | null;
        telefone: string | null;
        email: string | null;
        etapa: string | null;
        status_carteira: string;
        origem_entrada: string;
        entered_at: string | null;
        observacoes: string | null;
    };
    resumo: {
        qtd_cartas: number;
        possui_contrato: boolean;
        status_contrato_mais_recente: string | null;
        valor_total_cartas: number | null;
        maior_carta_valor: number | null;
    };
    cartas: CarteiraClienteCartaResumo[];
};

export type CarteiraCartaItem = {
    cliente: {
        lead_id: string;
        nome: string | null;
        telefone: string | null;
        email: string | null;
    };
    carteira: {
        carteira_id: string;
        status_carteira: string;
        origem_entrada: string;
        entered_at: string | null;
    };
    cota: {
        cota_id: string;
        numero_cota: string | null;
        grupo_codigo: string | null;
        produto: string | null;
        valor_carta: number | null;
        valor_parcela: number | null;
        prazo: number | null;
        assembleia_dia: number | null;
        situacao: string | null;
        fgts_permitido: boolean | null;
        embutido_permitido: boolean | null;
        embutido_max_percent: number | null;
        parcela_reduzida: boolean | null;
        data_ultimo_lance: string | null;
        administradora: string | null;
        autorizacao_gestao: boolean | null;
        parceiro_nome?: string | null;
        ultimo_lance?: {
            data: string | null;
            tipo: string | null;
            percentual: number | null;
            valor: number | null;
        } | null;
    };
    contrato: {
        contrato_id: string | null;
        numero: string | null;
        status: string | null;
        data_assinatura: string | null;
        data_pagamento: string | null;
        data_alocacao: string | null;
        data_contemplacao: string | null;
    };
};

export type CarteiraClientesResponse = {
    items: CarteiraClienteItem[];
    total: number;
};

export type CarteiraCartasResponse = {
    items: CarteiraCartaItem[];
    total: number;
};

export type CarteiraUniverse = {
    carteiraRows: CarteiraRow[];
    leadsMap: Map<string, LeadRow>;
    cotasByLead: Map<string, CotaRow[]>;
    latestContratoByCota: Map<string, ContratoRow>;
    latestLanceByCota: Map<string, UltimoLanceRow>;
    administradorasMap: Map<string, AdministradoraRow>;
};
