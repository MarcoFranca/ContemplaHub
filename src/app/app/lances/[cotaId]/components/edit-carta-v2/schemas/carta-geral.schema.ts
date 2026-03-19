import { z } from "zod";

function nullableNumberFromInput(min?: number) {
    return z
        .union([z.string(), z.number(), z.null(), z.undefined()])
        .transform((value) => {
            if (value === null || value === undefined || value === "") return null;
            const num = typeof value === "number" ? value : Number(value);
            return Number.isNaN(num) ? null : num;
        })
        .refine((value) => {
            if (value === null) return true;
            if (min == null) return true;
            return value >= min;
        }, {
            message: min != null ? `Informe um valor maior ou igual a ${min}.` : "Valor inválido.",
        });
}

export const cartaGeralSchema = z.object({
    grupoCodigo: z.string().min(1, "Informe o grupo."),
    numeroCota: z.string().min(1, "Informe o número da cota."),
    produto: z.string().min(1, "Informe o produto."),
    status: z.string().min(1, "Informe o status."),
    dataAdesao: z.string().nullable().optional(),
    prazo: nullableNumberFromInput(1),
    valorCarta: nullableNumberFromInput(0),
    valorParcela: nullableNumberFromInput(0),
});

export type CartaGeralFormInput = {
    grupoCodigo: string;
    numeroCota: string;
    produto: string;
    status: string;
    dataAdesao?: string | null;
    prazo: string | number | null | undefined;
    valorCarta: string | number | null | undefined;
    valorParcela: string | number | null | undefined;
};

export type CartaGeralFormValues = z.output<typeof cartaGeralSchema>;