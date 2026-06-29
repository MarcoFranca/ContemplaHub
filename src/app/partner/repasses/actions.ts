"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { partnerBackendFetch } from "@/lib/backend-partner";

export async function getPartnerComprovanteUrlAction(
    loteId: string,
): Promise<{ ok: boolean; url?: string; error?: string }> {
    const supabase = await supabaseServer();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return { ok: false, error: "Sessão expirada." };

    try {
        const data = (await partnerBackendFetch(
            `/partner/repasses/lotes/${loteId}/comprovante/signed-url`,
            { method: "POST", accessToken: session.access_token },
        )) as { url?: string } | null;
        return { ok: true, url: data?.url };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Comprovante indisponível." };
    }
}
