// ================= API ROUTE (exemplo) =================
// Coloque em: src/app/api/lead/route.ts
// Este endpoint usa a Supabase Service Role no servidor para inserir o lead respeitando a RLS via role privilegiada.
// Em produção, prefira uma RPC SECURITY DEFINER no Postgres ou uma Supabase Edge Function para ainda mais controle.
export const runtime = "nodejs";
export async function POST(request: Request) {
    const body = await request.json();
    const orgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID; // defina no .env


    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return new Response(JSON.stringify({ error: "Supabase não configurado" }), { status: 500 });
    }


    try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );


        const payload = {
            org_id: orgId,
            nome: String(body.nome ?? ""),
            telefone: String(body.telefone ?? ""),
            email: body.email ? String(body.email) : null,
            origem: "lp",
            perfil: String(body.perfil ?? "nao_informado"),
            valor_interesse: body.valor_carta ? Number(String(body.valor_carta).replace(/[^0-9.]/g, "")) : null,
            prazo_meses: body.prazo_meses ? Number(body.prazo_meses) : null,
            consentimento: Boolean(body.consentimento),
            utm_source: body.utm_source ?? null,
            utm_medium: body.utm_medium ?? null,
            utm_campaign: body.utm_campaign ?? null,
            utm_term: body.utm_term ?? null,
            utm_content: body.utm_content ?? null,
        } as const;


        const { error } = await supabase.from("leads").insert(payload);
        if (error) throw error;


        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e?.message ?? "erro" }), { status: 500 });
    }
}