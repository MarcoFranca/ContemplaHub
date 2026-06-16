export function brl(v?: number | null) {
    if (v == null || !Number.isFinite(v)) return "—";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(v);
}

export function pct(v?: number | null, casas = 2) {
    if (v == null || !Number.isFinite(v)) return "—";
    return (
        new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: casas,
        }).format(v * 100) + "%"
    );
}

/** Fator decimal (0.155) → string percentual BR ("15,5") para inputs editáveis. */
export function pctStrFromFactor(factor: number): string {
    return String(Number((factor * 100).toFixed(4))).replace(".", ",");
}

/** Arredonda para cima meses fracionados (prazo é sempre em parcelas inteiras). */
export function meses(v?: number | null) {
    if (v == null || !Number.isFinite(v)) return "—";
    return `${Math.ceil(v)}x`;
}
