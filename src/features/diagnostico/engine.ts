// Motor determinístico do Diagnóstico do Investidor (nicho MÉDICO).
// TODAS as saídas são ESTIMATIVAS/projeções. A validação final é feita com um humano.
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
const VALOR_PLANTAO_PADRAO = 1500; // R$ por plantão quando não dá pra inferir

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

// Jornada do médico investidor
const ESTAGIOS = [
    { nivel: 1, nome: "Residente" },
    { nivel: 2, nome: "Recém formado" },
    { nivel: 3, nome: "Consolidado" },
    { nivel: 4, nome: "Investidor" },
    { nivel: 5, nome: "Livre de plantão" },
];

function calcEstagio(inp: DiagnosticoInputs) {
    const ehResidente = inp.atuacao === "residente" || inp.momento_carreira.includes("residente");
    if (ehResidente) return ESTAGIOS[0];

    const pontos = n(inp.patrimonio_atual) + n(inp.capital_disponivel) + n(inp.aporte_mensal) * 60;
    let nivel = 2;
    if (pontos >= 5_000_000) nivel = 5;
    else if (pontos >= 1_500_000) nivel = 4;
    else if (pontos >= 500_000) nivel = 3;
    else nivel = 2;

    // quem já está reduzindo plantões tende ao topo da jornada
    if (inp.momento_carreira.includes("reduzindo")) nivel = Math.max(nivel, 4);
    return ESTAGIOS[nivel - 1];
}

function alocacaoIdeal(inp: DiagnosticoInputs): Alocacao {
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
    if (inp.objetivos.includes("clinica") || inp.atuacao === "socio") {
        equity += 4;
        imoveis -= 4;
    }
    imoveis = clamp(imoveis, 40, 80);
    return normaliza({ imoveis, renda_fixa, renda_variavel, equity, outros: 0 });
}

function alocacaoAtual(inp: DiagnosticoInputs): Alocacao {
    const patr = n(inp.patrimonio_atual);
    let pctImoveis = inp.pct_imoveis_atual != null ? n(inp.pct_imoveis_atual) : NaN;
    if (!Number.isFinite(pctImoveis)) {
        pctImoveis = inp.possui_imovel_quitado ? 82 : patr > 0 ? 45 : 0;
    }
    pctImoveis = clamp(pctImoveis, 0, 100);
    const resto = 100 - pctImoveis;
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
    const aporteOk = n(inp.aporte_mensal) >= 300;
    const patrimonioAlto = n(inp.patrimonio_atual) >= 500_000;
    return [
        {
            key: "consorcio_consultorio",
            nome: "Consultório ou sala via consórcio",
            subtitulo: "Pare de pagar aluguel de sala",
            descricao:
                "Contratar cota, contemplar com lance e usar a carta para comprar seu próprio consultório ou sala. Deixa de pagar aluguel e vira patrimônio.",
            status: aporteOk ? "apto" : "bloqueado",
            destrave: aporteOk ? undefined : "Aporte mensal a partir de R$ 300",
        },
        {
            key: "consorcio_airbnb",
            nome: "Studio ou Airbnb via consórcio",
            subtitulo: "Renda que substitui plantão",
            descricao:
                "Usar a carta para um studio cuja renda paga a parcela e ainda sobra. Primeiro tijolo da renda passiva.",
            status: aporteOk ? "apto" : "bloqueado",
            destrave: aporteOk ? undefined : "Aporte mensal a partir de R$ 300",
        },
        {
            key: "home_equity",
            nome: "Home Equity",
            subtitulo: "Liberar capital com juros baixos",
            descricao:
                "Imóvel quitado de bom valor destrava capital sem vender, para reinvestir em ativo de maior retorno.",
            status: inp.possui_imovel_quitado ? "apto" : "bloqueado",
            destrave: inp.possui_imovel_quitado ? undefined : "Ter um imóvel quitado de bom valor",
        },
        {
            key: "holding_protecao",
            nome: "Holding de proteção patrimonial",
            subtitulo: "Blindagem contra processos",
            descricao:
                "Estruturar holding para proteger o patrimônio de riscos da atividade médica e organizar a sucessão.",
            status: inp.possui_cnpj || patrimonioAlto ? "apto" : "bloqueado",
            destrave: inp.possui_cnpj || patrimonioAlto ? undefined : "Ter CNPJ ativo ou patrimônio relevante",
        },
        {
            key: "leilao_holding",
            nome: "Leilão via Holding",
            subtitulo: "Ganho de capital acima do CDI",
            descricao: "Aquisição de imóveis em leilão via holding para ganho de capital e proteção.",
            status: n(inp.capital_disponivel) >= 200_000 ? "apto" : "bloqueado",
            destrave: n(inp.capital_disponivel) >= 200_000 ? undefined : "Capital disponível a partir de R$ 200 mil",
        },
    ];
}

