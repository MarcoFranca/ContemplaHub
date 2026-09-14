// POST /api/diagnostico/submit
// Funil público do Diagnóstico do Investidor: resolve a org pela landing (slug ou hash),
// calcula o diagnóstico (motor determinístico), cria o LEAD na org correta e persiste o
// diagnóstico completo em lead_diagnosticos. Retorna o resultado para renderizar a tela.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { computeDiagnostico } from "@/features/diagnostico/engine";
import type {
    DiagnosticoInputs,
    ObjetivoId,
    RegimeId,
    AtuacaoId,
    MomentoId,
    EstadoCivil,
} from "@/features/diagnostico/types";

const toDigits = (s?: string | null) => (s ? String(s).replace(/\D+/g, "") : "");

const srv = () =>
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false },
    });

const InputsSchema = z.object({
    slug: z.string().min(1), // slug ou public_hash da landing
    company: z.string().optional(), // honeypot

    // Etapa 1
    nome: z.string().min(2),
    whatsapp: z.string().min(8),
    estado: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    especialidade: z.string().optional().nullable(),
    estado_civil: z.enum(["solteiro", "casado", "divorciado", "viuvo"]),
    tem_filhos: z.coerce.boolean().default(false),
    idade_filhos: z.string().optional().nullable(),

    // Etapa 2
    regime: z.array(z.enum(["clt", "autonomo", "concursado"])).default([]),
    atuacao: z.enum(["plantonista", "residente", "especialista", "socio"]),
    momento_carreira: z
        .array(z.enum(["reduzindo", "consultorio_consolidado", "crescendo_consultorio", "residente"]))
        .default([]),
    objetivos: z.array(z.string()).default([]),

    // Etapa 3
    possui_imovel_quitado: z.coerce.boolean().default(false),
    possui_cnpj: z.coerce.boolean().default(false),
    possui_holding: z.coerce.boolean().default(false),

    // Etapa 4
    renda_mensal: z.coerce.number().min(0).default(0),
    custo_vida: z.coerce.number().min(0).default(0),
    aporte_mensal: z.coerce.number().min(0).default(0),
    capital_disponivel: z.coerce.number().min(0).default(0),
    patrimonio_atual: z.coerce.number().min(0).default(0),
    renda_passiva_atual: z.coerce.number().min(0).default(0),
    renda_passiva_desejada: z.coerce.number().min(0).default(0),
    plantoes_mes: z.coerce.number().min(0).max(60).optional().nullable(),
    pct_imoveis_atual: z.coerce.number().min(0).max(100).optional().nullable(),

    consentimento: z.union([z.boolean(), z.string()]).transform((v) => v === true || v === "true"),

    utm_source: z.string().optional().nullable(),
    utm_medium: z.string().optional().nullable(),
    utm_campaign: z.string().optional().nullable(),
    utm_term: z.string().optional().nullable(),
    utm_content: z.string().optional().nullable(),
});

