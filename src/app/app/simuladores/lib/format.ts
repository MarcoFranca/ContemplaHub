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

/** Arredonda para cima meses fracionados (prazo é sempre em parcelas inteiras). */
export function meses(v?: number | null) {
    if (v == null || !Number.isFinite(v)) return "—";
    return `${Math.ceil(v)}x`;
}
