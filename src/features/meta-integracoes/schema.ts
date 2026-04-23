import { z } from "zod";

const optionalTrimmed = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const metaIntegrationFormSchema = z.object({
  nome: z.string().trim().min(2, "Informe um nome interno."),
  page_id: z.string().trim().min(1, "Informe o Page ID."),
  page_name: optionalTrimmed,
  form_id: optionalTrimmed,
  form_name: optionalTrimmed,
  source_label: z.string().trim().min(2, "Informe o rótulo da origem."),
  default_owner_id: optionalTrimmed,
  ativo: z.boolean().default(true),
  verify_token: optionalTrimmed,
  access_token: optionalTrimmed,
});

export type MetaIntegrationFormValues = z.infer<
  typeof metaIntegrationFormSchema
>;
export type MetaIntegrationFormInput = z.input<
  typeof metaIntegrationFormSchema
>;
