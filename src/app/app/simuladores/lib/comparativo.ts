/**
 * Comparativo Consórcio x Financiamento para a mesma aquisição (valor do bem + prazo).
 *
 * Consórcio: sem juros, mas com taxa de administração + fundo de reserva (+ adesão/seguro).
 * Financiamento: acesso imediato ao bem, porém com juros.
 */

import {
    PRODUTOS,
    calcularConsorcio,
    type ProdutoSimulador,
    type TipoContratacao,
} from "./consorcio";
import {
    calcularFinanciamento,
    type FinanciamentoResultado,
    type SistemaAmortizacao,
} from "./financiamento";

export type ComparativoInput = {
    valorBem: number;
    /** Prazo do consórcio (meses). */
    prazo: number;
    tipoContratacao: TipoContratacao;
    produto: ProdutoSimulador;
    // Consórcio (taxas editáveis — variam por campanha; default do produto se ausente)
    taxaAdmin?: number;
    fundoReserva?: number;
    // Financiamento
    /** Prazo do financiamento (meses) — geralmente maior que o do consórcio. */
    prazoFinanciamento: number;
    entrada: number;
    taxaMensal: number;
    sistema: SistemaAmortizacao;
    /** Reajuste anual estimado do bem (decimal). Só contexto, não entra no custo. */
    reajusteAnual?: number;
};

export type ConsorcioComparado = {
    parcela: number; // parcela integral (comparável à do financiamento)
    custoTotal: number; // total desembolsado ao longo do plano
    custoExtra: number; // custoTotal - valor do bem
    custoExtraPct: number;
};

export type ComparativoResultado = {
    consorcio: ConsorcioComparado;
    financiamento: FinanciamentoResultado;
    economia: number; // financiamento.totalPago - consorcio.custoTotal
    economiaPct: number; // economia / financiamento.totalPago
    taxaAdminUsada: number;
    valorBemCorrigido: number; // valor do bem projetado ao fim do prazo (contexto)
};

export function calcularComparativo(input: ComparativoInput): ComparativoResultado {
    const cfg = PRODUTOS[input.produto];
    const taxaAdminUsada = input.taxaAdmin ?? cfg.defaults.taxaAdmin;
    const fundoUsado = input.fundoReserva ?? cfg.defaults.fundoReserva;

    // Consórcio sem lance e sem redutor (cenário base, custo total comparável).
    const c = calcularConsorcio({
        produto: input.produto,
        creditoContratado: input.valorBem,
        tipoContratacao: input.tipoContratacao,
        prazoTotal: input.prazo,
        redutor: 0,
        recursoProprio: 0,
        fgts: 0,
        lanceEmbutido: 0,
        contemplacaoParcela: 1,
        lancePercentualDesejado: 0,
        taxaAdesao: cfg.defaults.taxaAdesao,
        taxaAdmin: taxaAdminUsada,
        fundoReserva: fundoUsado,
        seguro: cfg.defaults.seguro,
    });

    const seguroTotal = c.valorSeguro * input.prazo;
    const custoTotal = c.saldoDevedor + c.adesaoTotal + seguroTotal;
    const custoExtra = custoTotal - input.valorBem;

    const consorcio: ConsorcioComparado = {
        parcela: c.parcelaIntegral,
        custoTotal,
        custoExtra,
        custoExtraPct: input.valorBem > 0 ? custoExtra / input.valorBem : 0,
    };

    const financiamento = calcularFinanciamento({
        valorBem: input.valorBem,
        entrada: input.entrada,
        prazo: input.prazoFinanciamento,
        taxaMensal: input.taxaMensal,
        sistema: input.sistema,
    });

    const economia = financiamento.totalPago - consorcio.custoTotal;
    const economiaPct = financiamento.totalPago > 0 ? economia / financiamento.totalPago : 0;

    const reajuste = input.reajusteAnual ?? 0;
    const anos = input.prazo / 12;
    const valorBemCorrigido = input.valorBem * Math.pow(1 + reajuste, anos);

    return {
        consorcio,
        financiamento,
        economia,
        economiaPct,
        taxaAdminUsada,
        valorBemCorrigido,
    };
}
