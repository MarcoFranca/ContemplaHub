import { formatPhoneBR } from "@/lib/formatters";

export function norm(s?: string | null) {
    return (s ?? "").trim().toLowerCase();
}

export function contains(hay?: string | null, needle?: string | null) {
    if (!needle) return true;
    return norm(hay).includes(norm(needle));
}

export function asNumber(v: string | number | null | undefined): number | null {
    if (v == null) return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    const n = Number(String(v).replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
}

export function fmtCurrency(v: string | number | null | undefined) {
    const n = asNumber(v);
    if (n == null) return "—";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function fmtDate(v: string | null | undefined) {
    if (!v) return "—";
    try {
        return new Date(v).toLocaleDateString("pt-BR");
    } catch {
        return v;
    }
}

export function isPlaceholderImportEmail(v?: string | null) {
    const value = norm(v);
    return value.includes("@sem-contato.local") && value.startsWith("importacao-");
}

export function fmtPhone(v?: string | null) {
    const raw = (v ?? "").trim();
    if (!raw) return null;
    const digits = raw.replace(/\D+/g, "");
    if (!digits) return null;
    return formatPhoneBR(digits);
}

export function fmtLeadEmail(v?: string | null) {
    const raw = (v ?? "").trim();
    if (!raw || isPlaceholderImportEmail(raw)) return null;
    return raw;
}

export function pickLatestByCreatedAt<T extends { created_at?: string | null }>(
    rows: T[]
): T | null {
    if (!rows.length) return null;

    return [...rows].sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
    })[0] ?? null;
}
