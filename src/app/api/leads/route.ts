// app/api/leads/route.ts
import { NextResponse } from "next/server";
import {
    LeadInSchema,
    normalizeLead,
    buildLeadNote,
    type LeadIn,
} from "@/lib/validators/lead";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
    try {
        const ua = req.headers.get("user-agent") ?? null;
        const fwd = req.headers.get("x-forwarded-for") || "";
        const ip = fwd.split(",")[0]?.trim() || null;

        // NUNCA tipar como any; use unknown e valide com Zod
        const bodyUnknown: unknown = await req.json();

        // Honeypot rápido antes (precisa de um tipo de “sondagem” com narrowing)
        if (
            typeof bodyUnknown === "object" &&
            bodyUnknown !== null &&
            "company" in bodyUnknown &&
            typeof (bodyUnknown as { company: unknown }).company === "string" &&
            ((bodyUnknown as { company: string }).company.trim().length > 0)
        ) {
            return NextResponse.json({ ok: true }, { status: 200 });
        }

        // Validação/parse: agora vira LeadIn tipado
        const parsed: LeadIn = LeadInSchema.parse(bodyUnknown);

        // Normaliza p/ snake_case do banco
        const leadDb = normalizeLead(parsed);

        // Insert
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!, // server only
            { auth: { persistSession: false } }
        );

        const { data: leadInsert, error } = await supabase
            .from("leads")
            .insert([leadDb])
            .select("id")
            .single();

        if (error) {
            console.error("SUPABASE INSERT ERROR", error);
            return NextResponse.json({ error: "Falha ao registrar lead." }, { status: 500 });
        }

        const leadId = leadInsert.id as string;

        // Log de consentimento (não tipar como any)
        if (leadDb.consentimento) {
            const { error: cErr } = await supabase.from("consent_logs").insert([
                {
                    lead_id: leadId,
                    consentimento: true,
                    scope: leadDb.consent_scope,
                    ip,
                    user_agent: ua,
                },
            ]);
            if (cErr) console.error("SUPABASE CONSENT ERROR", cErr);
        }

        // Note
        const note = buildLeadNote(parsed);
        if (note) {
            const { error: nErr } = await supabase.from("notes").insert([
                { lead_id: leadId, body: note },
            ]);
            if (nErr) console.error("SUPABASE NOTE ERROR", nErr);
        }

        return NextResponse.json({ ok: true, id: leadId });
    } catch (e: unknown) {
        // Sem any: trate como unknown
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
