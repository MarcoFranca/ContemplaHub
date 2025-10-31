// src/app/app/leads/actions.ts
"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/server";

function srv() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

export type Stage = "novo" | "diagnostico" | "proposta" | "negociacao" | "fechamento" | "ativo" | "perdido";

export async function listLeadsForKanban() {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");
    const { data, error } = await srv()
        .from("leads")
        .select("id, nome, telefone, email, etapa, owner_id, created_at, utm_source, origem, valor_interesse")
        .eq("org_id", me.orgId)
        .order("created_at", { ascending: false });
    if (error) throw error;

    // vendedores só veem os próprios
    return (data ?? []).filter(r => (me.isManager ? true : r.owner_id === me.userId));
}

export async function moveLeadStage(payload: { leadId: string; to: Stage; reason?: string }) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    // 1) Atualiza a etapa
    const { error: uErr, data: updated } = await srv()
        .from("leads")
        .update({ etapa: payload.to, updated_at: new Date().toISOString() })
        .eq("id", payload.leadId)
        .eq("org_id", me.orgId)
        .select("id, etapa")
        .single();
    if (uErr) throw uErr;

    // 2) Histórico de etapa
    await srv().from("lead_stage_history").insert([{
        lead_id: payload.leadId,
        from_stage: null, // podemos carregar etapa anterior no client e mandar aqui se quiser
        to_stage: payload.to,
        moved_by: me.userId,
        reason: payload.reason ?? null,
    }]);

    revalidatePath("/app/leads");
    revalidatePath("/app"); // atualiza KPIs do dashboard
    return updated;
}
