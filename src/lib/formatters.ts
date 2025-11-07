// src/lib/formatters.ts

/** Garante string estável a partir de qualquer tipo. */
function toStr(v: unknown): string {
    if (v == null) return "";
    return typeof v === "string" ? v : String(v);
}

export function onlyDigits(v: unknown) {
    return toStr(v).replace(/\D+/g, "");
}

/** (11) 91234-5678 ou (11) 1234-5678 – tolerante a qualquer tipo. */
export function formatPhoneBR(v: unknown) {
    const d = onlyDigits(v).slice(0, 11);
    if (d.length <= 10) {
        return d
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2")
            .slice(0, 14);
    }
    return d
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 15);
}

export function unformatPhoneBR(v: unknown) {
    return onlyDigits(v).slice(0, 11);
}

/** 123456 -> "1.234,56" (tolerante a number/null/undefined). */
export function formatMoneyBR(raw: unknown) {
    // mantém só dígitos
    let digits = onlyDigits(raw);
    // remove zeros à esquerda (mantém pelo menos 1 se houver mais dígitos depois)
    digits = digits.replace(/^0+(?=\d)/, "");
    if (!digits) return "0,00";

    const int = digits.slice(0, -2) || "0";
    const cents = digits.slice(-2).padStart(2, "0");
    const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${withDots},${cents}`;
}

/** "1.234,56" -> 1234.56 (number) | null se inválido (tolerante a tipos). */
export function parseMoneyBR(formatted: unknown): number | null {
    const s = toStr(formatted);
    if (!s) return null;
    const n = Number(s.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
}

/** Monta link WA com fallback sem número. */
export function buildWhatsAppLink(phone: unknown, text: string) {
    const d = unformatPhoneBR(phone);
    const target = d.length ? `55${d}` : "";
    const msg = encodeURIComponent(text);
    return target ? `https://wa.me/${target}?text=${msg}` : `https://wa.me/?text=${msg}`;
}
