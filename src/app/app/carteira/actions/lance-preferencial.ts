"use server";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

const TIPOS_VALIDOS = ["fixo", "livre", "embutido", "sorteio"] as const;

export async function updateTipoLancePreferencialAction(
    cotaId: string,
    tipo: string | null,
): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sessão inválida." };

    const valor = tipo && TIPOS_VALIDOS.includes(tipo as (typeof TIPOS_VALIDOS)[number]) ? tipo : null;

    const { error } = await supabaseAdmin
        .from("cotas")
        .update({ tipo_lance_preferencial: valor })
        .eq("org_id", me.orgId)
        .eq("id", cotaId);

    if (error) return { ok: false, error: error.message };
    return { ok: true };
}
