import { z } from "zod";

export const azosProfileSchema = z.object({
  data_nascimento: z.string().min(1, "Informe a data de nascimento."),
  sexo: z.enum(["m", "f"], { message: "Selecione o sexo informado para cotação." }),
  altura_m: z.coerce.number().gt(0.3, "Informe a altura em metros.").lt(3, "Altura inválida."),
  peso_kg: z.coerce.number().gt(1, "Informe o peso em kg.").lt(500, "Peso inválido."),
  fumante: z.boolean(),
  renda_mensal: z.coerce.number().min(0, "Informe a renda mensal."),
  profissao_id: z.string().min(1, "Selecione a profissão atual."),
  consentimento_confirmado: z.literal(true, { message: "Confirme a ciência do tratamento dos dados para cotação." }),
});

export const azosQuoteSchema = z.object({
  perfil: azosProfileSchema,
  coberturas: z.array(z.object({ code: z.string().min(1), capital: z.coerce.number().positive() })).min(1, "Selecione ao menos uma cobertura."),
});

export type AzosProfileInput = z.infer<typeof azosProfileSchema>;
export type AzosQuoteInput = z.infer<typeof azosQuoteSchema>;
