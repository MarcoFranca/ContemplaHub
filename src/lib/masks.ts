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
    // se vier sem DDI, prefixa 55 (Brasil)
    const withDDI = d.startsWith("55") ? d : `55${d}`;
    return withDDI.slice(0, 13); // 55 + 2 DDD + 9 número (até 13)
}

// Moeda "plana" sem centavos e sem prefixo: 300.000
export function maskCurrencyPlain(v: string) {
    const d = onlyDigits(v).slice(0, 9); // até 999.999.999
    return d ? Number(d).toLocaleString("pt-BR") : "";
}

// Normaliza moeda p/ número inteiro (centavos opcionais futuramente)
export function normalizeCurrencyPlain(v: string) {
    return onlyDigits(v); // "300000"
}
