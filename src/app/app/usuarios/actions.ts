// src/app/app/usuarios/actions.ts
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

/** Tipo do perfil retornado pelo seu getCurrentProfile */
type Me = Awaited<ReturnType<typeof getCurrentProfile>>;

/** Garante org presente e estreita o tipo (evita TS18047) */
function requireOrg(me: Me): asserts me is NonNullable<Me> & { orgId: string } {
    if (!me?.orgId) throw new Error("Sem organização.");
}

/** Garante manager + org e estreita o tipo */
function requireManager(
    me: Me
): asserts me is NonNullable<Me> & { orgId: string; isManager: boolean } {
    if (!me?.orgId || !me.isManager) throw new Error("Acesso negado.");
}

export async function listUsers() {
    const me = await getCurrentProfile();
    requireOrg(me);

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
    requireManager(me);

    // Só admin pode criar outro admin
    const requesterIsAdmin = (me.role ?? "").toLowerCase() === "admin";
    const requestedRole = (form.role ?? "vendedor").toString().toLowerCase();
    if (requestedRole === "admin" && !requesterIsAdmin) {
        throw new Error("Apenas administradores podem criar outro admin.");
    }

    // 1) cria usuário no Auth
    const admin = srv().auth.admin;
    const { data: signUp, error: signErr } = await admin.createUser({
        email: form.email,
        email_confirm: false,
        user_metadata: { nome: form.nome },
    });
    if (signErr) throw signErr;

    const uid = signUp?.user?.id;
    if (!uid) {
        throw new Error("Falha ao criar usuário no Auth: id ausente.");
    }

    // 2) cria/atualiza profile na mesma org
    const { error: pErr } = await srv().from("profiles").upsert({
        user_id: uid,
        org_id: me.orgId,
        nome: form.nome,
        role: requestedRole,
    });
    if (pErr) throw pErr;

    revalidatePath("/app/usuarios");
    return { ok: true as const };
}

export async function updateRole(payload: { userId: string; role: string }) {
    const me = await getCurrentProfile();
    requireManager(me);

    const next = (payload.role ?? "vendedor").toString().toLowerCase();

    // Só admin promove/demove para admin
    const requesterIsAdmin = (me.role ?? "").toLowerCase() === "admin";
    if (next === "admin" && !requesterIsAdmin) {
        throw new Error("Apenas administradores podem promover a admin.");
    }

    const s = srv();

    // Busca target na mesma org
    const { data: target, error: tErr } = await s
        .from("profiles")
        .select("user_id, org_id")
        .eq("user_id", payload.userId)
        .maybeSingle();
    if (tErr) throw tErr;
    if (!target) throw new Error("Usuário não encontrado.");

    // Dono da org não pode deixar de ser admin
    const { data: org, error: oErr } = await s
        .from("orgs")
        .select("owner_user_id")
        .eq("id", target.org_id)
        .single();
    if (oErr) throw oErr;

    if (org.owner_user_id === payload.userId && next !== "admin") {
        throw new Error("O dono da organização deve permanecer admin.");
    }

    const { error } = await s
        .from("profiles")
        .update({ role: next })
        .eq("user_id", payload.userId)
        .eq("org_id", me.orgId);
    if (error) throw error;

    revalidatePath("/app/usuarios");
    return { ok: true as const };
}

export async function removeUser(userId: string) {
    const me = await getCurrentProfile();
    requireManager(me);

    const s = srv();

    // Impede remover o dono da org
    const { data: org, error: oErr } = await s
        .from("orgs")
        .select("owner_user_id")
        .eq("id", me.orgId)
        .single();
    if (oErr) throw oErr;

    if (org.owner_user_id === userId) {
        throw new Error("Não é permitido remover o dono da organização.");
    }

    const { error } = await s
        .from("profiles")
        .delete()
        .eq("user_id", userId)
        .eq("org_id", me.orgId);
    if (error) throw error;

    revalidatePath("/app/usuarios");
    return { ok: true as const };
}
export async function resendInvite(email: string) {
    const me = await getCurrentProfile();
    requireManager(me);

    const admin = srv().auth.admin;
    const { error } = await admin.inviteUserByEmail(email, {
        // opcional: redireciono pós confirmação
        // redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    });
    if (error) throw error;

    revalidatePath("/app/usuarios");
    return { ok: true as const };
}