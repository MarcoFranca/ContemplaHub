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
    let o = "";
    for (let i = 0; i < len; i++) o += alphabet[(Math.random() * alphabet.length) | 0];
    return o;
}

export async function listLandingPages() {
    const me = await getCurrentProfile();
    if (!me?.orgId) return [];
    const { data, error } = await srv()
        .from("landing_pages")
        .select("id, slug, public_hash, active, owner_user_id, utm_defaults, created_at")
        .eq("org_id", me.orgId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

export async function createLandingPage(payload: { slug?: string | null; utm_defaults?: any }) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização");
    if (!me.isManager) throw new Error("Apenas administradores podem criar LPs");

    const { data, error } = await srv()
        .from("landing_pages")
        .insert([{
            org_id: me.orgId,
            owner_user_id: me.userId,
            slug: payload.slug?.trim() || null,
            public_hash: randHash(6),
            utm_defaults: payload.utm_defaults ?? null,
            active: true,
        }])
        .select("id")
        .single();

    if (error) throw error;
    revalidatePath("/app/landing-pages");
    return data;
}

export async function toggleLandingActive(id: string, active: boolean) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização");
    if (!me.isManager) throw new Error("Apenas administradores");

    const { error } = await srv()
        .from("landing_pages")
        .update({ active })
        .eq("id", id)
        .eq("org_id", me.orgId);

    if (error) throw error;
    revalidatePath("/app/landing-pages");
    return { ok: true };
}

export async function deleteLandingPage(id: string) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização");
    if (!me.isManager) throw new Error("Apenas administradores");

    const { error } = await srv()
        .from("landing_pages")
        .delete()
        .eq("id", id)
        .eq("org_id", me.orgId);

    if (error) throw error;
    revalidatePath("/app/landing-pages");
    return { ok: true };
}

export async function regenHash(id: string) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização");
    if (!me.isManager) throw new Error("Apenas administradores");

    const { error } = await srv()
        .from("landing_pages")
        .update({ public_hash: randHash(6) })
        .eq("id", id)
        .eq("org_id", me.orgId);

    if (error) throw error;
    revalidatePath("/app/landing-pages");
    return { ok: true };
}
