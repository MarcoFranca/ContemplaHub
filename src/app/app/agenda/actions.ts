"use server";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

export type AgendamentoStatus = "agendado" | "confirmado" | "cancelado" | "realizado" | "no_show";

export type Agendamento = {
    id: string;
    lead_id: string | null;
    lead_nome: string | null;
    lead_telefone: string | null;
    titulo: string;
    inicio: string;
    fim: string | null;
    status: AgendamentoStatus;
    origem: string;
    observacao: string | null;
};

type Row = {
    id: string;
    lead_id: string | null;
    titulo: string;
    inicio: string;
    fim: string | null;
    status: AgendamentoStatus;
    origem: string;
    observacao: string | null;
};

export async function loadAgendamentosAction(): Promise<Agendamento[]> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) return [];

    const { data, error } = await supabaseAdmin
        .from("agendamentos")
        .select("id, lead_id, titulo, inicio, fim, status, origem, observacao")
        .eq("org_id", profile.orgId)
        .order("inicio", { ascending: true })
        .limit(500);

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as unknown as Row[];

    // Busca nomes/telefones dos leads numa segunda query (evita depender do
    // cache de relacionamento do PostgREST, que não recarrega de forma confiável).
    const leadIds = [...new Set(rows.map((r) => r.lead_id).filter((v): v is string => Boolean(v)))];
    const leadMap = new Map<string, { nome: string | null; telefone: string | null }>();
    if (leadIds.length) {
        const { data: leadsData } = await supabaseAdmin
            .from("leads")
            .select("id, nome, telefone")
            .eq("org_id", profile.orgId)
            .in("id", leadIds);
        for (const l of leadsData ?? []) {
            leadMap.set(l.id as string, { nome: l.nome ?? null, telefone: l.telefone ?? null });
        }
    }

    return rows.map((r) => ({
        id: r.id,
        lead_id: r.lead_id,
        lead_nome: r.lead_id ? leadMap.get(r.lead_id)?.nome ?? null : null,
        lead_telefone: r.lead_id ? leadMap.get(r.lead_id)?.telefone ?? null : null,
        titulo: r.titulo,
        inicio: r.inicio,
        fim: r.fim,
        status: r.status,
        origem: r.origem,
        observacao: r.observacao,
    }));
}

export async function updateAgendamentoStatusAction(
    id: string,
    status: AgendamentoStatus,
): Promise<{ ok: boolean; error?: string }> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) return { ok: false, error: "Sessão inválida." };

    const { error } = await supabaseAdmin
        .from("agendamentos")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("org_id", profile.orgId)
        .eq("id", id);

    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

export async function updateAgendamentoAction(
    id: string,
    patch: Partial<{ titulo: string; inicio: string; fim: string | null; observacao: string | null }>,
): Promise<{ ok: boolean; error?: string }> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) return { ok: false, error: "Sessão inválida." };

    if (patch.inicio && patch.fim && new Date(patch.inicio) >= new Date(patch.fim)) {
        return { ok: false, error: "O fim deve ser depois do início." };
    }

    const { error } = await supabaseAdmin
        .from("agendamentos")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("org_id", profile.orgId)
        .eq("id", id);

    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

export type FeriadoCustom = { id: string; data: string; nome: string; uf: string | null };

export async function listFeriadosCustomAction(): Promise<FeriadoCustom[]> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) return [];
    const { data } = await supabaseAdmin
        .from("agenda_feriados")
        .select("id, data, nome, uf")
        .eq("org_id", profile.orgId)
        .order("data", { ascending: true });
    return (data ?? []) as FeriadoCustom[];
}

export async function addFeriadoCustomAction(
    data: string,
    nome: string,
    uf: string,
): Promise<{ ok: boolean; error?: string }> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) return { ok: false, error: "Sessão inválida." };
    if (!data || !nome.trim()) return { ok: false, error: "Informe data e nome do feriado." };
    const { error } = await supabaseAdmin.from("agenda_feriados").insert({
        org_id: profile.orgId,
        data,
        nome: nome.trim(),
        uf: uf.trim() || null,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

export async function deleteFeriadoCustomAction(id: string): Promise<{ ok: boolean; error?: string }> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) return { ok: false, error: "Sessão inválida." };
    const { error } = await supabaseAdmin
        .from("agenda_feriados")
        .delete()
        .eq("org_id", profile.orgId)
        .eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}
