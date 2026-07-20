"use server";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

export type Campanha = {
    id: string;
    nome: string;
    administradora_nome: string | null;
    produto: string | null;
    taxa_admin_pct: number | null;
    redutor_pct: number | null;
    fundo_reserva_pct: number | null;
    prazo_meses: number | null;
    embutido_max_pct: number | null;
    observacao: string | null;
    ativo: boolean;
    vigencia_inicio: string | null;
    vigencia_fim: string | null;
};

export type CampanhaInput = Omit<Campanha, "id">;

export async function listCampanhasAction(): Promise<Campanha[]> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return [];
    const { data } = await supabaseAdmin
        .from("campanhas")
        .select(
            "id, nome, administradora_nome, produto, taxa_admin_pct, redutor_pct, fundo_reserva_pct, prazo_meses, embutido_max_pct, observacao, ativo, vigencia_inicio, vigencia_fim",
        )
        .eq("org_id", me.orgId)
        .order("created_at", { ascending: true });
    return (data ?? []) as Campanha[];
}

export async function createCampanhaAction(
    input: CampanhaInput,
): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sessão inválida." };
    if (!input.nome.trim()) return { ok: false, error: "Dê um nome à campanha." };
    const { error } = await supabaseAdmin.from("campanhas").insert({
        org_id: me.orgId,
        ...input,
        produto: input.produto || null,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

export async function updateCampanhaAction(
    id: string,
    patch: Partial<CampanhaInput>,
): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sessão inválida." };
    const { error } = await supabaseAdmin
        .from("campanhas")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("org_id", me.orgId)
        .eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

export async function deleteCampanhaAction(id: string): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sessão inválida." };
    const { error } = await supabaseAdmin.from("campanhas").delete().eq("org_id", me.orgId).eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}
