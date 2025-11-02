"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/server";
import {redirect} from "next/navigation";

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

/** Log simples de auditoria via service role */
async function audit(me: NonNullable<Me>, action: string, entity: string, entityId: string, diff?: unknown) {
    try {
        await srv().from("audit_logs").insert({
            org_id: me.orgId,
            actor_id: me.userId,
            entity,
            entity_id: entityId,
            action,
            diff: diff ?? {},
        });
    } catch {
        /* não quebra UX por falha de log */
    }
}

type ListArgs = { q?: string; page?: number; pageSize?: number; withOwner?: boolean };
type Row = { user_id: string; nome: string | null; role: string | null; created_at: string };

export async function listUsers({ q = "", page = 1, pageSize = 20, withOwner = false }: ListArgs = {}) {
    const me = await getCurrentProfile();
    requireOrg(me);

    const s = srv();

    // total
    const { count } = await s
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("org_id", me.orgId);

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data: rows, error } = await s
        .from("profiles")
        .select("user_id, nome, role, created_at")
        .eq("org_id", me.orgId)
        .order("created_at", { ascending: false })
        .range(start, end);

    if (error) throw error;

    // auth.users para email e se confirmou (convite pendente)
    const { data: list } = await s.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const mapAuth = new Map<string, { email?: string; invited?: boolean }>();
    for (const u of list?.users ?? []) {
        mapAuth.set(u.id, {
            email: u.email ?? undefined,
            invited: !u.email_confirmed_at,
        });
    }

    // owner
    let ownerId: string | null = null;
    if (withOwner) {
        const { data: org } = await s.from("orgs").select("owner_user_id").eq("id", me.orgId).single();
        ownerId = org?.owner_user_id ?? null;
    }

    // decora + filtra por q (nome ou email)
    const decorated = (rows ?? []).map((r: Row) => {
        const a = mapAuth.get(r.user_id) ?? {};
        const email = a.email;
        const invited = a.invited ?? false;
        return {
            ...r,
            email,
            invited,
            _owner: ownerId ? r.user_id === ownerId : false,
            _me: r.user_id === me.userId,
        };
    }).filter((r) => {
        if (!q) return true;
        const hay = `${(r.nome ?? "").toLowerCase()} ${(r.email ?? "").toLowerCase()}`;
        return hay.includes(q.toLowerCase());
    });

    const totalFiltered = q ? decorated.length : (count ?? decorated.length);
    return { rows: decorated, total: totalFiltered, ownerId };
}

export async function createUser(form: { email: string; nome: string; role: string }) {
    const me = await getCurrentProfile();
    requireManager(me);

    const requesterIsAdmin = (me.role ?? "").toLowerCase() === "admin";
    const requestedRole = (form.role ?? "vendedor").toString().toLowerCase();
    if (requestedRole === "admin" && !requesterIsAdmin) {
        redirect("/app/usuarios?err=" + encodeURIComponent("Apenas administradores podem criar outro admin."));
    }

    const s = srv();
    const admin = s.auth.admin;

    // 1) tenta ENVIAR CONVITE (cria o user se não existir e dispara e-mail)
    let uid: string | undefined;
    const { error: inviteErr, data: inviteData } = await admin.inviteUserByEmail(form.email, {
        // importante: a URL tem que bater com a configurada como "Site URL" no Supabase
        // e a sua rota de callback precisa resolver a sessão.
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    });

    if (!inviteErr) {
        uid = inviteData?.user?.id;
    } else {
        // 2) se já existe, não dá pra convidar de novo desse jeito; procuramos o user no Auth
        // (em bases pequenas, listar e filtrar por email é ok)
        const { data: list } = await admin.listUsers({ page: 1, perPage: 1000 });
        const found = list?.users?.find(u => (u.email ?? "").toLowerCase() === form.email.toLowerCase());
        if (found) {
            uid = found.id;
            // opcional: se quiser, gere um link de convite manual:
            // const { data: linkData } = await admin.generateLink({ type: 'invite', email: form.email, options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` }});
            // ... e envie esse link via Postmark pela sua própria rotina de e-mail.
        } else {
            // fallback: tentar criar sem enviar e-mail (não dispara convite)
            const { data: signUp, error: signErr } = await admin.createUser({
                email: form.email,
                email_confirm: false,
                user_metadata: { nome: form.nome },
            });
            if (signErr || !signUp?.user?.id) {
                redirect("/app/usuarios?err=" + encodeURIComponent(inviteErr.message));
            }
            uid = signUp.user.id;
        }
    }

    // 3) garante profile na mesma org
    const { error: pErr } = await s.from("profiles").upsert({
        user_id: uid!,
        org_id: me.orgId,
        nome: form.nome,
        role: requestedRole,
    });
    if (pErr) redirect("/app/usuarios?err=" + encodeURIComponent(pErr.message));

    // 4) auditoria + refresh + toast OK
    await audit(me!, "create", "profile", uid!, { email: form.email, nome: form.nome, role: requestedRole, invited: !inviteErr });
    revalidatePath("/app/usuarios");

    // Mensagem de sucesso muda conforme houve convite por e-mail
    redirect("/app/usuarios?ok=" + (inviteErr ? "created" : "invited"));
}

export async function updateRole(payload: { userId: string; role: string }) {
    const me = await getCurrentProfile();
    requireManager(me);

    const next = (payload.role ?? "vendedor").toString().toLowerCase();
    const requesterIsAdmin = (me.role ?? "").toLowerCase() === "admin";
    if (next === "admin" && !requesterIsAdmin) {
        throw new Error("Apenas administradores podem promover a admin.");
    }

    const s = srv();
    const { data: target, error: tErr } = await s
        .from("profiles")
        .select("user_id, org_id, role")
        .eq("user_id", payload.userId)
        .maybeSingle();
    if (tErr) throw tErr;
    if (!target) throw new Error("Usuário não encontrado.");

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

    await audit(me!, "update", "profile.role", payload.userId, { to: next, from: target.role });
    revalidatePath("/app/usuarios");
    return { ok: true as const };
}

export async function removeUser(userId: string) {
    const me = await getCurrentProfile();
    requireManager(me);

    const s = srv();
    const { data: org, error: oErr } = await s
        .from("orgs")
        .select("owner_user_id")
        .eq("id", me.orgId)
        .single();
    if (oErr) throw oErr;
    if (org.owner_user_id === userId) throw new Error("Não é permitido remover o dono da organização.");
    if (userId === me.userId) throw new Error("Você não pode remover a si mesmo.");

    const { error } = await s
        .from("profiles")
        .delete()
        .eq("user_id", userId)
        .eq("org_id", me.orgId);
    if (error) throw error;

    await audit(me!, "delete", "profile", userId, {});
    revalidatePath("/app/usuarios");
    return { ok: true as const };
}

export async function resendInvite(email: string) {
    const me = await getCurrentProfile();
    requireManager(me);

    const admin = srv().auth.admin;
    const { error } = await admin.inviteUserByEmail(email, {
        // redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    });
    if (error) throw error;

    await audit(me!, "invite", "profile", "-", { email });
    revalidatePath("/app/usuarios");
    return { ok: true as const };
}
