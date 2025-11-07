// src/lib/masks.ts
export function onlyDigits(v: string) {
    return v.replace(/\D+/g, "");
}

// (BR) WhatsApp/Telefone: (DD) 9XXXX-XXXX (11 dígitos) ou (DD) XXXX-XXXX (10)
export function maskPhoneBR(v: string) {
    const d = onlyDigits(v).slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    // 11 dígitos
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7,11)}`;
}

// Normaliza p/ CRM (E.164 simplificado BR sem "+"): 55DDDN...
export function normalizePhoneBR(v: string) {
    const d = onlyDigits(v);
    const withDDI = d.startsWith("55") ? d : `55${d}`;
    return withDDI.slice(0, 13); // 55 + DDD + número
}

// 👇 ADIÇÕES (novas) — NÃO REMOVER AS ANTIGAS

/** Retorna o telefone apenas com dígitos (sem DDI), limitado a 11 (DDD+9). */
export function unformatPhoneBR(v: string) {
    return onlyDigits(v).slice(0, 11);
}

/** Moeda com CENTAVOS "dinâmica": digita 123456 -> "1.234,56". */
export function maskMoneyBRCents(raw: string) {
    const digits = onlyDigits(raw);
    if (!digits) return "";
    const int = digits.slice(0, -2) || "0";
    const cents = digits.slice(-2).padStart(2, "0");
    const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${withDots},${cents}`;
}

/** Converte "1.234,56" em número JS (1234.56). Retorna null se inválido. */
export function parseMoneyBRCents(formatted: string | null | undefined) {
    const v = formatted ?? "";
    if (!v) return null;
    const n = Number(v.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
}

/** Helper pra montar link de WhatsApp. Se sem número, volta wa.me com texto. */
export function buildWhatsAppLinkBR(phoneDigits: string, text: string) {
    const d = unformatPhoneBR(phoneDigits);
    const target = d.length ? `55${d}` : "";
    const msg = encodeURIComponent(text);
    return target ? `https://wa.me/${target}?text=${msg}` : `https://wa.me/?text=${msg}`;
}

