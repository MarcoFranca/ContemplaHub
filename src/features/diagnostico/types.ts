// Tipos do Diagnóstico do Investidor (funil público de captura + diagnóstico).
// Nicho: MÉDICO. Motor determinístico em engine.ts. Todos os números são estimativas.

export type EstadoCivil = "solteiro" | "casado" | "divorciado" | "viuvo";
export type RegimeId = "clt" | "autonomo" | "concursado";
export type AtuacaoId = "plantonista" | "residente" | "especialista" | "socio";
export type MomentoId = "reduzindo" | "consultorio_consolidado" | "crescendo_consultorio" | "residente";

export const ESTADO_CIVIL_OPCOES: { id: EstadoCivil; label: string }[] = [
    { id: "solteiro", label: "Solteiro(a)" },
    { id: "casado", label: "Casado(a) ou união estável" },
    { id: "divorciado", label: "Divorciado(a)" },
    { id: "viuvo", label: "Viúvo(a)" },
];

export const REGIME_OPCOES: { id: RegimeId; label: string }[] = [
    { id: "clt", label: "CLT" },
    { id: "autonomo", label: "Autônomo" },
    { id: "concursado", label: "Concursado" },
];

export const ATUACAO_OPCOES: { id: AtuacaoId; label: string }[] = [
    { id: "plantonista", label: "Plantonista" },
    { id: "residente", label: "Residente" },
    { id: "especialista", label: "Médico especialista" },
    { id: "socio", label: "Sócio de clínica / consultório" },
];

export const MOMENTO_OPCOES: { id: MomentoId; label: string }[] = [
    { id: "reduzindo", label: "Já reduzindo plantões ou perto de parar" },
    { id: "consultorio_consolidado", label: "Consultório consolidado" },
    { id: "crescendo_consultorio", label: "Crescendo consultório" },
    { id: "residente", label: "Residente" },
];

export const OBJETIVOS = [
    { id: "diminuir_plantoes", label: "Diminuir a carga de plantões" },
    { id: "consultorio", label: "Comprar meu consultório ou sala" },
    { id: "proteger", label: "Proteger meu patrimônio já construído" },
    { id: "clinica", label: "Montar ou expandir minha clínica" },
    { id: "aposentar", label: "Aposentar sem depender do INSS" },
    { id: "renda_aluguel", label: "Gerar renda de aluguel ou Airbnb" },
    { id: "diversificar", label: "Diversificar o que já tenho" },
    { id: "primeiro_imovel", label: "Comprar meu primeiro imóvel" },
] as const;

export type ObjetivoId = (typeof OBJETIVOS)[number]["id"];

export type DiagnosticoInputs = {
    // Etapa 1 — quem é você
    nome: string;
    whatsapp: string;
    estado: string;
    email?: string | null;
    especialidade?: string | null;
    estado_civil: EstadoCivil;
    tem_filhos: boolean;
    idade_filhos?: string | null;

    // Etapa 2 — momento na carreira
    regime: RegimeId[]; // múltipla
    atuacao: AtuacaoId; // única
    momento_carreira: MomentoId[]; // até 3
    objetivos: ObjetivoId[]; // até 3

    // Etapa 3 — situação patrimonial
    possui_imovel_quitado: boolean;
    possui_cnpj: boolean;
    possui_holding: boolean;

    // Etapa 4 — capacidade financeira (R$)
    renda_mensal: number;
    custo_vida: number;
    aporte_mensal: number;
    capital_disponivel: number;
    patrimonio_atual: number;
    renda_passiva_atual: number;
    renda_passiva_desejada: number;
    plantoes_mes?: number | null;
    pct_imoveis_atual?: number | null;
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
        custo_coberto_pct: number;
        piso_ideal_pct: number;
        motor_ideal_pct: number;
    };
    meta: {
        renda_passiva_desejada: number;
        cobertura_meta_pct_5a: number;
        cobertura_meta_pct_10a: number;
    };
    plantoes: {
        valor_plantao: number;
        substituidos_10a: number; // quantos plantões/mês a renda passiva projetada substitui
    };
    alocacao: {
        atual: Alocacao;
        ideal: Alocacao;
        ajustes: string[];
    };
    independencia: {
        renda_passiva_10a: number; // R$/mês
        cobertura_pct_5a: number; // vs custo de vida
        cobertura_pct_10a: number;
    };
    projecao: {
        serie: PontoSerie[];
        patrimonio_10a_estrategia: number;
        patrimonio_10a_cdi: number;
        delta: number;
    };
    produtos: ProdutoDiagnostico[];
    plano: PlanoPasso[];
    recomendado: { titulo: string; descricao: string };
    custo_vida: number;
    premissas: { cdi_aa: number; estrategia_aa: number; yield_aluguel_aa: number };
};