function calcPlano(
    produtos: ProdutoDiagnostico[],
    inp: DiagnosticoInputs,
    metaCoberturaPct: number,
): PlanoPasso[] {
    const passos: PlanoPasso[] = [];
    let ordem = 1;
    const consultorio = produtos.find((p) => p.key === "consorcio_consultorio");
    const airbnb = produtos.find((p) => p.key === "consorcio_airbnb");
    const holding = produtos.find((p) => p.key === "holding_protecao");
    const he = produtos.find((p) => p.key === "home_equity");

    const querConsultorio = inp.objetivos.includes("consultorio");
    const primeiro = querConsultorio ? consultorio : airbnb;

    if (primeiro?.status === "apto") {
        passos.push({
            ordem: ordem++,
            titulo: querConsultorio
                ? "Consultório próprio via consórcio"
                : "Renda passiva via consórcio (studio/Airbnb)",
            descricao: querConsultorio
                ? "Contratar cota, contemplar com lance e comprar seu consultório. Troca aluguel por patrimônio."
                : "Contratar cota, contemplar com lance e comprar um studio cuja renda paga a parcela e começa a substituir plantão.",
            destaque: true,
        });
    }
    if (inp.objetivos.includes("proteger") && holding?.status === "apto") {
        passos.push({
            ordem: ordem++,
            titulo: "Estruturar a proteção patrimonial",
            descricao: "Montar holding para blindar o patrimônio dos riscos da atividade médica.",
        });
    }
    if (he?.status === "apto") {
        passos.push({
            ordem: ordem++,
            titulo: "Avaliar Home Equity para acelerar",
            descricao: "Liberar capital do imóvel quitado com juros baixos e reinvestir em ativo de retorno maior.",
        });
    }
    passos.push({
        ordem: ordem++,
        titulo: "Conversar com um especialista",
        descricao: `Validar a sequência e desenhar a execução para chegar na sua meta de renda passiva. Hoje a projeção em 10 anos cobre ${round(
            metaCoberturaPct,
        )}% dela.`,
    });
    return passos;
}

