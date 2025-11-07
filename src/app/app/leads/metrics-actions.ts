"use server";

import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";

function srv() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

/** Lê métricas do RPC get_kanban_metrics e retorna no formato esperado pelo Kanban */
export async function getKanbanMetricsFromDB(): Promise<{
    avgDays?: Record<string, number>;
    conversion?: Record<string, number>;
}> {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    const s = srv();
    const { data, error } = await s.rpc("get_kanban_metrics", { p_org: me.orgId });
    if (error) throw error;
    return (data ?? {}) as {
        avgDays?: Record<string, number>;
        conversion?: Record<string, number>;
    };
}
