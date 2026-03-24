export function onlyDigits(value: string) {
    return value.replace(/\D/g, "");
}

export function formatCurrencyBRLInput(value: string | number | null | undefined) {
    const raw = String(value ?? "");
    const digits = onlyDigits(raw);

    if (!digits) return "";

    const number = Number(digits) / 100;

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(number);
}

export function parseCurrencyBRLToNumber(value: string | null | undefined) {
    if (!value) return null;

    const digits = onlyDigits(value);
    if (!digits) return null;

    return Number(digits) / 100;
}

export function formatIntegerInput(value: string | number | null | undefined) {
    if (value == null || value === "") return "";
    return String(value).replace(/\D/g, "");
}