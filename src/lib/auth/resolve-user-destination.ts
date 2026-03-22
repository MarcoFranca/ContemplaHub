"use server";

import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

export async function resolveUserDestination(): Promise<string> {
    const supabase = await supabaseServer();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return "/login?msg=Falha%20na%20autenticacao";
    }

    const service = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    const { data: profile } = await service
        .from("profiles")
        .select("user_id, org_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (profile?.org_id) {
        return "/app";
    }

    const { data: partner } = await service
        .from("partner_users")
        .select("id, ativo, org_id, parceiro_id")
        .eq("auth_user_id", user.id)
        .eq("ativo", true)
        .maybeSingle();

    if (partner?.org_id && partner?.parceiro_id) {
        return "/partner";
    }

    return "/login?msg=Usuario%20sem%20acesso";
}