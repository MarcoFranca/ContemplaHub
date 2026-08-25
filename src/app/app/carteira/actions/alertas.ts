"use server";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

export type CotaAlerta = {
    id: string;
    cota_id: string;
    lead_id: string | null;
    data: string;
    mensagem: string;
    status: "pendente" | "concluido" | "cancelado";
};

export type AlertaPendente = CotaAlerta & {
    cliente_nome: string | null;
    numero_cota: string | null;
    grupo_codigo: string | null;
    contrato_id: string | null;
};

export async function listAlertasCartaAction(cotaId: string): Promise<CotaAlerta[]> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return [];
    const { data } = await supabaseAdmin
        .from("cota_alertas")
        .select("id, cota_id, lead_id, data, mensagem, status")
        .eq("org_id", me.orgId)
        .eq("cota_id", cotaId)
        .order("data", { ascending: true });
    return (data ?? []) as CotaAlerta[];
}

export async function createAlertaAction(input: {
    cotaId: string;
    leadId: string | null;
    data: string;
    mensagem: string;
}): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sessão inválida." };
    if (!input.data || !input.mensagem.trim()) return { ok: false, error: "Informe data e mensagem." };
    const { error } = await supabaseAdmin.from("cota_alertas").insert({
        org_id: me.orgId,
        cota_id: input.cotaId,
        lead_id: input.leadId,
        data: input.data,
        mensagem: input.mensagem.trim(),
        created_by: me.userId ?? null,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

export async function updateAlertaStatusAction(
    id: string,
    status: "pendente" | "concluido" | "cancelado",
): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sessão inválida." };
    const { error } = await supabaseAdmin
        .from("cota_alertas")
        .update({ status, concluido_at: status === "concluido" ? new Date().toISOString() : null })
        .eq("org_id", me.orgId)
        .eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

/** Alertas pendentes da org, com contexto da carta, ordenados por data (para a central). */
export async function listAlertasPendentesAction(): Promise<AlertaPendente[]> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return [];

    const { data: alertas } = await supabaseAdmin
        .from("cota_alertas")
        .select("id, cota_id, lead_id, data, mensagem, status")
        .eq("org_id", me.orgId)
        .eq("status", "pendente")
        .order("data", { ascending: true })
        .limit(500);

    const rows = (alertas ?? []) as CotaAlerta[];
    if (!rows.length) return [];

    const cotaIds = [...new Set(rows.map((r) => r.cota_id))];
    const leadIds = [...new Set(rows.map((r) => r.lead_id).filter((v): v is string => Boolean(v)))];

    const [{ data: cotas }, { data: leads }, { data: contratos }] = await Promise.all([
        supabaseAdmin.from("cotas").select("id, numero_cota, grupo_codigo").eq("org_id", me.orgId).in("id", cotaIds),
        leadIds.length
            ? supabaseAdmin.from("leads").select("id, nome").eq("org_id", me.orgId).in("id", leadIds)
            : Promise.resolve({ data: [] as { id: string; nome: string | null }[] }),
        supabaseAdmin.from("contratos").select("id, cota_id").eq("org_id", me.orgId).in("cota_id", cotaIds),
    ]);

    const cotaMap = new Map((cotas ?? []).map((c) => [c.id as string, c]));
    const leadMap = new Map((leads ?? []).map((l) => [l.id as string, l.nome as string | null]));
    const contratoMap = new Map((contratos ?? []).map((c) => [c.cota_id as string, c.id as string]));

    return rows.map((r) => ({
        ...r,
        cliente_nome: r.lead_id ? leadMap.get(r.lead_id) ?? null : null,
        numero_cota: cotaMap.get(r.cota_id)?.numero_cota ?? null,
        grupo_codigo: cotaMap.get(r.cota_id)?.grupo_codigo ?? null,
        contrato_id: contratoMap.get(r.cota_id) ?? null,
    }));
}
