import { z } from "zod";

function parseLocalizedNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number") return Number.isNaN(value) ? null : value;

    const raw = String(value).trim();
    if (!raw) return null;

    const normalized = raw
        .replace(/\s/g, "")
        .replace(/R\$/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^0-9.-]/g, "");

    if (!normalized) return null;

    const num = Number(normalized);
    return Number.isNaN(num) ? null : num;
}

function nullableNumberFromInput(min?: number) {
    return z
        .union([z.string(), z.number(), z.null(), z.undefined()])
        .transform((value) => parseLocalizedNumber(value))
        .refine(
            (value) => {
                if (value === null) return true;
                if (min == null) return true;
                return value >= min;
            },
            {
                message:
                    min != null
                        ? `Informe um valor maior ou igual a ${min}.`
                        : "Valor inválido.",
            }
        );
}

export const cartaContratoSchema = z.object({
    leadId: z.string().trim().min(1, "Lead inválido."),
    clienteNome: z.string().trim().nullable().optional(),
    administradoraId: z.string().trim().min(1, "Selecione a administradora."),

    grupoCodigo: z.string().trim().min(1, "Informe o grupo."),
    numeroCota: z.string().trim().min(1, "Informe o número da cota."),

    produto: z.enum(["imobiliario", "auto"]),
    status: z.enum(["ativa", "contemplada", "cancelada"]),

    dataAdesao: z.string().nullable().optional(),
    prazo: nullableNumberFromInput(1),
    valorCarta: nullableNumberFromInput(0),
    valorParcela: nullableNumberFromInput(0),

    observacoes: z.string().nullable().optional(),
});

export type CartaContratoFormInput = z.input<typeof cartaContratoSchema>;
export type CartaContratoFormValues = z.output<typeof cartaContratoSchema>;