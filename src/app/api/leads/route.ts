import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { z } from "zod";

const LeadInSchema = z.object({
    org_id: z.string().uuid().optional(),
    landing_id: z.string().uuid().optional(),
    public_hash: z.string().min(2).optional(),
    hash: z.string().min(2).optional(), // alias legado

    nome: z.string().min(2),
    telefone: z.string().min(6),
    email: z.string().email().optional().nullable(),

    // campos conforme seu schema atual
    valorInteresse: z.coerce.number().optional().nullable(),
    prazoMeses: z.coerce.number().optional().nullable(),
    objetivo: z.string().optional().nullable(),
    perfil: z.string().optional().nullable(),
    observacoes: z.string().optional().nullable(),

    consentimento: z.union([z.boolean(), z.string()]).transform(v => (v === true || v === "true")),

    utm_source: z.string().optional().nullable(),
    utm_medium: z.string().optional().nullable(),
    utm_campaign: z.string().optional().nullable(),
    utm_term: z.string().optional().nullable(),
    utm_content: z.string().optional().nullable(),

    source_label: z.string().optional().nullable(),
    form_label: z.string().optional().nullable(),
    channel: z.string().optional().nullable(),
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
        const parsed = LeadInSchema.parse(body);

        if (!parsed.landing_id && !parsed.public_hash) {
            return NextResponse.json({ error: "landing_id ou public_hash obrigatório." }, { status: 400 });
        }

        // resolve landing
        let q = s.from("landing_pages")
            .select("id, org_id, owner_user_id, public_hash, active, allowed_domains, webhook_secret")
            .eq("active", true);
        if (parsed.landing_id) q = q.eq("id", parsed.landing_id);
        if (parsed.public_hash) q = q.eq("public_hash", parsed.public_hash);

        const { data: landing, error: landErr } = await q.single();
        if (landErr || !landing) {
            return NextResponse.json({ error: "Landing inválida/inativa." }, { status: 400 });
        }

        // allowed_domains
        const okDomain = Array.isArray(landing.allowed_domains) && landing.allowed_domains.length
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

        const payload = {
            org_id: landing.org_id,
            owner_id: landing.owner_user_id,
            landing_id: landing.id,
            origem: "lp_externa",
            nome: parsed.nome,
            telefone: parsed.telefone,
            email: parsed.email ?? null,
            valor_interesse: parsed.valorInteresse ?? null, // <- nome real na tabela? (se snake no banco)
            prazo_meses: parsed.prazoMeses ?? null,        // idem
            objetivo: parsed.objetivo ?? null,
            perfil: parsed.perfil ?? null,
            observacoes: parsed.observacoes ?? null,
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

        // 🔎 ATENÇÃO ao nome das colunas no Postgres
        // Se sua tabela usa snake_case (padrão Drizzle para nome real),
        // mantenha as chaves acima em snake_case.
        // Se você criou camelCase direto no Postgres, troque os nomes para camel aqui.

        const { data: lead, error: insErr } = await s
            .from("leads")
            .insert(payload)
            .select("id")
            .single();
        if (insErr) throw insErr;

        const leadId = lead.id as string;

        // consent log
        if (payload.consentimento) {
            await s.from("consent_logs").insert([{
                lead_id: leadId,
                consentimento: true,
                scope: payload.consent_scope,
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
