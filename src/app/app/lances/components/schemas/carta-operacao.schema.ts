import { z } from "zod";

export const cartaOperacaoSchema = z.object({
    assembleiaDia: z
        .union([z.string(), z.number(), z.null(), z.undefined()])
        .transform((value) => {
            if (value === null || value === undefined || value === "") return null;
            const num = typeof value === "number" ? value : Number(value);
            return Number.isNaN(num) ? null : num;
        })
        .refine((value) => value === null || (value >= 1 && value <= 31), {
            message: "Informe um dia entre 1 e 31.",
        }),

    assembleiaDiaOrigem: z.string().max(100).nullable().optional(),

    statusMes: z
        .enum(["pendente", "planejado", "feito", "sem_lance", "contemplada", "cancelada"])
        .nullable()
        .optional(),

    observacoes: z.string().max(4000).nullable().optional(),
    dataUltimoLance: z.string().nullable().optional(),
});

export type CartaOperacaoFormInput = {
    assembleiaDia: string | number | null | undefined;
    assembleiaDiaOrigem?: string | null;
    statusMes?:
        | "pendente"
        | "planejado"
        | "feito"
        | "sem_lance"
        | "contemplada"
        | "cancelada"
        | null;
    observacoes?: string | null;
    dataUltimoLance?: string | null;
};

export type CartaOperacaoFormValues = z.output<typeof cartaOperacaoSchema>;