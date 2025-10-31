import { z } from "zod";

/* ----------------------- Helpers ----------------------- */
export const onlyDigits = (v: string) => v.replace(/\D+/g, "");
const trim = (v?: string | null) => (v ? v.trim() : "");

/* ------------------ Enums do seu banco ------------------ */
// canal_origem: 'lp','whatsapp','indicacao','orgânico','pago','outro'
export type CanalOrigem = "lp" | "whatsapp" | "indicacao" | "orgânico" | "pago" | "outro";

// perfil_psico: 'disciplinado_acumulador','sonhador_familiar',...
export type PerfilPsico =
    | "disciplinado_acumulador"
    | "sonhador_familiar"
    | "corporativo_racional"
    | "impulsivo_emocional"
    | "estrategico_oportunista"
    | "nao_informado";

/* ------------- Entrada vinda do formulário -------------- */
export const LeadInSchema = z.object({
    // básicos
    hash: z.string().min(2).default("autentika"),
    nome: z.string().min(2, "Nome obrigatório"),
    email: z.string().email("E-mail inválido"),
    telefone: z.string().min(10, "Telefone inválido"), // deve vir só dígitos (55DDDN...)

    // catálogo/fluxo (opcionais no INSERT inicial do lead)
    valor_carta: z.string().regex(/^\d+$/).optional(), // dígitos
    prazo_meses: z.string().regex(/^\d+$/).optional(),

    // UI/help
    objetivo: z.string().optional(),
    perfil_psico: z.string().optional(), // UI usa hifens, banco usa underscore

    // texto livre
    observacoes: z.string().optional(),

    // tracking
    origem: z.string().optional(),       // mapearemos p/ enum canal_origem
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    utm_term: z.string().optional(),
    utm_content: z.string().optional(),

    // LGPD
    consentimento: z.boolean().default(true),

    // honeypot
    company: z.string().optional(),

    // (opcional) tipo do consórcio vindo do form; lead não tem essa coluna
    // mas podemos usar para criar deal depois — aqui apenas aceitamos.
    tipo: z.enum(["imobiliario", "auto"]).optional(),
});

export type LeadIn = z.infer<typeof LeadInSchema>;

/* ------------- Mapeamentos p/ enums do Postgres ---------- */
export function mapOrigem(v?: string | null): CanalOrigem {
    const t = (v ?? "").toLowerCase();
    if (t.startsWith("lp")) return "lp";
    if (["whatsapp", "wa"].includes(t)) return "whatsapp";
    if (["indicacao", "indicação"].includes(t)) return "indicacao";
    if (["organico", "orgânico"].includes(t)) return "orgânico";
    if (["pago", "ads", "meta", "google"].includes(t)) return "pago";
    if (!t) return "lp";
    return "outro";
}

export function mapPerfil(v?: string | null): PerfilPsico {
    // UI vem com hifens/acentos → normaliza para enum com underscore
    const t = (v ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
    const norm = t.replace(/-/g, "_").replace(/\s+/g, "_");
    const allowed: PerfilPsico[] = [
        "disciplinado_acumulador",
        "sonhador_familiar",
        "corporativo_racional",
        "impulsivo_emocional",
        "estrategico_oportunista",
        "nao_informado",
    ];
    return (allowed.find((p) => p === norm) ?? "nao_informado") as PerfilPsico;
}
/* ===== Schemas literais (sem any) ===== */
const CanalOrigemSchema = z.union([
    z.literal("lp"),
    z.literal("whatsapp"),
    z.literal("indicacao"),
    z.literal("orgânico"),
    z.literal("pago"),
    z.literal("outro"),
]);

const PerfilPsicoSchema = z.union([
    z.literal("disciplinado_acumulador"),
    z.literal("sonhador_familiar"),
    z.literal("corporativo_racional"),
    z.literal("impulsivo_emocional"),
    z.literal("estrategico_oportunista"),
    z.literal("nao_informado"),
]);

const LeadStageSchema = z.union([
    z.literal("novo"),
    z.literal("diagnostico"),
    z.literal("proposta"),
    z.literal("negociacao"),
    z.literal("fechamento"),
    z.literal("ativo"),
    z.literal("perdido"),
]);

/* --------- Shape exato para INSERT com supabase-js --------
   ATENÇÃO: snake_case igual às colunas do Postgres. */
export const LeadDbSchema = z.object({
    nome: z.string(),
    email: z.string(),
    telefone: z.string(),
    origem: CanalOrigemSchema,
    perfil: PerfilPsicoSchema,
    valor_interesse: z.number().nullable(),
    prazo_meses: z.number().nullable(),
    consentimento: z.boolean(),
    consent_scope: z.string().nullable(),
    consent_ts: z.date().nullable(),
    utm_source: z.string().nullable(),
    utm_medium: z.string().nullable(),
    utm_campaign: z.string().nullable(),
    utm_term: z.string().nullable(),
    utm_content: z.string().nullable(),
    // ✅ sem any:
    etapa: LeadStageSchema.default("novo"),
});
export type LeadDb = z.infer<typeof LeadDbSchema>;

/* ------------- Normalizador principal (LeadIn → LeadDb) -------------- */
export function normalizeLead(input: LeadIn): LeadDb {
    const valor = input.valor_carta ? Number(input.valor_carta) : null;
    const prazo = input.prazo_meses ? Number(input.prazo_meses) : null;

    const out: LeadDb = {
        nome: trim(input.nome),
        email: trim(input.email).toLowerCase(),
        telefone: onlyDigits(input.telefone),       // manter apenas dígitos (ex.: 55DDDN...)
        origem: mapOrigem(input.origem),
        perfil: mapPerfil(input.perfil_psico),
        valor_interesse: Number.isFinite(valor as number) ? (valor as number) : null,
        prazo_meses: Number.isFinite(prazo as number) ? (prazo as number) : null,
        consentimento: Boolean(input.consentimento),
        consent_scope: "lead_form",
        consent_ts: input.consentimento ? new Date() : null,
        utm_source: trim(input.utm_source) || null,
        utm_medium: trim(input.utm_medium) || null,
        utm_campaign: trim(input.utm_campaign) || null,
        utm_term: trim(input.utm_term) || null,
        utm_content: trim(input.utm_content) || null,
        etapa: "novo",
    };

    return LeadDbSchema.parse(out);
}

/* --------- Texto amigável p/ notes (objetivo/perfil/obs) --------- */
export function buildLeadNote(input: LeadIn): string | null {
    const parts: string[] = [];
    if (input.objetivo) parts.push(`Objetivo: ${trim(input.objetivo)}`);
    if (input.perfil_psico) parts.push(`Perfil (UI): ${trim(input.perfil_psico)}`);
    if (input.observacoes) parts.push(`Obs: ${trim(input.observacoes)}`);
    if (parts.length === 0) return null;
    return parts.join("\n");
}
