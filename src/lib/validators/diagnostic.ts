// src/lib/validators/diagnostic.ts
import { z } from "zod";

export const diagnosticSchema = z.object({
    objetivo: z.string().min(2),
    prazoMetaMeses: z.coerce.number().int().positive().max(200).optional(),
    preferenciaProduto: z.enum(["imovel","auto"]).optional(),
    regiaoPreferencia: z.string().optional(),

    rendaMensal: z.coerce.number().nonnegative().optional(),
    reservaInicial: z.coerce.number().nonnegative().optional(),
    comprometimentoMaxPct: z.coerce.number().min(0).max(100).optional(),
    rendaProvada: z.boolean().default(false),

    valorCartaAlvo: z.coerce.number().positive().optional(),
    prazoAlvoMeses: z.coerce.number().int().positive().max(240).optional(),
    estrategiaLance: z.enum(["livre","fixo","embutido"]).optional(),
    lanceBasePct: z.coerce.number().min(0).max(100).optional(),
    lanceMaxPct: z.coerce.number().min(0).max(100).optional(),
    janelaPreferidaSemanas: z.coerce.number().int().min(0).max(12).optional(),

    consentScope: z.string().optional(),
    consentTs: z.coerce.date().optional(),
    extras: z.record(z.string(), z.unknown()).optional(),
});

// ✅ Tipo para o RHF (entrada do schema, antes das coerções)
export type DiagnosticForm = z.input<typeof diagnosticSchema>;
// (se quiser também ter o tipo já coerido, útil no server/action)
export type DiagnosticData = z.output<typeof diagnosticSchema>;
