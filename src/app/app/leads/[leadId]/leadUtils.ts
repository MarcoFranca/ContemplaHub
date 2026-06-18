// src/app/app/leads/[leadId]/leadUtils.ts
export function formatCurrencyBRL(value: number | null | undefined) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 2,
    }).format(Number(value));
}

/** Formata telefone BR, tolerando DDI 55 e 10/11 dígitos. Ex.: (21) 99250-3809. */
export function formatPhoneBR(raw: string | null | undefined) {
    if (!raw) return "—";
    let n = String(raw).replace(/\D/g, "");
    if (n.length > 11 && n.startsWith("55")) n = n.slice(2);
    if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
    if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
    return raw;
}
