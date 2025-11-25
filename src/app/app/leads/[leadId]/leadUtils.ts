// src/app/app/leads/[leadId]/leadUtils.ts
export function formatCurrencyBRL(value: number | null | undefined) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 2,
    }).format(Number(value));
}