export function computeDiagnostico(inputRaw: DiagnosticoInputs): DiagnosticoResultado {
    const inp: DiagnosticoInputs = {
        ...inputRaw,
        regime: inputRaw.regime ?? [],
        momento_carreira: inputRaw.momento_carreira ?? [],
        objetivos: inputRaw.objetivos ?? [],
        renda_mensal: n(inputRaw.renda_mensal),
        custo_vida: n(inputRaw.custo_vida),
        aporte_mensal: n(inputRaw.aporte_mensal),
        capital_disponivel: n(inputRaw.capital_disponivel),
        patrimonio_atual: n(inputRaw.patrimonio_atual),
        renda_passiva_atual: n(inputRaw.renda_passiva_atual),
        renda_passiva_desejada: n(inputRaw.renda_passiva_desejada),
    };

    const custoVida = Math.max(inp.custo_vida, 1);
    const metaRenda = Math.max(inp.renda_passiva_desejada, 1);
    const base = inp.patrimonio_atual + inp.capital_disponivel;

    // Projeção de patrimônio
    const patr10Estrategia = fv(base, inp.aporte_mensal, ESTRATEGIA_AA, 10);
    const patr10Cdi = fv(base, inp.aporte_mensal, CDI_AA, 10);
    const patr5Estrategia = fv(base, inp.aporte_mensal, ESTRATEGIA_AA, 5);
    const serie: PontoSerie[] = [0, 2, 4, 6, 8, 10].map((ano) => ({
        ano,
        cdi: round(fv(base, inp.aporte_mensal, CDI_AA, ano)),
        estrategia: round(fv(base, inp.aporte_mensal, ESTRATEGIA_AA, ano)),
    }));

    // Renda passiva projetada
    const rendaPassiva10a = patr10Estrategia * YIELD_ALUGUEL_MES;
    const rendaPassiva5a = patr5Estrategia * YIELD_ALUGUEL_MES;

    // Cobertura vs META (âncora principal) e vs custo de vida
    const coberturaMeta10a = (rendaPassiva10a / metaRenda) * 100;
    const coberturaMeta5a = (rendaPassiva5a / metaRenda) * 100;
    const cobertura10a = (rendaPassiva10a / custoVida) * 100;
    const cobertura5a = (rendaPassiva5a / custoVida) * 100;

    // Métrica de plantões
    const plantoes = n(inp.plantoes_mes);
    const valorPlantao =
        plantoes > 0 && inp.renda_mensal > 0
            ? clamp(inp.renda_mensal / plantoes, 800, 6000)
            : VALOR_PLANTAO_PADRAO;
    const plantoesSubstituidos = round(rendaPassiva10a / valorPlantao);

    // Alocação
    const ideal = alocacaoIdeal(inp);
    const atual = alocacaoAtual(inp);
    const dist = distanciaAloc(atual, ideal);

    // Saúde patrimonial (0-100) — ancorada na meta de renda passiva
    const custoCobertoHoje = clamp((inp.renda_passiva_atual / custoVida) * 100, 0, 999);
    const metaCobertaHoje = clamp((inp.renda_passiva_atual / metaRenda) * 100, 0, 100);
    const diversifScore = clamp(100 - dist / 2, 0, 100);
    const aporteScore = clamp((inp.aporte_mensal / custoVida) * 100, 0, 100);
    const score = clamp(
        round(0.45 * metaCobertaHoje + 0.35 * diversifScore + 0.2 * aporteScore),
        0,
        100,
    );

    const produtos = calcProdutos(inp);
    const plano = calcPlano(produtos, inp, coberturaMeta10a);
    const estagio = calcEstagio(inp);
    const produtosLiberados = produtos.filter((p) => p.status === "apto").length;

    const ajustes: string[] = [];
    const faltaMeta = clamp(round(100 - coberturaMeta10a), 0, 100);
    ajustes.push(
        faltaMeta > 0
            ? `A projeção em 10 anos cobre ${round(coberturaMeta10a)}% da sua meta de renda passiva. Faltam ${faltaMeta} pontos.`
            : `A projeção em 10 anos já supera sua meta de renda passiva.`,
    );
    if (atual.renda_fixa < ideal.renda_fixa) {
        ajustes.push(
            `Reforçar renda fixa em cerca de ${round(ideal.renda_fixa - atual.renda_fixa)} pontos como colchão de liquidez.`,
        );
    }
    if (atual.imoveis > ideal.imoveis + 10) {
        ajustes.push(
            `Reduzir concentração em imóveis em cerca de ${round(atual.imoveis - ideal.imoveis)} pontos para diversificar.`,
        );
    }
    if (inp.objetivos.includes("proteger") && !inp.possui_holding) {
        ajustes.push("Você quer proteger o patrimônio e ainda não tem holding. Vale priorizar a estrutura de proteção.");
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
        meta: {
            renda_passiva_desejada: round(metaRenda),
            cobertura_meta_pct_5a: round(coberturaMeta5a),
            cobertura_meta_pct_10a: round(coberturaMeta10a),
        },
        plantoes: {
            valor_plantao: round(valorPlantao),
            substituidos_10a: plantoesSubstituidos,
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
                      primeiroApto.key === "consorcio_consultorio"
                          ? "Seu consultório via consórcio"
                          : primeiroApto.key === "consorcio_airbnb"
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
