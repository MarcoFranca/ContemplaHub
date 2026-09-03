// Motor determinístico do Diagnóstico do Investidor.
// TODAS as saídas são ESTIMATIVAS/projeções — a validação final é feita com um humano.
// As constantes abaixo são o "dial" para lapidar o modelo depois.

import type {
    Alocacao,
    DiagnosticoInputs,
    DiagnosticoResultado,
    PlanoPasso,
    PontoSerie,
    ProdutoDiagnostico,
} from "./types";

// ── Premissas (ajustáveis) ────────────────────────────────────────────────
const CDI_AA = 0.105; // 10,5% a.a.
const ESTRATEGIA_AA = 0.17; // carteira alavancada (imóveis + consórcio + RV)
const YIELD_ALUGUEL_AA = 0.072; // 7,2% a.a. (aluguel/Airbnb sobre patrimônio imobiliário)
const YIELD_ALUGUEL_MES = YIELD_ALUGUEL_AA / 12;

// piso (segurança) vs motor (crescimento) — tese fixa
const PISO_IDEAL = 85;
const MOTOR_IDEAL = 15;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const round = (v: number, casas = 0) => {
    const f = 10 ** casas;
    return Math.round(v * f) / f;
};
const n = (v: unknown) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
};

// Valor futuro: principal composto + aporte anual (anuidade ordinária, comp. anual)
function fv(principal: number, aporteMensal: number, r: number, anos: number) {
    const aporteAnual = aporteMensal * 12;
    const cresc = (1 + r) ** anos;
    const anuidade = r === 0 ? aporteAnual * anos : aporteAnual * ((cresc - 1) / r);
    return principal * cresc + anuidade;
}

const ESTAGIOS = [
    { nivel: 1, nome: "Iniciante" },
    { nivel: 2, nome: "Construtor" },
    { nivel: 3, nome: "Acelerador" },
    { nivel: 4, nome: "Multiplicador" },
    { nivel: 5, nome: "Sênior" },
];

function calcEstagio(inp: DiagnosticoInputs) {
    // "capital de manobra" combinando patrimônio, caixa e capacidade de aporte
    const pontos = n(inp.patrimonio_atual) + n(inp.capital_disponivel) + n(inp.aporte_mensal) * 60;
    let nivel = 1;
    if (pontos >= 5_000_000) nivel = 5;
    else if (pontos >= 1_500_000) nivel = 4;
    else if (pontos >= 500_000) nivel = 3;
    else if (pontos >= 100_000) nivel = 2;
    else nivel = 1;
    return ESTAGIOS[nivel - 1];
}

function alocacaoIdeal(inp: DiagnosticoInputs): Alocacao {
    // base da tese
    let imoveis = 66;
    let renda_fixa = 26;
    let renda_variavel = 8;
    let equity = 0;

    if (inp.objetivos.includes("proteger")) {
        renda_fixa += 4;
        renda_variavel -= 2;
        imoveis -= 2;
    }
    if (inp.objetivos.includes("diversificar")) {
        renda_variavel += 3;
        imoveis -= 3;
    }
    if (inp.profissao === "empresario") {
        equity += 3;
        imoveis -= 3;
    }
    // idade mais alta → mais segurança
    if (inp.idade >= 55) {
        renda_fixa += 4;
        renda_variavel -= 2;
        imoveis -= 2;
    }
    imoveis = clamp(imoveis, 40, 80);
    return normaliza({ imoveis, renda_fixa, renda_variavel, equity, outros: 0 });
}

function alocacaoAtual(inp: DiagnosticoInputs): Alocacao {
    const patr = n(inp.patrimonio_atual);
    let pctImoveis = inp.pct_imoveis_atual != null ? n(inp.pct_imoveis_atual) : NaN;
    if (!Number.isFinite(pctImoveis)) {
        // estimativa: quem tem imóvel quitado tende a concentrar em imóveis
        pctImoveis = inp.possui_imovel_quitado ? 82 : patr > 0 ? 45 : 0;
    }
    pctImoveis = clamp(pctImoveis, 0, 100);
    const resto = 100 - pctImoveis;
    // distribui o resto: caixa/RF, um pouco de RV e "outros"
    const renda_fixa = round(resto * 0.5);
    const renda_variavel = round(resto * 0.25);
    const outros = clamp(100 - pctImoveis - renda_fixa - renda_variavel, 0, 100);
    return { imoveis: pctImoveis, renda_fixa, renda_variavel, equity: 0, outros };
}

function normaliza(a: Alocacao): Alocacao {
    const total = a.imoveis + a.renda_fixa + a.renda_variavel + a.equity + a.outros || 1;
    const f = 100 / total;
    const r = {
        imoveis: round(a.imoveis * f),
        renda_fixa: round(a.renda_fixa * f),
        renda_variavel: round(a.renda_variavel * f),
        equity: round(a.equity * f),
        outros: round(a.outros * f),
    };
    // ajuste de arredondamento no maior bucket (imóveis)
    const soma = r.imoveis + r.renda_fixa + r.renda_variavel + r.equity + r.outros;
    r.imoveis += 100 - soma;
    return r;
}

