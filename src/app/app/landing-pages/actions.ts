"use server";

import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";

function srv() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

function randHash(len = 6) {
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: len }, () => alphabet[(Math.random() * alphabet.length) | 0]).join("");
}

/** Garante que allowed_domains sempre vira string[] */
function normDomains(v: unknown): string[] {
    if (Array.isArray(v)) return v.map(String).filter(Boolean);
    if (typeof v === "string") {
        // tenta JSON primeiro
        try {
            const j = JSON.parse(v);
            if (Array.isArray(j)) return j.map(String).filter(Boolean);
        } catch {}
        // senão, quebra por vírgula/linha
        return v
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter(Boolean);
    }
    if (v && typeof v === "object") {
        // às vezes pode vir como Record<number,string>
        try {
            const arr = Object.values(v as Record<string, unknown>);
            return arr.map(String).filter(Boolean);
        } catch {}
    }
    return [];
}

export async function listLandingPages() {
    const me = await getCurrentProfile();
    if (!me?.orgId) return [];
    const { data, error } = await srv()
        .from("landing_pages")
        .select("id, slug, public_hash, active, utm_defaults, allowed_domains, webhook_secret, created_at")
        .eq("org_id", me.orgId)
        .order("created_at", { ascending: false });
    if (error) throw error;

    return (data ?? []).map((lp) => ({
        ...lp,
        allowed_domains: normDomains((lp as any).allowed_domains),
    }));
}

export async function getLandingDetail(idOrKey: string) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização");

    const s = srv();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrKey);

    let lp: any = null; let err: any = null;
    const sel = "id, org_id, slug, public_hash, active, utm_defaults, allowed_domains, webhook_secret, created_at";

    if (isUUID) {
        ({ data: lp, error: err } = await s.from("landing_pages").select(sel).eq("id", idOrKey).eq("org_id", me.orgId).single());
    } else {
        ({ data: lp, error: err } = await s.from("landing_pages").select(sel).eq("slug", idOrKey).eq("org_id", me.orgId).maybeSingle());
        if (!lp && !err) {
            const r2 = await s.from("landing_pages").select(sel).eq("public_hash", idOrKey).eq("org_id", me.orgId).maybeSingle();
            lp = r2.data; err = r2.error;
        }
    }
    if (err) throw err;
    if (!lp) throw new Error("LP não encontrada");

    const { data: org, error: oErr } = await s.from("orgs").select("id, nome, slug").eq("id", lp.org_id).single();
    if (oErr) throw oErr;

    return {
        id: lp.id,
        slug: lp.slug,
        public_hash: lp.public_hash,
        active: !!lp.active,
        utm_defaults: lp.utm_defaults ?? {},
        allowed_domains: normDomains(lp.allowed_domains),
        webhook_secret: lp.webhook_secret ?? null,
        created_at: lp.created_at,
        org: { id: org.id, nome: org.nome, slug: org.slug ?? null },
    };
}

export async function createLandingPage(input: {
    slug?: string | null;
    allowed_domains?: string[];
    utm_defaults?: Record<string, unknown> | null;
    active?: boolean;
}) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização");
    if (!me.isManager) throw new Error("Apenas administradores podem criar LPs");

    const payload: any = {
        org_id: me.orgId,
        owner_user_id: me.userId,
        slug: input.slug ?? null,
        public_hash: randHash(6),
        utm_defaults: input.utm_defaults ?? null,
        // se a coluna for text ou jsonb, o Supabase aceita array -> serializa internamente
        allowed_domains: Array.isArray(input.allowed_domains) ? input.allowed_domains : null,
        active: input.active ?? true,
    };

    const { data, error } = await srv().from("landing_pages").insert([payload]).select("id").single();
    if (error) throw error;

    revalidatePath("/app/landing-pages");
    return { id: data!.id as string };
}

export async function toggleLandingActive(id: string, active: boolean) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização");
    if (!me.isManager) throw new Error("Apenas administradores");

    const { error } = await srv().from("landing_pages").update({ active }).eq("id", id).eq("org_id", me.orgId);
    if (error) throw error;

    revalidatePath("/app/landing-pages");
    return { ok: true };
}

export async function deleteLandingPage(id: string) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização");
    if (!me.isManager) throw new Error("Apenas administradores");

    const { error } = await srv().from("landing_pages").delete().eq("id", id).eq("org_id", me.orgId);
    if (error) throw error;

    revalidatePath("/app/landing-pages");
    return { ok: true };
}

export async function regenHash(id: string) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização");
    if (!me.isManager) throw new Error("Apenas administradores");

    const { error } = await srv().from("landing_pages").update({ public_hash: randHash(6) }).eq("id", id).eq("org_id", me.orgId);
    if (error) throw error;

    revalidatePath("/app/landing-pages");
    return { ok: true };
}

function genSecret(len = 64) {
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: len }, () => alphabet[(Math.random() * alphabet.length) | 0]).join("");
}

export async function updateLandingSecurity(id: string, domains: string[]) {
    const me = await getCurrentProfile();
    if (!me?.orgId || !me.isManager) throw new Error("Sem permissão");

    const clean = domains.map((d) => d.trim()).filter(Boolean);
    const { error } = await srv()
        .from("landing_pages")
        .update({ allowed_domains: clean })
        .eq("id", id)
        .eq("org_id", me.orgId);
    if (error) throw error;

    revalidatePath(`/app/landing-pages/${id}`);
    return { ok: true };
}

export async function rotateWebhookSecret(id: string) {
    const me = await getCurrentProfile();
    if (!me?.orgId || !me.isManager) throw new Error("Sem permissão");

    const secret = genSecret();
    const { error } = await srv()
        .from("landing_pages")
        .update({ webhook_secret: secret })
        .eq("id", id)
        .eq("org_id", me.orgId);
    if (error) throw error;

    revalidatePath(`/app/landing-pages/${id}`);
    return { ok: true, secret };
}
