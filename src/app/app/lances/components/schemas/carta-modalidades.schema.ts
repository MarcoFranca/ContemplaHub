import { z } from "zod";

export const lanceFixoOptionSchema = z.object({
    id: z.string().optional(),
    ordem: z.number().int().min(1).max(3),
    percentual: z.number().min(0).max(100).nullable().optional(),
    ativo: z.boolean(),
});

export const cartaModalidadesSchema = z
    .object({
        embutidoPermitido: z.boolean(),
        embutidoMaxPercent: z.number().min(0).max(100).nullable().optional(),
        fgtsPermitido: z.boolean(),
        opcoesLanceFixo: z.array(lanceFixoOptionSchema).max(3),
    })
    .superRefine((data, ctx) => {
        if (data.embutidoPermitido && data.embutidoMaxPercent == null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["embutidoMaxPercent"],
                message: "Informe o percentual máximo do embutido.",
            });
        }

        const ativos = data.opcoesLanceFixo.filter((item) => item.ativo);

        for (const item of ativos) {
            if (item.percentual == null) {
                const index = data.opcoesLanceFixo.findIndex((opt) => opt.ordem === item.ordem);

                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["opcoesLanceFixo", index, "percentual"],
                    message: "Informe o percentual da opção ativa.",
                });
            }
        }

        const percentuais = ativos
            .map((item) => item.percentual)
            .filter((value): value is number => value != null);

        const repetidos = percentuais.filter(
            (value, index) => percentuais.indexOf(value) !== index
        );

        if (repetidos.length > 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["opcoesLanceFixo"],
                message: "Não repita percentuais entre opções ativas.",
            });
        }
    });

export type CartaModalidadesFormValues = z.infer<typeof cartaModalidadesSchema>;