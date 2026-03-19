import { z } from "zod";

export const cartaEstrategiaSchema = z.object({
    objetivo: z.string().max(500).nullable().optional(),
    estrategia: z.string().max(4000).nullable().optional(),
    tipoLancePreferencial: z
        .enum(["livre", "fixo", "embutido", "sorteio", ""])
        .nullable()
        .optional(),
    autorizacaoGestao: z.boolean(),
});

export type CartaEstrategiaFormInput = {
    objetivo?: string | null;
    estrategia?: string | null;
    tipoLancePreferencial?: "livre" | "fixo" | "embutido" | "sorteio" | "" | null;
    autorizacaoGestao: boolean;
};

export type CartaEstrategiaFormValues = z.output<typeof cartaEstrategiaSchema>;