export async function POST(req: Request) {
    try {
        const s = srv();
        const ua = req.headers.get("user-agent") ?? null;
        const referer = req.headers.get("referer") || "";
        const origin = req.headers.get("origin") || "";

        const body = await req.json().catch(() => ({}));
        const parsed = InputsSchema.parse(body);

        // Honeypot
        if (parsed.company && parsed.company.trim().length > 0) {
            return NextResponse.json({ ok: true, spam: true });
        }

        const telefone = toDigits(parsed.whatsapp);
        if (telefone.length < 10) {
            return NextResponse.json({ error: "WhatsApp inválido." }, { status: 400 });
        }

        // Resolve landing (slug OU public_hash), precisa estar ativa
        const key = parsed.slug.trim();
        let { data: landing } = await s
            .from("landing_pages")
            .select("id, org_id, owner_user_id, active, allowed_domains, slug, public_hash")
            .eq("slug", key)
            .maybeSingle();
        if (!landing) {
            const r2 = await s
                .from("landing_pages")
                .select("id, org_id, owner_user_id, active, allowed_domains, slug, public_hash")
                .eq("public_hash", key)
                .maybeSingle();
            landing = r2.data;
        }
        if (!landing || !landing.active) {
            return NextResponse.json({ error: "Formulário inválido ou inativo." }, { status: 404 });
        }

        // allowed_domains (se configurado)
        const okDomain =
            Array.isArray(landing.allowed_domains) && landing.allowed_domains.length
                ? landing.allowed_domains.some((d: string) => origin.includes(d) || referer.includes(d))
                : true;
        if (!okDomain) {
            return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
        }

        // Monta inputs do motor e calcula
        const inputs: DiagnosticoInputs = {
            nome: parsed.nome,
            whatsapp: telefone,
            estado: parsed.estado ?? "",
            email: parsed.email ?? null,
            especialidade: parsed.especialidade ?? null,
            estado_civil: parsed.estado_civil as EstadoCivil,
            tem_filhos: parsed.tem_filhos,
            idade_filhos: parsed.idade_filhos ?? null,
            regime: parsed.regime as RegimeId[],
            atuacao: parsed.atuacao as AtuacaoId,
            momento_carreira: parsed.momento_carreira as MomentoId[],
            objetivos: parsed.objetivos as ObjetivoId[],
            possui_imovel_quitado: parsed.possui_imovel_quitado,
            possui_cnpj: parsed.possui_cnpj,
            possui_holding: parsed.possui_holding,
            renda_mensal: parsed.renda_mensal,
            custo_vida: parsed.custo_vida,
            aporte_mensal: parsed.aporte_mensal,
            capital_disponivel: parsed.capital_disponivel,
            patrimonio_atual: parsed.patrimonio_atual,
            renda_passiva_atual: parsed.renda_passiva_atual,
            renda_passiva_desejada: parsed.renda_passiva_desejada,
            plantoes_mes: parsed.plantoes_mes ?? null,
            pct_imoveis_atual: parsed.pct_imoveis_atual ?? null,
        };
        const resultado = computeDiagnostico(inputs);

        // Cria o LEAD (cai na carteira da org)
        const objetivoPrincipal = parsed.objetivos[0] ?? null;
        const { data: lead, error: insErr } = await s
            .from("leads")
            .insert({
                org_id: landing.org_id,
                owner_id: landing.owner_user_id,
                landing_id: landing.id,
                origem: "lp",
                nome: parsed.nome,
                telefone,
                email: parsed.email ?? null,
                estado: parsed.estado ?? null,
                perfil: "nao_informado",
                consentimento: parsed.consentimento,
                consent_scope: "diagnostico",
                consent_ts: new Date().toISOString(),
                utm_source: parsed.utm_source ?? null,
                utm_medium: parsed.utm_medium ?? null,
                utm_campaign: parsed.utm_campaign ?? null,
                utm_term: parsed.utm_term ?? null,
                utm_content: parsed.utm_content ?? null,
                source_label: "Diagnóstico do Investidor",
                form_label: "diagnostico",
                channel: "diagnostico",
                referrer_url: referer || null,
                user_agent: ua,
                etapa: "novo",
            })
            .select("id")
            .single();

        if (insErr) throw insErr;
        const leadId = lead.id as string;

        // Persiste o diagnóstico completo (tabela própria do funil público)
        const { error: diagErr } = await s.from("diagnostico_investidor").insert({
            org_id: landing.org_id,
            lead_id: leadId,
            landing_id: landing.id,
            inputs,
            resultado,
            estagio: resultado.estagio.nome,
            estagio_nivel: resultado.estagio.nivel,
            score: resultado.saude.score,
            cobertura_10a: resultado.independencia.cobertura_pct_10a,
        });
        if (diagErr) throw diagErr;

        // Registra interesse (para a esteira comercial)
        await s
            .from("lead_interesses")
            .insert({
                org_id: landing.org_id,
                lead_id: leadId,
                produto: "imobiliario",
                valor_total: parsed.capital_disponivel || null,
                objetivo: objetivoPrincipal,
                observacao: `Diagnóstico: ${resultado.estagio.nome} · saúde ${resultado.saude.score}/100 · cobertura 10a ${resultado.independencia.cobertura_pct_10a}%`,
                status: "aberto",
                created_by: landing.owner_user_id,
            })
            .then(
                () => null,
                () => null, // não bloqueia o fluxo se lead_interesses falhar
            );

        // WhatsApp da org para o CTA "Falar com a equipe"
        const { data: org } = await s
            .from("orgs")
            .select("nome, whatsapp_phone")
            .eq("id", landing.org_id)
            .maybeSingle();

        return NextResponse.json({
            ok: true,
            lead_id: leadId,
            resultado,
            org: { nome: org?.nome ?? null, whatsapp_phone: org?.whatsapp_phone ?? null },
        });
    } catch (e) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: "Dados inválidos.", issues: e.issues }, { status: 400 });
        }
        const msg = e instanceof Error ? e.message : "Erro inesperado";
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
