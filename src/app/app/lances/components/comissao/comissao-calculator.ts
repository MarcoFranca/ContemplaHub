import type { ComissaoEvento, ComissaoRegra } from "../../types";

function round4(value: number) {
    return Math.round(value * 10000) / 10000;
}

function round2(value: number) {
    return Math.round(value * 100) / 100;
}

export function calcularValorEstimado(valorBase: number, percentual: number) {
    return round2(valorBase * (percentual / 100));
}

export function somarPercentuais(regras: ComissaoRegra[]) {
    return round4(
        regras.reduce((acc, item) => acc + Number(item.percentual_comissao || 0), 0)
    );
}

export function gerarRegrasProporcionais(params: {
    quantidadeParcelas: number;
    percentualTotal: number;
    modo: "avista" | "parcelado";
}): ComissaoRegra[] {
    const { quantidadeParcelas, percentualTotal, modo } = params;

    if (quantidadeParcelas <= 0) return [];

    const tipoEvento: ComissaoEvento =
        modo === "avista" ? "adesao" : "proxima_cobranca";

    const base = round4(percentualTotal / quantidadeParcelas);

    const regras: ComissaoRegra[] = Array.from(
        { length: quantidadeParcelas },
        (_, index) => ({
            ordem: index + 1,
            tipo_evento: index === 0 && modo === "avista" ? "adesao" : tipoEvento,
            offset_meses: modo === "avista" ? 0 : index,
            percentual_comissao: base,
            descricao: "",
            is_manual: false,
        })
    );

    const soma = somarPercentuais(regras);
    const diff = round4(percentualTotal - soma);

    if (regras.length > 0 && diff !== 0) {
        regras[regras.length - 1] = {
            ...regras[regras.length - 1],
            percentual_comissao: round4(
                regras[regras.length - 1].percentual_comissao + diff
            ),
        };
    }

    return regras;
}

export function redistribuirRegrasAutomaticas(params: {
    regras: ComissaoRegra[];
    percentualTotal: number;
}): ComissaoRegra[] {
    const { regras, percentualTotal } = params;

    const manuais = regras.filter((item) => item.is_manual);
    const automaticas = regras.filter((item) => !item.is_manual);

    const totalManual = somarPercentuais(manuais);
    const saldo = round4(percentualTotal - totalManual);

    if (automaticas.length === 0) {
        return regras;
    }

    const base = round4(saldo / automaticas.length);

    const next = regras.map((item) =>
        item.is_manual
            ? item
            : {
                ...item,
                percentual_comissao: base,
            }
    );

    const somaAtual = somarPercentuais(next);
    const diff = round4(percentualTotal - somaAtual);

    const idxUltimaAuto = [...next]
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => !item.is_manual)
        .map(({ index }) => index)
        .pop();

    if (idxUltimaAuto !== undefined && diff !== 0) {
        next[idxUltimaAuto] = {
            ...next[idxUltimaAuto],
            percentual_comissao: round4(
                next[idxUltimaAuto].percentual_comissao + diff
            ),
        };
    }

    return next.map((item, index) => ({
        ...item,
        ordem: index + 1,
    }));
}

export function atualizarRegraManual(params: {
    regras: ComissaoRegra[];
    regraIndex: number;
    percentual: number;
    percentualTotal: number;
}): ComissaoRegra[] {
    const { regras, regraIndex, percentual, percentualTotal } = params;

    const next = [...regras];
    next[regraIndex] = {
        ...next[regraIndex],
        percentual_comissao: round4(percentual),
        is_manual: true,
    };

    return redistribuirRegrasAutomaticas({
        regras: next,
        percentualTotal,
    });
}

export function liberarRegraParaAuto(params: {
    regras: ComissaoRegra[];
    regraIndex: number;
    percentualTotal: number;
}): ComissaoRegra[] {
    const { regras, regraIndex, percentualTotal } = params;

    const next = [...regras];
    next[regraIndex] = {
        ...next[regraIndex],
        is_manual: false,
    };

    return redistribuirRegrasAutomaticas({
        regras: next,
        percentualTotal,
    });
}