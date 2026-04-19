import { z } from "zod";

export const produtoSchema = z.enum(["imobiliario", "auto"]);
export const contratoStatusSchema = z.enum([
    "pendente_assinatura",
    "pendente_pagamento",
    "alocado",
    "contemplado",
    "cancelado",
]);
export const cotaSituacaoSchema = z.enum([
    "ativa",
    "contemplada",
    "cancelada",
]);

const optionalNullableString = z.string().trim().optional().nullable();

const optionalNullableNumber = z.preprocess((value) => {
    if (value === "" || value === undefined) return null;
    return value;
}, z.number().nullable().optional());

const optionalPartnerId = z
    .union([z.string().uuid(), z.literal(""), z.null()])
    .optional();

const lanceFixoOptionSchema = z.object({
    id: z.string().optional(),
    ordem: z.number().int().min(1).max(6),
    percentual: z.number().min(0).max(100).nullable().optional(),
    ativo: z.boolean(),
    observacoes: optionalNullableString,
});

export const contratoBaseSchema = z.object({
    leadId: z.string().uuid("Lead inválido."),
    dealId: z.string().uuid().optional().nullable(),

    administradoraId: z.string().uuid("Administradora inválida."),
    grupoCodigo: z.string().trim().min(1, "Informe o grupo."),
    numeroCota: z.string().trim().min(1, "Informe o número da cota."),
    produto: produtoSchema,

    valorCarta: z.coerce.number().positive("Informe o valor da carta."),
    prazo: z.coerce.number().int().positive("Informe o prazo."),
    valorParcela: optionalNullableNumber,
    valorParcelaSemRedutor: optionalNullableNumber,
    dataAdesao: optionalNullableString,
    assembleiaDia: z
        .union([z.coerce.number().int().min(1).max(31), z.null()])
        .optional(),
    observacoes: optionalNullableString,

    numeroContrato: optionalNullableString,
    dataAssinatura: optionalNullableString,

    parcelaReduzida: z.boolean(),
    percentualReducao: z.coerce.number().min(0).max(100).nullable().optional(),
    autorizacaoGestao: z.boolean(),
    fgtsPermitido: z.boolean(),
    embutidoPermitido: z.boolean(),
    embutidoMaxPercent: z.coerce.number().min(0).max(100).nullable().optional(),
    opcoesLanceFixo: z.array(lanceFixoOptionSchema).max(6),

    percentualComissao: z.coerce
        .number()
        .positive("Informe o percentual da comissão.")
        .max(100, "A comissão não pode ser maior que 100%."),

    impostoRetidoPct: z.coerce
        .number()
        .min(0, "Imposto inválido.")
        .max(100, "Imposto inválido.")
        .optional()
        .nullable(),

    comissaoObservacoes: optionalNullableString,

    parceiroId: optionalPartnerId,
    repassePercentualComissao: optionalNullableNumber,
    parceiroObservacoes: optionalNullableString,

    contractStatus: contratoStatusSchema.optional().nullable(),
    cotaSituacao: cotaSituacaoSchema.optional().nullable(),
}).superRefine((data, ctx) => {
    if (data.parcelaReduzida && data.percentualReducao == null) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["percentualReducao"],
            message: "Informe o percentual do redutor.",
        });
    }

    if (data.embutidoPermitido && data.embutidoMaxPercent == null) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["embutidoMaxPercent"],
            message: "Informe o percentual máximo do embutido.",
        });
    }

    const ativos = data.opcoesLanceFixo.filter((item) => item.ativo);
    const percentuais = new Set<string>();
    const ordens = new Set<number>();

    for (const item of ativos) {
        if (item.percentual == null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["opcoesLanceFixo"],
                message: "Informe o percentual de todas as opções ativas de lance fixo.",
            });
            continue;
        }

        const pctKey = item.percentual.toFixed(4);
        if (percentuais.has(pctKey)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["opcoesLanceFixo"],
                message: "Não repita percentuais entre modalidades ativas.",
            });
        }
        if (ordens.has(item.ordem)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["opcoesLanceFixo"],
                message: "Não repita a ordem das modalidades de lance fixo.",
            });
        }
        percentuais.add(pctKey);
        ordens.add(item.ordem);
    }
});

export const fromLeadSchema = contratoBaseSchema.superRefine((data, ctx) => {
    if (data.contractStatus) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["contractStatus"],
            message: "Nova venda não deve definir status inicial avançado.",
        });
    }

    if (data.cotaSituacao && data.cotaSituacao !== "ativa") {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["cotaSituacao"],
            message: "Nova venda deve iniciar com cota ativa.",
        });
    }
});

export const registerExistingSchema = contratoBaseSchema.superRefine(
    (data, ctx) => {
        if (!data.contractStatus) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["contractStatus"],
                message: "Informe o status inicial do contrato.",
            });
        }

        if (!data.cotaSituacao) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["cotaSituacao"],
                message: "Informe a situação inicial da cota.",
            });
        }

        const parceiroNormalizado =
            data.parceiroId == null || data.parceiroId === ""
                ? null
                : data.parceiroId;

        const repasseNormalizado =
            data.repassePercentualComissao == null ||
            Number.isNaN(data.repassePercentualComissao)
                ? null
                : data.repassePercentualComissao;

        const hasParceiro = !!parceiroNormalizado;
        const hasRepasse = repasseNormalizado != null;

        if (hasParceiro && !hasRepasse) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["repassePercentualComissao"],
                message:
                    "Quando houver parceiro, informe o percentual de repasse sobre a comissão.",
            });
        }

        if (!hasParceiro && hasRepasse) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["parceiroId"],
                message: "Repasse só pode existir quando houver parceiro.",
            });
        }
    }
);

export type ContratoBaseFormValues = z.infer<typeof contratoBaseSchema>;
export type FromLeadFormValues = z.infer<typeof fromLeadSchema>;
export type RegisterExistingFormValues = z.infer<typeof registerExistingSchema>;
