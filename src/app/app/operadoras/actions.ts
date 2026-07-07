"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

export type Administradora = {
    id: string;
    nome: string;
    cnpj: string | null;
    site: string | null;
    org_id: string | null;
    overrides_global_id: string | null;
    is_global: boolean;
    is_override: boolean;
};

type AdministradoraRow = {
    id: string;
    nome: string;
    cnpj: string | null;
    site: string | null;
    org_id: string | null;
    overrides_global_id: string | null;
};

/** Lista operadoras da org: globais NÃO sobrescritas + as próprias da org. */
export async function listAdministradorasAction(): Promise<Administradora[]> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return [];

    const { data } = await supabaseAdmin
        .from("administradoras")
        .select("id, nome, cnpj, site, org_id, overrides_global_id")
        .or(`org_id.eq.${me.orgId},org_id.is.null`)
        .order("nome", { ascending: true });

    const rows = (data ?? []) as AdministradoraRow[];
    const overridden = new Set(
        rows.filter((r) => r.org_id === me.orgId && r.overrides_global_id).map((r) => r.overrides_global_id as string),
    );

    return rows
        .filter((r) => !(r.org_id === null && overridden.has(r.id)))
        .map((r) => ({
            ...r,
            is_global: r.org_id === null,
            is_override: Boolean(r.overrides_global_id),
        }));
}

type Input = { nome: string; cnpj?: string | null; site?: string | null };

function clean(input: Input) {
    return {
        nome: input.nome.trim(),
        cnpj: (input.cnpj || "").trim() || null,
        site: (input.site || "").trim() || null,
    };
}

export async function createAdministradoraAction(input: Input): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Org inválida." };
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome da operadora." };

    const { error } = await supabaseAdmin.from("administradoras").insert({ org_id: me.orgId, ...clean(input) });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/operadoras");
    return { ok: true };
}

export async function updateAdministradoraAction(
    id: string,
    input: Input,
): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Org inválida." };
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome da operadora." };

    const { data: rows } = await supabaseAdmin
        .from("administradoras")
        .select("id, org_id, overrides_global_id")
        .eq("id", id)
        .limit(1);
    const target = (rows ?? [])[0] as { id: string; org_id: string | null } | undefined;
    if (!target) return { ok: false, error: "Operadora não encontrada." };

    if (target.org_id === me.orgId) {
        // Operadora da própria org: edita direto.
        const { error } = await supabaseAdmin.from("administradoras").update(clean(input)).eq("id", id).eq("org_id", me.orgId);
        if (error) return { ok: false, error: error.message };
    } else if (target.org_id === null) {
        // Editar uma GLOBAL: cria (ou atualiza) a cópia da org que a sobrescreve.
        const { data: existing } = await supabaseAdmin
            .from("administradoras")
            .select("id")
            .eq("org_id", me.orgId)
            .eq("overrides_global_id", id)
            .limit(1);
        const overrideId = (existing ?? [])[0]?.id as string | undefined;
        if (overrideId) {
            const { error } = await supabaseAdmin.from("administradoras").update(clean(input)).eq("id", overrideId);
            if (error) return { ok: false, error: error.message };
        } else {
            const { error } = await supabaseAdmin
                .from("administradoras")
                .insert({ org_id: me.orgId, overrides_global_id: id, ...clean(input) });
            if (error) return { ok: false, error: error.message };
        }
    } else {
        return { ok: false, error: "Sem permissão para editar esta operadora." };
    }

    revalidatePath("/app/operadoras");
    return { ok: true };
}

export async function deleteAdministradoraAction(id: string): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Org inválida." };

    // Só remove operadoras da própria org (globais nunca são deletadas).
    const { data: rows } = await supabaseAdmin
        .from("administradoras")
        .select("id, org_id")
        .eq("id", id)
        .limit(1);
    const target = (rows ?? [])[0] as { org_id: string | null } | undefined;
    if (!target) return { ok: false, error: "Operadora não encontrada." };
    if (target.org_id !== me.orgId) return { ok: false, error: "Operadoras globais não podem ser excluídas." };

    const { error } = await supabaseAdmin.from("administradoras").delete().eq("id", id).eq("org_id", me.orgId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/operadoras");
    return { ok: true };
}
