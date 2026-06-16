/**
 * Motor de cálculo do simulador de consórcio (baseado na planilha Porto Bank).
 *
 * Modelo único para os 3 produtos (Imóvel, Auto, Pesados), com variações de:
 * - embutido máximo (30% / 20% / 30%)
 * - FGTS permitido (apenas Imóvel)
 * - taxa de adesão diluída (apenas Imóvel)
 * - taxas administrativas padrão por produto
 *
 * Tudo é cálculo puro (sem I/O, sem banco) — fácil de testar e reutilizar.
 */

export type ProdutoSimulador = "imovel" | "auto" | "pesados";
export type TipoContratacao = "fisica" | "juridica";

/** Redutor: percentual (0..1) OU campanha de parcela original. */
export type RedutorModo = number | "campanha";

export type ProdutoConfig = {
    id: ProdutoSimulador;
    label: string;
    /** Percentual máximo do crédito que pode ser usado como lance embutido. */
    embutidoMaxPct: number;
    permiteFgts: boolean;
    /** Taxa de adesão diluída nas 12 primeiras parcelas (apenas Imóvel). */
    temAdesao: boolean;
    defaults: {
        creditoContratado: number;
        prazoTotal: number;
        redutor: RedutorModo;
        taxaAdesao: number;
        taxaAdmin: number;
        fundoReserva: number;
        seguro: number;
    };
};

export const PRODUTOS: Record<ProdutoSimulador, ProdutoConfig> = {
    imovel: {
        id: "imovel",
        label: "Imóvel",
        embutidoMaxPct: 0.3,
        permiteFgts: true,
        temAdesao: true,
        defaults: {
            creditoContratado: 300000,
            prazoTotal: 200,
            redutor: 0.25,
            taxaAdesao: 0.02,
            taxaAdmin: 0.155,
            fundoReserva: 0.02,
            seguro: 0.00038,
        },
    },
    auto: {
        id: "auto",
        label: "Automóvel",
        embutidoMaxPct: 0.2,
        permiteFgts: false,
        temAdesao: false,
        defaults: {
            creditoContratado: 95000,
            prazoTotal: 69,
            redutor: 0.5,
            taxaAdesao: 0,
            taxaAdmin: 0.18,
            fundoReserva: 0.02,
            seguro: 0.00038,
        },
    },
    pesados: {
        id: "pesados",
        label: "Pesados",
        embutidoMaxPct: 0.3,
        permiteFgts: false,
        temAdesao: false,
        defaults: {
            creditoContratado: 375000,
            prazoTotal: 95,
            redutor: 0.25,
            taxaAdesao: 0,
            taxaAdmin: 0.14,
            fundoReserva: 0.02,
            seguro: 0.00038,
        },
    },
};

export type SimuladorInput = {
    produto: ProdutoSimulador;
    creditoContratado: number;
    tipoContratacao: TipoContratacao;
    prazoTotal: number;
    redutor: RedutorModo;
    // Oferta de lance
    recursoProprio: number;
    fgts: number;
    lanceEmbutido: number;
    // Pós-contemplação
    contemplacaoParcela: number;
    /** Simulação de lance por percentual desejado (ex.: lance fixo de 40%). 0..1 */
    lancePercentualDesejado: number;
    // Taxas do grupo (editáveis, com defaults por produto)
    taxaAdesao: number;
    taxaAdmin: number;
    fundoReserva: number;
    seguro: number;
};

export type SimuladorResultado = {
    // Base
    saldoDevedor: number;
    categoria: number;
    valorSeguro: number;
    // Parcelas
    parcelaIntegral: number;
    parcelaReduzida: number;
    economiaMensal: number;
    temReducao: boolean;
    // Adesão (apenas Imóvel)
    adesaoTotal: number;
    adesaoParcela: number;
    adesaoQtdParcelas: number;
    primeirasParcelas: number; // adesão diluída + parcela reduzida
    // Lance
    totalLance: number;
    representatividadeLance: number;
    embutidoMaximo: number;
    embutidoExcedido: boolean;
    // Lance por percentual desejado
    lanceDesejadoTotal: number;
    lanceDesejadoComEmbutido: number;
    // Pós-contemplação
    creditoLiberado: number;
    saldoPosContemplacao: number;
    novoSeguro: number;
    // Cenário A: reduzir parcela (mantém amortização do saldo)
    reduzirParcela_novaParcela: number;
    reduzirParcela_novoPrazo: number;
    // Cenário B: reduzir somente o prazo (mantém parcela cheia)
    reduzirPrazo_parcela: number;
    reduzirPrazo_novoPrazo: number;
};

function isPF(tipo: TipoContratacao) {
    return tipo === "fisica";
}

