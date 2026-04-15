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
export function maskMoneyBRCents(raw: string): string {
    const digitsOnly = raw.replace(/\D/g, "");

    if (!digitsOnly) return "";

    let intPart = digitsOnly.slice(0, -2);
    let cents = digitsOnly.slice(-2);

    if (!intPart) intPart = "0";

    intPart = String(parseInt(intPart, 10) || 0);
    cents = cents.padStart(2, "0");

    const intWithThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${intWithThousands},${cents}`;
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

export function maskDateBR(raw: string): string {
    const d = onlyDigits(raw).slice(0, 8);

    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

export function parseDateBRToISO(value: string | null | undefined): string | null {
    const raw = value ?? "";
    const digits = onlyDigits(raw);

    if (digits.length !== 8) return null;

    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);

    const day = Number(dd);
    const month = Number(mm);
    const year = Number(yyyy);

    if (!day || !month || !year) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;

    return `${yyyy}-${mm}-${dd}`;
}

export function formatISODateToBR(value: string | null | undefined): string {
    if (!value) return "";
    const [yyyy, mm, dd] = value.split("-");
    if (!yyyy || !mm || !dd) return "";
    return `${dd}/${mm}/${yyyy}`;
}