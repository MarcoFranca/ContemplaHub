export function formNullableString(formData: FormData, name: string) {
    const value = String(formData.get(name) || "").trim();
    return value ? value : null;
}

export function formNullableNumber(formData: FormData, name: string) {
    const value = String(formData.get(name) || "").trim();
    if (!value) return null;
    const num = Number(value.replace(",", "."));
    return Number.isFinite(num) ? num : null;
}

export function parseJsonArray<T>(raw: string, errorMessage: string): T[] {
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        throw new Error(errorMessage);
    }
}