export function calcularConsorcio(input: SimuladorInput): SimuladorResultado {
    const {
        produto,
        creditoContratado: credito,
        tipoContratacao,
        prazoTotal: prazo,
        redutor,
        recursoProprio,
        fgts,
        lanceEmbutido,
        contemplacaoParcela,
        lancePercentualDesejado,
        taxaAdesao,
        taxaAdmin,
        fundoReserva,
        seguro,
    } = input;

    const config = PRODUTOS[produto];
    const pf = isPF(tipoContratacao);
    const fgtsValor = config.permiteFgts ? fgts : 0;

    // --- Base ---
    const saldoDevedor = credito * (1 + taxaAdmin + fundoReserva);
    const adesaoPct = config.temAdesao ? taxaAdesao : 0;
    const categoria = credito * (1 + adesaoPct + taxaAdmin + fundoReserva);

    const valorSeguro = pf ? saldoDevedor * seguro : 0;

    const parcelaPJ = prazo > 0 ? saldoDevedor / prazo : 0;
    const parcelaPF = parcelaPJ + valorSeguro;

    const campanha = redutor === "campanha";
    const redutorPct = campanha ? 0 : redutor;
    const temReducao = campanha || redutorPct > 0;

    const parcelaReduzidaPJ = campanha ? saldoDevedor / 200 : parcelaPJ * (1 - redutorPct);
    const parcelaReduzidaPF = parcelaReduzidaPJ + valorSeguro;

    const parcelaIntegral = pf ? parcelaPF : parcelaPJ;
    const parcelaReduzida = pf ? parcelaReduzidaPF : parcelaReduzidaPJ;
    const economiaMensal = parcelaIntegral - parcelaReduzida;

    // --- Adesão (apenas Imóvel) ---
    const adesaoQtdParcelas = 12;
    const adesaoTotal = config.temAdesao ? credito * taxaAdesao : 0;
    const adesaoParcela = config.temAdesao ? adesaoTotal / adesaoQtdParcelas : 0;
    const primeirasParcelas = adesaoParcela + parcelaReduzida;

    // --- Lance ---
    const totalLance = recursoProprio + fgtsValor + lanceEmbutido;
    const representatividadeLance = categoria > 0 ? totalLance / categoria : 0;
    const embutidoMaximo = credito * config.embutidoMaxPct;
    const embutidoExcedido = lanceEmbutido > embutidoMaximo + 0.005;

    // Lance por percentual desejado (ex.: lance fixo de 40%)
    const lanceDesejadoTotal = categoria * lancePercentualDesejado;
    const lanceDesejadoComEmbutido = lanceDesejadoTotal - lanceEmbutido;

    // --- Pós-contemplação ---
    const parcelaBaseAmort = temReducao ? parcelaReduzidaPJ : parcelaPJ;
    const saldoPosContemplacao =
        saldoDevedor - parcelaBaseAmort * contemplacaoParcela - totalLance;
    const novoSeguro = pf ? saldoPosContemplacao * seguro : 0;

    const prazoRestante = prazo - contemplacaoParcela;
    const parcelaTeoricaPJ = prazoRestante > 0 ? saldoPosContemplacao / prazoRestante : 0;
    // Piso operacional de 50% da parcela cheia
    const parcelaRealPJ = Math.max(parcelaTeoricaPJ, parcelaPJ / 2);
    const parcelaRealPF = parcelaRealPJ + novoSeguro;

    const creditoLiberado = credito - lanceEmbutido;

    // Cenário A — reduzir parcela
    const reduzirParcela_novaParcela = pf ? parcelaRealPF : parcelaRealPJ;
    const reduzirParcela_novoPrazo =
        parcelaRealPJ > 0 ? saldoPosContemplacao / parcelaRealPJ : 0;

    // Cenário B — reduzir somente o prazo (mantém parcela cheia)
    const reduzirPrazo_novoPrazo =
        parcelaPJ > 0 ? saldoPosContemplacao / parcelaPJ : 0;
    const reduzirPrazo_parcela = pf ? parcelaPJ + novoSeguro : parcelaPJ;

    return {
        saldoDevedor,
        categoria,
        valorSeguro,
        parcelaIntegral,
        parcelaReduzida,
        economiaMensal,
        temReducao,
        adesaoTotal,
        adesaoParcela,
        adesaoQtdParcelas,
        primeirasParcelas,
        totalLance,
        representatividadeLance,
        embutidoMaximo,
        embutidoExcedido,
        lanceDesejadoTotal,
        lanceDesejadoComEmbutido,
        creditoLiberado,
        saldoPosContemplacao,
        novoSeguro,
        reduzirParcela_novaParcela,
        reduzirParcela_novoPrazo,
        reduzirPrazo_parcela,
        reduzirPrazo_novoPrazo,
    };
}

export function defaultInput(produto: ProdutoSimulador): SimuladorInput {
    const c = PRODUTOS[produto];
    return {
        produto,
        creditoContratado: c.defaults.creditoContratado,
        tipoContratacao: "fisica",
        prazoTotal: c.defaults.prazoTotal,
        redutor: c.defaults.redutor,
        recursoProprio: 0,
        fgts: 0,
        lanceEmbutido: 0,
        contemplacaoParcela: 1,
        lancePercentualDesejado: 0.4,
        taxaAdesao: c.defaults.taxaAdesao,
        taxaAdmin: c.defaults.taxaAdmin,
        fundoReserva: c.defaults.fundoReserva,
        seguro: c.defaults.seguro,
    };
}
