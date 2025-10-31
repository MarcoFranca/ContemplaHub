// src/lib/auth/server.ts
"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function getCurrentProfile() {
    const supabase = await supabaseServer();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // 1) tenta via sessão (RLS)
    const { data: p, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, org_id, role, nome")
        .eq("user_id", user.id)
        .maybeSingle();

    if (p) {
        const role = (p.role ?? "vendedor") as string;
        return {
            userId: p.user_id as string,
            orgId: (p.org_id as string | null) ?? null,
            role,
            nome: (p.nome ?? "") as string,
            isManager: ["admin", "gestor"].includes(role),
        };
    }

    if (pErr) {
        console.warn("getCurrentProfile session read error:", JSON.stringify(pErr));
    } else {
        console.warn("getCurrentProfile: profile not found via session");
    }

    // 2) fallback via Service Role (somente no server)
    const srv = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,   // nunca expor no client
        { auth: { persistSession: false } }
    );

    const { data: pSrv, error: pSrvErr } = await srv
        .from("profiles")
        .select("user_id, org_id, role, nome")
        .eq("user_id", user.id)
        .maybeSingle();

    if (pSrvErr) {
        console.error("getCurrentProfile service read error:", pSrvErr);
        return null;
    }
    if (!pSrv) return null;

    const role = (pSrv.role ?? "vendedor") as string;
    return {
        userId: pSrv.user_id as string,
        orgId: (pSrv.org_id as string | null) ?? null,
        role,
        nome: (pSrv.nome ?? "") as string,
        isManager: ["admin", "gestor"].includes(role),
    };
}
