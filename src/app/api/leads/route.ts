// ============================
// FILE: app/api/leads/route.ts
// ============================
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


// IMPORTANTE: defina estas variáveis no ambiente (Vercel/locally):
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (apenas no servidor)


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            nome,
            telefone,
            email,
            objetivo,
            perfil_psico,
            consentimento,
            origem,
            utm_source,
            utm_campaign,
        } = body ?? {};


        if (!nome || !telefone || !email || !consentimento) {
            return NextResponse.json({ error: "Dados obrigatórios ausentes." }, { status: 400 });
        }


        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!, // server only
            { auth: { persistSession: false } }
        );


        const { error } = await supabase.from("leads").insert({
            nome,
            telefone,
            email,
            origem: origem ?? "lp-home",
            perfil_psico: perfil_psico ?? null,
            valor_carta: null,
            prazo: null,
            consentimento: Boolean(consentimento),
            etapa: "novo",
// campos extras opcionais
// objetivo, utm_source, utm_campaign
        });


        if (error) {
            console.error("SUPABASE INSERT ERROR", error);
            return NextResponse.json({ error: "Falha ao registrar lead." }, { status: 500 });
        }


        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("LEADS ROUTE ERROR", e);
        return NextResponse.json({ error: "Erro inesperado." }, { status: 500 });
    }
}