function distanciaAloc(a: Alocacao, b: Alocacao) {
    return (
        Math.abs(a.imoveis - b.imoveis) +
        Math.abs(a.renda_fixa - b.renda_fixa) +
        Math.abs(a.renda_variavel - b.renda_variavel) +
        Math.abs(a.equity - b.equity) +
        Math.abs(a.outros - b.outros)
    );
}

function calcProdutos(inp: DiagnosticoInputs): ProdutoDiagnostico[] {
    const temObjConstruir = inp.objetivos.includes("construir_vender");
    const produtos: ProdutoDiagnostico[] = [
        {
            key: "consorcio_airbnb",
            nome: "Consórcio + Airbnb",
            subtitulo: "Primeiro tijolo do patrimônio",
            descricao:
                "Seu aporte mensal sustenta a parcela. Contemplar com lance e usar a carta para um studio que se paga sozinho.",
            status: n(inp.aporte_mensal) >= 300 ? "apto" : "bloqueado",
            destrave: n(inp.aporte_mensal) >= 300 ? undefined : "Aporte mensal a partir de R$ 300",
        },
        {
            key: "home_equity",
            nome: "Home Equity",
            subtitulo: "Liberar capital com juros baixos",
            descricao:
                "Imóvel construído quitado de bom valor destrava capital sem vender, para reinvestir em ativo de maior retorno.",
            status: inp.possui_imovel_quitado ? "apto" : "bloqueado",
            destrave: inp.possui_imovel_quitado ? undefined : "Ter um imóvel quitado de bom valor",
        },
        {
            key: "construir_vender",
            nome: "Construir pra vender",
            subtitulo: "Margem 25–40% sobre a obra",
            descricao:
                "Incorporar em terreno próprio e vender pronto, capturando a margem de construção.",
            status: inp.possui_terreno && temObjConstruir ? "apto" : "bloqueado",
            destrave:
                inp.possui_terreno && temObjConstruir
                    ? undefined
                    : "Terreno quitado ou objetivo de construir",
        },
        {
            key: "leilao_holding",
            nome: "Leilão via Holding",
            subtitulo: "Cotista, longo prazo, acima do CDI",
            descricao:
                "Aquisição de imóveis em leilão via estrutura de holding para ganho de capital e proteção.",
            status: n(inp.capital_disponivel) >= 200_000 ? "apto" : "bloqueado",
            destrave:
                n(inp.capital_disponivel) >= 200_000
                    ? undefined
                    : "Capital disponível a partir de R$ 200 mil",
        },
    ];
    return produtos;
}

function calcPlano(produtos: ProdutoDiagnostico[], custoVida: number, coberturaPct: number): PlanoPasso[] {
    const passos: PlanoPasso[] = [];
    let ordem = 1;
    const consorcio = produtos.find((p) => p.key === "consorcio_airbnb");
    const he = produtos.find((p) => p.key === "home_equity");

    if (consorcio?.status === "apto") {
        passos.push({
            ordem: ordem++,
            titulo: "Cota de consórcio com saída em studio/Airbnb",
            descricao:
                "Contratar cota de consórcio, contemplar com lance e usar a carta pra comprar um studio cuja renda paga a parcela. É o primeiro passo de quase todo investidor imobiliário.",
            destaque: true,
        });
    }
    if (he?.status === "apto") {
        passos.push({
            ordem: ordem++,
            titulo: "Avaliar Home Equity pra liberar capital",
            descricao:
                "Imóvel construído quitado de bom valor permite tomar HE com juros baixos e reinvestir em ativo de retorno maior.",
        });
    }
    passos.push({
        ordem: ordem++,
        titulo: "Conversar com um especialista",
        descricao: `Validar a sequência e desenhar a execução pra cobrir seu custo de ${fmtBRL(
            custoVida,
        )}/mês — hoje a projeção em 10 anos cobre ${round(coberturaPct)}%.`,
    });
    return passos;
}

function fmtBRL(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
        v,
    );
}

