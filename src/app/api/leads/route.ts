import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { z } from "zod";

// helpers
const toDigits = (s?: string | null) => (s ? String(s).replace(/\D+/g, "") : "");
const toDecimal = (s?: string | null) =>
    s ? String(s).replace(/\./g, "").replace(",", ".") : null;

// Aceita camel + snake; normaliza tipos
const LeadInSchema = z.object({
    org_id: z.string().uuid().optional(),
    landing_id: z.string().uuid().optional(),
    public_hash: z.string().min(2).optional(),
    hash: z.string().min(2).optional(),

    nome: z.string().min(2),
    telefone: z.string().min(6),             // já virá em dígitos do client; revalidamos abaixo
    email: z.string().email().optional().nullable(),

    // aceita ambos padrões (form manda snake, antigo manda camel)
    valorInteresse: z.union([z.number(), z.string()]).optional().nullable(),
    valor_carta: z.union([z.number(), z.string()]).optional().nullable(),

    prazoMeses: z.union([z.number(), z.string()]).optional().nullable(),
    prazo_meses: z.union([z.number(), z.string()]).optional().nullable(),

    objetivo: z.string().optional().nullable(),
    perfil: z.string().optional().nullable(),       // alias de perfil_psico
    perfil_psico: z.string().optional().nullable(), // vindo do form

    observacoes: z.string().optional().nullable(),

    consentimento: z
        .union([z.boolean(), z.string()])
        .transform(v => (v === true || v === "true")),

    utm_source: z.string().optional().nullable(),
    utm_medium: z.string().optional().nullable(),
    utm_campaign: z.string().optional().nullable(),
    utm_term: z.string().optional().nullable(),
    utm_content: z.string().optional().nullable(),

    source_label: z.string().optional().nullable(),
    form_label: z.string().optional().nullable(),
    channel: z.string().optional().nullable(),

    // produto do interesse (ex.: "imobiliario" | "auto")
    tipo: z.string().optional().nullable(),
});

type LeadIn = z.infer<typeof LeadInSchema>;

const srv = () =>
    createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

function hmacOk(secret: string, body: string, signature: string | null): boolean {
    if (!secret || !signature) return false;
    const calc = crypto.createHmac("sha256", secret).update(body).digest("hex");
    try {
        return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(signature));
    } catch {
        return false;
    }
}

async function readBody(req: Request): Promise<{ data: any; raw: string; isJson: boolean }> {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
        const raw = await req.text();
        const data = JSON.parse(raw || "{}");
        return { data, raw, isJson: true };
    }
    const fd = await req.formData();
    const obj: Record<string, any> = {};
    fd.forEach((v, k) => (obj[k] = v));
    const raw = JSON.stringify(obj);
    return { data: obj, raw, isJson: false };
}

