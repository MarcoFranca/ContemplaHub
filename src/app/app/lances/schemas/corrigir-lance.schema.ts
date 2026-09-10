import { z } from "zod";

const valorSchema = z.number().finite().nonnegative();

export const corrigirLanceSchema = z
    .object({
        lanceId: z.string().min(1),
        cotaId: z.string().min(1),
        assembleiaData: z.iso.date(),
        tipo: z.enum(["livre", "fixo"]),
        percentual: z.number().finite().nonnegative().nullable(),
        valor: z.number().finite().positive(),
        baseCalculo: z.enum(["saldo_devedor", "valor_carta"]),
        pagamento: z.object({
            composicao: z.object({
                embutido: valorSchema,
                fgts: valorSchema,
                proprio: valorSchema,
                outro: valorSchema,
            }),
            observacoes: z.string().trim().nullable(),
        }),
    })
    .refine(
        (data) => {
            const composicao = data.pagamento.composicao;
            const total = composicao.embutido + composicao.fgts + composicao.proprio + composicao.outro;
            return Math.abs(total - data.valor) < 0.01;
        },
        { message: "A composição deve ser igual ao valor total do lance." }
    );

export type CorrigirLanceInput = z.infer<typeof corrigirLanceSchema>;
