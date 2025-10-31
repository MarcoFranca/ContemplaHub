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

type OrgData = {
    id: string;
    nome: string;
    slug: string | null;
    active: boolean | null;
    whatsapp_phone: string | null;
    email_from: string | null;
    brand: Record<string, unknown> | null;
    timezone: string | null;
    cnpj: string | null;
    susep: string | null;
    created_at: string;
};

export async function getMinhaOrg(): Promise<OrgData | null> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return null;

    const { data, error } = await srv()
        .from("orgs")
        .select(
            "id, nome, slug, active, whatsapp_phone, email_from, brand, timezone, cnpj, susep, created_at"
        )
        .eq("id", me.orgId)
        .single();

    if (error) throw error;
    return data as OrgData;
}

export async function renomearOrg(novoNome: string) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização");
    if (!me.isManager) throw new Error("Apenas administradores podem editar");
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

export async function criarOrg(nome: string) {
    const me = await getCurrentProfile();
    if (!me?.userId) throw new Error("Sem sessão");
    if (!nome || !nome.trim()) throw new Error("Nome inválido");

    const s = srv();
    const { data: org, error: oErr } = await s
        .from("orgs")
        .insert([{ nome: nome.trim() }])
        .select("id")
        .single();

    if (oErr) throw oErr;

    const { error: pErr } = await s
        .from("profiles")
        .update({ org_id: org.id, role: "admin" })
        .eq("user_id", me.userId);

    if (pErr) throw pErr;

    revalidatePath("/app/organizacao");
    revalidatePath("/app");
    return { ok: true, orgId: org.id as string };
}

export async function atualizarContatoBranding(form: {
    slug?: string | null;
    active?: boolean;
    whatsapp_phone?: string | null;
    email_from?: string | null;
    timezone?: string | null;
    cnpj?: string | null;
    susep?: string | null;
    brand_logo?: string | null;
    brand_primary?: string | null;
    brand_secondary?: string | null;
}) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização");
    if (!me.isManager) throw new Error("Apenas administradores podem editar");

    // monta brand json incremental
    const brand: Record<string, string> = {};
    if (form.brand_logo != null) brand.logoUrl = form.brand_logo;
    if (form.brand_primary != null) brand.primary = form.brand_primary;
    if (form.brand_secondary != null) brand.secondary = form.brand_secondary;

    const payload: Record<string, unknown> = {
        slug: form.slug?.trim() || null,
        active: form.active ?? true,
        whatsapp_phone: form.whatsapp_phone?.trim() || null,
        email_from: form.email_from?.trim() || null,
        timezone: form.timezone?.trim() || null,
        cnpj: form.cnpj?.trim() || null,
        susep: form.susep?.trim() || null,
    };

    // só envia brand se houver algum campo setado
    if (Object.keys(brand).length > 0) payload.brand = brand;

    const { error } = await srv()
        .from("orgs")
        .update(payload)
        .eq("id", me.orgId);

    if (error) throw error;

    revalidatePath("/app/organizacao");
    return { ok: true };
}
