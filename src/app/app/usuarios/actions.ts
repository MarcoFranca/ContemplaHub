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

export async function listUsers() {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");
    const { data, error } = await srv()
        .from("profiles")
        .select("user_id, nome, role, created_at")
        .eq("org_id", me.orgId)
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export async function createUser(form: { email: string; nome: string; role: string }) {
    const me = await getCurrentProfile();
    if (!me?.orgId || !me.isManager) throw new Error("Acesso negado.");
    // 1) criar usuário no Auth (link de convite opcionalmente)
    const admin = srv().auth.admin;
    const { data: signUp, error: signErr } = await admin.createUser({
        email: form.email,
        email_confirm: false, // envia confirmação
        user_metadata: { nome: form.nome },
    });
    if (signErr) throw signErr;

    // 2) criar/atualizar profile na mesma org
    const uid = signUp.user?.id!;
    const { error: pErr } = await srv().from("profiles").upsert({
        user_id: uid,
        org_id: me.orgId,
        nome: form.nome,
        role: form.role,
    });
    if (pErr) throw pErr;

    revalidatePath("/app/usuarios");
    return { ok: true };
}

export async function updateRole(payload: { userId: string; role: string }) {
    const me = await getCurrentProfile();
    if (!me?.orgId || !me.isManager) throw new Error("Acesso negado.");
    const { error } = await srv()
        .from("profiles")
        .update({ role: payload.role })
        .eq("user_id", payload.userId)
        .eq("org_id", me.orgId);
    if (error) throw error;
    revalidatePath("/app/usuarios");
    return { ok: true };
}

export async function removeUser(userId: string) {
    const me = await getCurrentProfile();
    if (!me?.orgId || !me.isManager) throw new Error("Acesso negado.");

    // Opcional: somente “desativar” no profile
    const { error } = await srv()
        .from("profiles")
        .delete()
        .eq("user_id", userId)
        .eq("org_id", me.orgId);
    if (error) throw error;

    // (opcional) admin.deleteUser(userId) – só faça se quiser remover do Auth
    revalidatePath("/app/usuarios");
    return { ok: true };
}
