"use server";

import { getBackendUrl } from "@/lib/backend";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

export type ConversationMessage = {
    id: string;
    direction: "in" | "out";
    body: string | null;
    msg_type: string | null;
    status: string | null;
    created_at: string | null;
};

export type Conversation = {
    lead_id: string | null;
    nome: string;
    phone: string | null;
    lastBody: string;
    lastAt: string | null;
    lastDirection: "in" | "out";
    janelaAberta: boolean;
    precisaHumano: boolean;
    messages: ConversationMessage[];
};

type Row = {
    id: string;
    lead_id: string | null;
    phone: string | null;
    direction: "in" | "out";
    body: string | null;
    msg_type: string | null;
    status: string | null;
    created_at: string | null;
    payload: { ai_handoff?: boolean } | null;
    leads: { nome: string | null } | null;
};

export type AiFalha = {
    id: string;
    lead_id: string | null;
    telefone: string | null;
    contexto: string | null;
    erro: string | null;
    created_at: string | null;
};

export async function loadAiFalhasAction(): Promise<AiFalha[]> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) return [];
    const { data, error } = await supabaseAdmin
        .from("ai_falhas")
        .select("id, lead_id, telefone, contexto, erro, created_at")
        .eq("org_id", profile.orgId)
        .order("created_at", { ascending: false })
        .limit(20);
    if (error) return [];
    return (data ?? []) as AiFalha[];
}

export async function loadConversationsAction(): Promise<Conversation[]> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) return [];

    const { data, error } = await supabaseAdmin
        .from("whatsapp_messages")
        .select("id, lead_id, phone, direction, body, msg_type, status, created_at, payload, leads(nome)")
        .eq("org_id", profile.orgId)
        .order("created_at", { ascending: true })
        .limit(2000);

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as unknown as Row[];
    const byLead = new Map<string, Conversation>();

    for (const r of rows) {
        const key = r.lead_id ?? `phone:${r.phone ?? "?"}`;
        const msg: ConversationMessage = {
            id: r.id,
            direction: r.direction,
            body: r.body,
            msg_type: r.msg_type,
            status: r.status,
            created_at: r.created_at,
        };
        const existing = byLead.get(key);
        if (existing) {
            existing.messages.push(msg);
            if (r.payload?.ai_handoff === true) existing.precisaHumano = true;
        } else {
            byLead.set(key, {
                lead_id: r.lead_id,
                nome: r.leads?.nome?.trim() || r.phone || "Sem nome",
                phone: r.phone,
                lastBody: "",
                lastAt: null,
                lastDirection: r.direction,
                janelaAberta: false,
                precisaHumano: r.payload?.ai_handoff === true,
                messages: [msg],
            });
        }
    }

    const now = Date.now();
    const conversations = [...byLead.values()].map((c) => {
        const last = c.messages[c.messages.length - 1];
        const lastInbound = [...c.messages].reverse().find((m) => m.direction === "in");
        return {
            ...c,
            lastBody: last?.body || (last?.msg_type ? `[${last.msg_type}]` : ""),
            lastAt: last?.created_at ?? null,
            lastDirection: last?.direction ?? "in",
            janelaAberta:
                lastInbound?.created_at != null &&
                now - new Date(lastInbound.created_at).getTime() < 24 * 60 * 60 * 1000,
        };
    });

    conversations.sort(
        (a, b) => new Date(b.lastAt ?? 0).getTime() - new Date(a.lastAt ?? 0).getTime(),
    );
    return conversations;
}

export async function reativarIaAction(
    leadId: string,
): Promise<{ ok: boolean; error?: string }> {
    try {
        const supabase = await supabaseServer();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const profile = await getCurrentProfile();
        if (!session?.access_token || !profile?.orgId) {
            return { ok: false, error: "Sessão inválida." };
        }
        const res = await fetch(`${getBackendUrl()}/whatsapp/ai/reativar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Org-Id": profile.orgId,
                Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
            body: JSON.stringify({ lead_id: leadId }),
        });
        if (!res.ok) {
            const t = await res.text().catch(() => "");
            return { ok: false, error: t || `Erro ${res.status}` };
        }
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Falha ao reativar." };
    }
}

export async function replyConversationAction(
    leadId: string,
    body: string,
): Promise<{ ok: boolean; error?: string }> {
    try {
        const supabase = await supabaseServer();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const profile = await getCurrentProfile();
        if (!session?.access_token || !profile?.orgId) {
            return { ok: false, error: "Sessão inválida." };
        }
        const res = await fetch(`${getBackendUrl()}/whatsapp/reply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Org-Id": profile.orgId,
                Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
            body: JSON.stringify({ lead_id: leadId, body }),
        });
        if (!res.ok) {
            const t = await res.text().catch(() => "");
            return { ok: false, error: t || `Erro ${res.status}` };
        }
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Falha ao enviar." };
    }
}