export function computeDiagnostico(inputRaw: DiagnosticoInputs): DiagnosticoResultado {
    const inp: DiagnosticoInputs = {
        ...inputRaw,
        idade: n(inputRaw.idade),
        renda_mensal: n(inputRaw.renda_mensal),
        aporte_mensal: n(inputRaw.aporte_mensal),
        custo_vida: n(inputRaw.custo_vida),
        capital_disponivel: n(inputRaw.capital_disponivel),
        patrimonio_atual: n(inputRaw.patrimonio_atual),
        renda_passiva_atual: n(inputRaw.renda_passiva_atual),
        objetivos: inputRaw.objetivos ?? [],
    };

    const custoVida = Math.max(inp.custo_vida, 1);

    // Projeção de patrimônio
    const patr10Estrategia = fv(inp.patrimonio_atual + inp.capital_disponivel, inp.aporte_mensal, ESTRATEGIA_AA, 10);
    const patr10Cdi = fv(inp.patrimonio_atual + inp.capital_disponivel, inp.aporte_mensal, CDI_AA, 10);
    const serie: PontoSerie[] = [0, 2, 4, 6, 8, 10].map((ano) => ({
        ano,
        cdi: round(fv(inp.patrimonio_atual + inp.capital_disponivel, inp.aporte_mensal, CDI_AA, ano)),
        estrategia: round(fv(inp.patrimonio_atual + inp.capital_disponivel, inp.aporte_mensal, ESTRATEGIA_AA, ano)),
    }));

    // Independência (renda passiva projetada)
    const patr5Estrategia = fv(inp.patrimonio_atual + inp.capital_disponivel, inp.aporte_mensal, ESTRATEGIA_AA, 5);
    const rendaPassiva10a = patr10Estrategia * YIELD_ALUGUEL_MES;
    const rendaPassiva5a = patr5Estrategia * YIELD_ALUGUEL_MES;
    const cobertura10a = (rendaPassiva10a / custoVida) * 100;
    const cobertura5a = (rendaPassiva5a / custoVida) * 100;

    // Alocação
    const ideal = alocacaoIdeal(inp);
    const atual = alocacaoAtual(inp);
    const dist = distanciaAloc(atual, ideal);

    // Saúde patrimonial (0-100)
    const custoCobertoHoje = clamp((inp.renda_passiva_atual / custoVida) * 100, 0, 999);
    const diversifScore = clamp(100 - dist / 2, 0, 100);
    const aporteScore = clamp((inp.aporte_mensal / custoVida) * 100, 0, 100);
    const score = clamp(
        round(0.45 * Math.min(custoCobertoHoje, 100) + 0.35 * diversifScore + 0.2 * aporteScore),
        0,
        100,
    );

    const produtos = calcProdutos(inp);
    const plano = calcPlano(produtos, custoVida, cobertura10a);
    const estagio = calcEstagio(inp);
    const produtosLiberados = produtos.filter((p) => p.status === "apto").length;

    // ajustes da alocação (mensagens)
    const ajustes: string[] = [];
    const faltamPp = clamp(round(100 - custoCobertoHoje), 0, 100);
    ajustes.push(
        `Sua renda passiva (RF + aluguéis) cobre ${round(custoCobertoHoje)}% do custo de vida${
            faltamPp > 0 ? ` — faltam ${faltamPp}pp para a independência.` : "."
        }`,
    );
    if (atual.renda_fixa < ideal.renda_fixa) {
        ajustes.push(
            `Reforçar renda fixa em ~${round(ideal.renda_fixa - atual.renda_fixa)}pp como colchão de liquidez.`,
        );
    }
    if (atual.imoveis > ideal.imoveis + 10) {
        ajustes.push(
            `Reduzir concentração em imóveis em ~${round(atual.imoveis - ideal.imoveis)}pp para diversificar.`,
        );
    }

    const primeiroApto = produtos.find((p) => p.status === "apto");

    return {
        estagio: { nivel: estagio.nivel, nome: estagio.nome, produtos_liberados: produtosLiberados },
        saude: {
            score,
            status: score >= 70 ? "balanceada" : "desbalanceada",
            custo_coberto_pct: round(custoCobertoHoje),
            piso_ideal_pct: PISO_IDEAL,
            motor_ideal_pct: MOTOR_IDEAL,
        },
        alocacao: { atual, ideal, ajustes },
        independencia: {
            renda_passiva_10a: round(rendaPassiva10a),
            cobertura_pct_5a: round(cobertura5a),
            cobertura_pct_10a: round(cobertura10a),
        },
        projecao: {
            serie,
            patrimonio_10a_estrategia: round(patr10Estrategia),
            patrimonio_10a_cdi: round(patr10Cdi),
            delta: round(patr10Estrategia - patr10Cdi),
        },
        produtos,
        plano,
        recomendado: primeiroApto
            ? {
                  titulo:
                      primeiroApto.key === "consorcio_airbnb"
                          ? "Primeiro studio/Airbnb via consórcio"
                          : primeiroApto.nome,
                  descricao: primeiroApto.descricao,
              }
            : {
                  titulo: "Conversar com um especialista",
                  descricao: "Vamos desenhar juntos o primeiro passo do seu plano.",
              },
        custo_vida: round(custoVida),
        premissas: { cdi_aa: CDI_AA, estrategia_aa: ESTRATEGIA_AA, yield_aluguel_aa: YIELD_ALUGUEL_AA },
    };
}
