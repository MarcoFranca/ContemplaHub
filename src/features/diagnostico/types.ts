// Tipos do Diagnóstico do Investidor (funil público de captura + diagnóstico).
// Motor determinístico — ver engine.ts. Todos os números são ESTIMATIVAS/projeções.

export type Profissao = "clt" | "servidor" | "empresario" | "liberal" | "outro";

export const OBJETIVOS = [
    { id: "primeiro_imovel", label: "Comprar meu primeiro imóvel" },
    { id: "renda_passiva", label: "Gerar renda passiva (aluguel/Airbnb)" },
    { id: "construir_vender", label: "Construir e vender com lucro" },
    { id: "diversificar", label: "Diversificar meu patrimônio" },
    { id: "proteger", label: "Proteger meu patrimônio" },
    { id: "aposentar", label: "Me aposentar de forma tranquila" },
    { id: "liberdade", label: "Sair do CLT / liberdade financeira" },
] as const;

export type ObjetivoId = (typeof OBJETIVOS)[number]["id"];

export type DiagnosticoInputs = {
    // Etapa 1 — quem é você
    nome: string;
    whatsapp: string;
    estado: string;
    email?: string | null;

    // Etapa 2 — momento de vida
    idade: number;
    profissao: Profissao;
    objetivos: ObjetivoId[];
    possui_imovel_quitado: boolean;
    possui_terreno: boolean;

    // Etapa 3 — capacidade financeira (valores em R$)
    renda_mensal: number;
    aporte_mensal: number;
    custo_vida: number;
    capital_disponivel: number;
    patrimonio_atual: number;
    renda_passiva_atual: number;
    pct_imoveis_atual?: number | null; // 0-100 (opcional)
};

export type Alocacao = {
    imoveis: number;
    renda_fixa: number;
    renda_variavel: number;
    equity: number;
    outros: number;
};

export type ProdutoStatus = "apto" | "bloqueado";

export type ProdutoDiagnostico = {
    key: string;
    nome: string;
    subtitulo: string;
    descricao: string;
    status: ProdutoStatus;
    destrave?: string;
};

export type PlanoPasso = {
    ordem: number;
    titulo: string;
    descricao: string;
    destaque?: boolean;
};

export type PontoSerie = { ano: number; cdi: number; estrategia: number };

export type DiagnosticoResultado = {
    estagio: {
        nivel: number; // 1..5
        nome: string;
        produtos_liberados: number;
    };
    saude: {
        score: number; // 0..100
        status: "balanceada" | "desbalanceada";
        custo_coberto_pct: number; // RF + aluguéis vs custo (hoje)
        piso_ideal_pct: number; // 85
        motor_ideal_pct: number; // 15
    };
    alocacao: {
        atual: Alocacao;
        ideal: Alocacao;
        ajustes: string[];
    };
    independencia: {
        renda_passiva_10a: number; // R$/mês
        cobertura_pct_5a: number;
        cobertura_pct_10a: number;
    };
    projecao: {
        serie: PontoSerie[];
        patrimonio_10a_estrategia: number;
        patrimonio_10a_cdi: number;
        delta: number; // estrategia - cdi
    };
    produtos: ProdutoDiagnostico[];
    plano: PlanoPasso[];
    recomendado: { titulo: string; descricao: string };
    custo_vida: number;
    // premissas usadas (transparência)
    premissas: { cdi_aa: number; estrategia_aa: number; yield_aluguel_aa: number };
};
