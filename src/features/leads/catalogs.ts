export type ProdutoTipo = "imobiliario" | "auto";

export const objetivosImobiliario = [
    { v: "primeira-casa", l: "Primeira casa" },
    { v: "upgrade-moradia", l: "Upgrade da moradia" },
    { v: "terreno", l: "Comprar terreno" },
    { v: "construcao", l: "Construir" },
    { v: "reforma", l: "Reforma" },
    { v: "segunda-moradia", l: "Segunda moradia" },
    { v: "quitacao", l: "Quitar imóvel atual" },
    { v: "sala-comercial", l: "Sala/comercial" },
    { v: "renda-airbnb", l: "Renda com temporada (Airbnb)" },
    { v: "renda-aluguel", l: "Renda com aluguel longo prazo" },
    { v: "diversificacao", l: "Diversificação patrimonial" },
    { v: "protecao-patrimonial", l: "Proteção patrimonial" },
] as const;

export const objetivosAuto = [
    { v: "primeiro-carro", l: "Primeiro carro" },
    { v: "upgrade-carro", l: "Upgrade do carro" },
    { v: "utilitario", l: "Utilitário/Trabalho" },
    { v: "frota-pj", l: "Frota PJ" },
    { v: "moto", l: "Moto" },
    { v: "veiculo-premium", l: "Veículo premium" },
    { v: "veiculo-acessibilidade", l: "Veículo com acessibilidade" },
] as const;

export const objetivosByProduto = (p: ProdutoTipo) =>
    p === "imobiliario" ? [...objetivosImobiliario] : [...objetivosAuto];

/** PERFIS com descrição curta para o combobox */
export const PERFIS = [
    {
        v: "disciplinado-acumulador",
        l: "Disciplinado Acumulador",
        d: "Planejamento rígido e foco em patrimônio de longo prazo.",
    },
    {
        v: "sonhador-familiar",
        l: "Sonhador Familiar",
        d: "Prioriza estabilidade da família e segurança do lar.",
    },
    {
        v: "corporativo-racional",
        l: "Corporativo Racional (PJ)",
        d: "Empresário que pensa em fluxo de caixa e blindagem.",
    },
    {
        v: "impulsivo-emocional",
        l: "Impulsivo Emocional (guiado)",
        d: "Gosta de rapidez, precisa de rota e disciplina.",
    },
    {
        v: "estrategico-oportunista",
        l: "Estratégico Oportunista",
        d: "Busca vantagens, timings e condições exclusivas.",
    },
    { v: "conservador", l: "Conservador", d: "Baixa tolerância a risco." },
    { v: "moderado", l: "Moderado", d: "Equilíbrio entre risco e retorno." },
    { v: "arrojado", l: "Arrojado", d: "Maior risco por mais retorno." },
] as const;