export async function POST(req: Request) {
    try {
        const s = srv();

        const ua = req.headers.get("user-agent") ?? null;
        const fwd = req.headers.get("x-forwarded-for") || "";
        const ip = fwd.split(",")[0]?.trim() || null;
        const origin = req.headers.get("origin") || "";
        const referer = req.headers.get("referer") || "";

        const { data: body, raw, isJson } = await readBody(req);

        // Honeypot
        if (typeof body?.company === "string" && body.company.trim().length > 0) {
            return NextResponse.json({ ok: true, spam: true });
        }

        if (body?.hash && !body?.public_hash) body.public_hash = body.hash;

        // Parse + normalização de aliases
        const parsed = LeadInSchema.parse(body);

        // normaliza telefone (garante dígitos)
        const telefoneDigits = toDigits(parsed.telefone);
        if (telefoneDigits.length < 10) {
            return NextResponse.json({ error: "Telefone inválido." }, { status: 400 });
        }

        // resolve landing
        if (!parsed.landing_id && !parsed.public_hash) {
            return NextResponse.json({ error: "landing_id ou public_hash obrigatório." }, { status: 400 });
        }

        let q = s
            .from("landing_pages")
            .select("id, org_id, owner_user_id, public_hash, active, allowed_domains, webhook_secret")
            .eq("active", true);
        if (parsed.landing_id) q = q.eq("id", parsed.landing_id);
        if (parsed.public_hash) q = q.eq("public_hash", parsed.public_hash);
        const { data: landing, error: landErr } = await q.single();
        if (landErr || !landing) {
            return NextResponse.json({ error: "Landing inválida/inativa." }, { status: 400 });
        }

        // allowed_domains
        const okDomain =
            Array.isArray(landing.allowed_domains) && landing.allowed_domains.length
                ? landing.allowed_domains.some((d: string) => origin.includes(d) || referer.includes(d))
                : true;
        if (!okDomain) {
            return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
        }

        // HMAC obrigatório em JSON se existir secret
        if (isJson && landing.webhook_secret) {
            const sig = req.headers.get("x-auth-signature");
            if (!hmacOk(landing.webhook_secret, raw, sig)) {
                return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
            }
        }

        // mapeia valores do interesse (aceita camel + snake)
        const valorInteresseIn =
            parsed.valorInteresse ??
            (parsed.valor_carta != null ? Number(toDecimal(String(parsed.valor_carta))) : null);

        const prazoMesesIn =
            parsed.prazoMeses ??
            (parsed.prazo_meses != null ? Number(parsed.prazo_meses) : null);

        const perfilIn = parsed.perfil ?? parsed.perfil_psico ?? null;

        // payload do lead (tabela leads)
        const leadPayload = {
            org_id: landing.org_id,
            owner_id: landing.owner_user_id,
            landing_id: landing.id,
            origem: "lp",
            nome: parsed.nome,
            telefone: telefoneDigits,
            email: parsed.email ?? null,
            perfil: "nao_informado",
            consentimento: parsed.consentimento,
            consent_scope: "lp_form",
            consent_ts: new Date().toISOString(),
            utm_source: parsed.utm_source ?? null,
            utm_medium: parsed.utm_medium ?? null,
            utm_campaign: parsed.utm_campaign ?? null,
            utm_term: parsed.utm_term ?? null,
            utm_content: parsed.utm_content ?? null,
            source_label: parsed.source_label ?? null,
            form_label: parsed.form_label ?? null,
            channel: parsed.channel ?? null,
            referrer_url: referer || null,
            user_agent: ua,
            etapa: "novo",
        };

        const { data: lead, error: insErr } = await s
            .from("leads")
            .insert(leadPayload)
            .select("id")
            .single();
        if (insErr) throw insErr;

        const leadId = lead.id as string;

        // cria interesse "aberto" se houver quaisquer dados
        const hasInterest =
            valorInteresseIn != null ||
            prazoMesesIn != null ||
            parsed.objetivo ||
            perfilIn ||
            parsed.observacoes ||
            parsed.tipo;

        if (hasInterest) {
            const { error: intErr } = await s.from("lead_interesses").insert({
                org_id: landing.org_id,
                lead_id: leadId,
                produto: parsed.tipo ?? null,                     // "imobiliario" | "auto"
                valor_total: valorInteresseIn as number | null,   // decimal normalizado
                prazo_meses: prazoMesesIn as number | null,
                objetivo: parsed.objetivo ?? null,
                perfil_desejado: perfilIn,
                observacao: parsed.observacoes ?? null,
                status: "aberto",
                created_by: landing.owner_user_id,
            });
            if (intErr) throw intErr;
        }

        // consent log
        if (leadPayload.consentimento) {
            await s.from("consent_logs").insert([{
                lead_id: leadId,
                consentimento: true,
                scope: leadPayload.consent_scope,
                ip,
                user_agent: ua,
            }]);
        }

        return NextResponse.json({ ok: true, id: leadId });
    } catch (e: any) {
        console.error("POST /api/leads error:", e);
        return NextResponse.json({ error: e?.message || "Erro inesperado" }, { status: 400 });
    }
}
