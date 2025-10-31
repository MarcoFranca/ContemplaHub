"use server";

import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";

function srv() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // server only
        { auth: { persistSession: false } }
    );
}

export async function getMinhaOrg() {
    const me = await getCurrentProfile();
    if (!me?.orgId) return null;

    const { data: org, error } = await srv()
        .from("orgs")
        .select("id, nome, created_at")
        .eq("id", me.orgId)
        .single();

    if (error) throw error;
    return org;
}

export async function renomearOrg(novoNome: string) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização");
    if (!me.isManager) throw new Error("Apenas administradores podem editar a organização");
    if (!novoNome || !novoNome.trim()) throw new Error("Nome inválido");

    const { error } = await srv()
        .from("orgs")
        .update({ nome: novoNome.trim() })
        .eq("id", me.orgId);

    if (error) throw error;
    revalidatePath("/app/organizacao");
    revalidatePath("/app");
    return { ok: true };
}
