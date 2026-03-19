import { z } from "zod";

export const lanceFixoOptionSchema = z.object({
    id: z.string().optional(),
    ordem: z.number().int().min(1).max(3),
    percentual: z.string().nullable().optional(),
    ativo: z.boolean(),
    observacoes: z.string().max(500).nullable().optional(),
});

export const cartaModalidadesSchema = z
    .object({
        embutidoPermitido: z.boolean(),
        embutidoMaxPercent: z.string().nullable().optional(),
        fgtsPermitido: z.boolean(),
        opcoesLanceFixo: z.array(lanceFixoOptionSchema).max(3),
    })
    .superRefine((data, ctx) => {
        if (data.embutidoPermitido) {
            const raw = data.embutidoMaxPercent ?? "";
            if (raw === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["embutidoMaxPercent"],
                    message: "Informe o percentual máximo do embutido.",
                });
            } else {
                const parsed = Number(raw);
                if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["embutidoMaxPercent"],
                        message: "Informe um percentual válido entre 0 e 100.",
                    });
                }
            }
        }

        const ativos = data.opcoesLanceFixo.filter((item) => item.ativo);

        ativos.forEach((item, index) => {
            const raw = item.percentual ?? "";
            if (raw === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["opcoesLanceFixo", index, "percentual"],
                    message: "Informe o percentual da opção ativa.",
                });
                return;
            }

            const parsed = Number(raw);
            if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["opcoesLanceFixo", index, "percentual"],
                    message: "Informe um percentual válido entre 0 e 100.",
                });
            }
        });

        const percentuais = ativos
            .map((item) => Number(item.percentual))
            .filter((value) => !Number.isNaN(value));

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