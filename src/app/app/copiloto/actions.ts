"use server";

import { getBackendUrl } from "@/lib/backend";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

export type CopilotoMsg = { role: "user" | "assistant"; content: string };

export async function copilotoChatAction(
    messages: CopilotoMsg[],
): Promise<{ ok: boolean; reply?: string; error?: string }> {
    try {
        const supabase = await supabaseServer();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const profile = await getCurrentProfile();
        if (!session?.access_token || !profile?.orgId) {
            return { ok: false, error: "Sessão inválida." };
        }
        const res = await fetch(`${getBackendUrl()}/copiloto/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Org-Id": profile.orgId,
                Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
            body: JSON.stringify({ messages: messages.slice(-20) }),
        });
        if (!res.ok) {
            const t = await res.text().catch(() => "");
            return { ok: false, error: t || `Erro ${res.status}` };
        }
        const data = (await res.json()) as { reply?: string };
        return { ok: true, reply: data.reply ?? "" };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Falha no copiloto." };
    }
}
