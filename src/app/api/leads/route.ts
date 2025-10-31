// app/api/leads/route.ts
import { NextResponse } from "next/server";
import {
    LeadInSchema,
    normalizeLead,
    buildLeadNote,
    type LeadIn,
} from "@/lib/validators/lead";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const LeadWithHashSchema = LeadInSchema.extend({
    // Hash público da landing page (ex.: "autentika" => /l/autentika)
    // Se não vier do form, cai no default "autentika".
    hash: z.string().min(2).default("autentika"),
});

export async function POST(req: Request) {
    try {
        const ua = req.headers.get("user-agent") ?? null;
        const fwd = req.headers.get("x-forwarded-for") || "";
        const ip = fwd.split(",")[0]?.trim() || null;

        // 1) Recebe o corpo cru (unknown) e faz honeypot antes (sem any)
        const bodyUnknown: unknown = await req.json();

        // Honeypot (campo "company"): se preenchido, ignoramos silenciosamente
        if (
            typeof bodyUnknown === "object" &&
            bodyUnknown !== null &&
            "company" in bodyUnknown &&
            typeof (bodyUnknown as { company: unknown }).company === "string" &&
            ((bodyUnknown as { company: string }).company.trim().length > 0)
        ) {
            return NextResponse.json({ ok: true }, { status: 200 });
        }

        // 2) Validação com Zod (agora aceitando "hash")
        const parsed = LeadWithHashSchema.parse(bodyUnknown);
        const { hash, ...rest } = parsed;

        // 3) Normaliza para snake_case do banco (mantém seu pipeline atual)
        const leadDbBase = normalizeLead(rest as LeadIn);

        // 4) Supabase (service role) – insere com owner/org/landing resolvidos por hash
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!, // server only
            { auth: { persistSession: false } }
        );

        // 4.1) Resolve landing pela hash
        const { data: landing, error: landErr } = await supabase
            .from("landing_pages")
            .select("id, org_id, owner_user_id, active")
            .eq("public_hash", hash)
            .maybeSingle();

        if (landErr) {
            console.error("SUPABASE LANDING ERROR", landErr);
            return NextResponse.json(
                { error: "Falha ao resolver landing." },
                { status: 500 }
            );
        }
        if (!landing || !landing.active) {
            return NextResponse.json(
                { error: "Landing inválida ou inativa." },
                { status: 400 }
            );
        }

        // 4.2) Monta payload final garantindo vínculo seguro (org/owner/landing)
        const toInsert = {
            ...leadDbBase,
            org_id: landing.org_id,
            owner_id: landing.owner_user_id,
            landing_id: landing.id,
            origem: leadDbBase.origem ?? "lp",
            consent_scope: leadDbBase.consent_scope ?? "lp_form",
            consent_ts: leadDbBase.consent_ts ?? new Date().toISOString(),
        };

        // 4.3) Insert (simples). Se quiser deduplicar, veja bloco comentado abaixo.
        const { data: leadInsert, error } = await supabase
            .from("leads")
            .insert([toInsert])
            .select("id")
            .single();

        // // ——— (Opcional) upsert deduplicando por (org_id, telefone, email) ———
        // // Precisa ter índice único: leads_contato_unique(org_id, telefone, email)
        // const { data: leadInsert, error } = await supabase
        //   .from("leads")
        //   .upsert([toInsert], {
        //     onConflict: "org_id,telefone,email",
        //     ignoreDuplicates: true, // não sobrescreve se já existir
        //   })
        //   .select("id")
        //   .single();
        // // ————————————————————————————————————————————————————————————————

        if (error) {
            console.error("SUPABASE INSERT ERROR", error);
            return NextResponse.json(
                { error: "Falha ao registrar lead." },
                { status: 500 }
            );
        }

        const leadId = leadInsert.id as string;

        // 5) Log de consentimento
        if (toInsert.consentimento) {
            const { error: cErr } = await supabase.from("consent_logs").insert([
                {
                    lead_id: leadId,
                    consentimento: true,
                    scope: toInsert.consent_scope,
                    ip,
                    user_agent: ua,
                },
            ]);
            if (cErr) console.error("SUPABASE CONSENT ERROR", cErr);
        }

        // 6) Nota automática (constrói a partir do payload original validado)
        const note = buildLeadNote(parsed as any as LeadIn); // reuso da sua função
        if (note) {
            const { error: nErr } = await supabase
                .from("notes")
                .insert([{ lead_id: leadId, body: note }]);
            if (nErr) console.error("SUPABASE NOTE ERROR", nErr);
        }

        return NextResponse.json({ ok: true, id: leadId });
    } catch (e: unknown) {
        const msg =
            e instanceof Error
                ? e.message
                : typeof e === "string"
                    ? e
                    : "Erro inesperado.";
        console.error("LEADS ROUTE ERROR", e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
