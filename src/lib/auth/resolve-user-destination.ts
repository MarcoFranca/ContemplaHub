"use server";

import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

export async function resolveUserDestinationFromUserId(
    userId: string
): Promise<string> {
    const service = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    const { data: profile, error: profileError } = await service
        .from("profiles")
        .select("user_id, org_id")
        .eq("user_id", userId)
        .maybeSingle();

    if (profileError) {
        console.warn("[auth] resolveUserDestination profile lookup failed", {
            userId,
            message: profileError.message,
        });
    }

    if (profile?.org_id) {
        console.info("[auth] resolveUserDestination resolved internal user", {
            userId,
            destination: "/app",
        });
        return "/app";
    }

    const { data: partner, error: partnerError } = await service
        .from("partner_users")
        .select("id, ativo, org_id, parceiro_id")
        .eq("auth_user_id", userId)
        .eq("ativo", true)
        .maybeSingle();

    if (partnerError) {
        console.warn("[auth] resolveUserDestination partner lookup failed", {
            userId,
            message: partnerError.message,
        });
    }

    if (partner?.org_id && partner?.parceiro_id) {
        console.info("[auth] resolveUserDestination resolved partner user", {
            userId,
            destination: "/partner",
        });
        return "/partner";
    }

    console.warn("[auth] resolveUserDestination user has no access", { userId });
    return "/login?msg=Usuario%20sem%20acesso";
}

export async function resolveUserDestination(): Promise<string> {
    const supabase = await supabaseServer();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        console.warn("[auth] resolveUserDestination missing session", {
            hasUser: Boolean(user),
            error: error?.message ?? null,
        });
        return "/login?msg=Falha%20na%20autenticacao";
    }

    return resolveUserDestinationFromUserId(user.id);
}
