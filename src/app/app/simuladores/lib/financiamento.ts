/**
 * Motor de cálculo de financiamento (para comparação com consórcio).
 * Suporta os dois sistemas usuais: Price (parcela fixa) e SAC (amortização constante).
 */

export type SistemaAmortizacao = "price" | "sac";

export type FinanciamentoInput = {
    valorBem: number;
    entrada: number;
    prazo: number;
    /** Taxa de juros mensal em decimal (ex.: 0.015 = 1,5% a.m.). */
    taxaMensal: number;
    sistema: SistemaAmortizacao;
};

export type FinanciamentoResultado = {
    valorFinanciado: number;
    parcelaInicial: number;
    parcelaFinal: number;
    parcelaMedia: number;
    totalPago: number; // inclui a entrada
    totalJuros: number;
    custoExtra: number; // total pago - valor do bem
    custoExtraPct: number; // custoExtra / valor do bem
};

/** Converte taxa anual (decimal) em mensal equivalente composta. */
export function anualParaMensal(taxaAnual: number): number {
    return Math.pow(1 + taxaAnual, 1 / 12) - 1;
}

export function calcularFinanciamento(input: FinanciamentoInput): FinanciamentoResultado {
    const { valorBem, entrada, prazo, taxaMensal: i, sistema } = input;
    const vf = Math.max(valorBem - entrada, 0);
    const n = Math.max(Math.round(prazo), 0);

    let parcelaInicial = 0;
    let parcelaFinal = 0;
    let totalJuros = 0;

    if (n > 0) {
        if (sistema === "price") {
            const pmt = i > 0 ? (vf * i) / (1 - Math.pow(1 + i, -n)) : vf / n;
            parcelaInicial = pmt;
            parcelaFinal = pmt;
            totalJuros = pmt * n - vf;
        } else {
            // SAC
            const amort = vf / n;
            parcelaInicial = amort + vf * i;
            parcelaFinal = amort + amort * i;
            totalJuros = i * vf * ((n + 1) / 2);
        }
    }

    const totalPago = vf + totalJuros + entrada;
    const parcelaMedia = n > 0 ? (vf + totalJuros) / n : 0;
    const custoExtra = totalPago - valorBem;
    const custoExtraPct = valorBem > 0 ? custoExtra / valorBem : 0;

    return {
        valorFinanciado: vf,
        parcelaInicial,
        parcelaFinal,
        parcelaMedia,
        totalPago,
        totalJuros,
        custoExtra,
        custoExtraPct,
    };
}
