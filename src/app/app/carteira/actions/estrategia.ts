"use server";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

export type EstrategiaCartaInput = {
    estrategia_objetivo: string | null;
    estrategia_prazo_lance: string | null;
    estrategia_valor_lance: number | null;
    estrategia_embutido_pct: number | null;
    estrategia_observacao: string | null;
};

export async function updateEstrategiaCartaAction(
    cotaId: string,
    input: EstrategiaCartaInput,
): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sessão inválida." };

    const { error } = await supabaseAdmin
        .from("cotas")
        .update({
            estrategia_objetivo: input.estrategia_objetivo,
            estrategia_prazo_lance: input.estrategia_prazo_lance,
            estrategia_valor_lance: input.estrategia_valor_lance,
            estrategia_embutido_pct: input.estrategia_embutido_pct,
            estrategia_observacao: input.estrategia_observacao,
            estrategia_updated_at: new Date().toISOString(),
        })
        .eq("org_id", me.orgId)
        .eq("id", cotaId);

    if (error) return { ok: false, error: error.message };
    return { ok: true };
}
