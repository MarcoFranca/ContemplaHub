"use server";

import { getBackendUrl } from "@/lib/backend";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

export type WhatsappConfig = {
    ok: boolean;
    app_id: string;
    config_id: string;
    graph_version: string;
    connected: boolean;
};

export type WhatsappIntegration = {
    id: string;
    org_id: string;
    provider: string;
    waba_id: string | null;
    business_id: string | null;
    phone_number_id: string | null;
    display_phone_number: string | null;
    verified_name: string | null;
    quality_rating: string | null;
    messaging_limit: string | null;
    ativo: boolean;
    ai_enabled: boolean;
    last_success_at: string | null;
    last_error_at: string | null;
    last_error_message: string | null;
    created_at: string;
    updated_at: string;
};

export type WhatsappTemplate = {
    id: string;
    org_id: string;
    key: string;
    template_name: string | null;
    language: string;
    category: string;
    body_text: string | null;
    variables: string[];
    approval_status: string | null;
    ativo: boolean;
    created_at: string;
    updated_at: string;
};

async function authed<T>(path: string, init?: RequestInit): Promise<T> {
    const supabase = await supabaseServer();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const profile = await getCurrentProfile();

    if (!session?.access_token || !profile?.orgId) {
        throw new Error("Sessão inválida. Faça login novamente.");
    }

    const res = await fetch(`${getBackendUrl()}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            "X-Org-Id": profile.orgId,
            Authorization: `Bearer ${session.access_token}`,
            ...(init?.headers || {}),
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Erro ${res.status} ao chamar ${path}.`);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
}

export async function getWhatsappConfigAction(): Promise<WhatsappConfig> {
    return authed<WhatsappConfig>("/whatsapp/config");
}

export async function getWhatsappIntegrationAction(): Promise<WhatsappIntegration | null> {
    return authed<WhatsappIntegration | null>("/whatsapp/integration");
}

export async function connectWhatsappAction(input: {
    code: string;
    waba_id: string;
    phone_number_id: string;
}): Promise<{ ok: true; integration: WhatsappIntegration } | { ok: false; error: string }> {
    try {
        const integration = await authed<WhatsappIntegration>("/whatsapp/connect", {
            method: "POST",
            body: JSON.stringify(input),
        });
        return { ok: true, integration };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Falha ao conectar." };
    }
}

export async function connectWhatsappManualAction(input: {
    access_token: string;
    waba_id: string;
    phone_number_id: string;
}): Promise<{ ok: true; integration: WhatsappIntegration } | { ok: false; error: string }> {
    try {
        const integration = await authed<WhatsappIntegration>("/whatsapp/connect-manual", {
            method: "POST",
            body: JSON.stringify(input),
        });
        return { ok: true, integration };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Falha ao conectar." };
    }
}

export async function testSendWhatsappAction(
    to: string,
): Promise<{ ok: boolean; error?: string }> {
    try {
        await authed("/whatsapp/test-send", {
            method: "POST",
            body: JSON.stringify({ to }),
        });
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Falha ao enviar teste." };
    }
}

export async function disconnectWhatsappAction(
    integrationId: string,
): Promise<{ ok: boolean; error?: string }> {
    try {
        await authed(`/whatsapp/integration/${integrationId}`, { method: "DELETE" });
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Falha ao desconectar." };
    }
}

export async function toggleWhatsappAiAction(
    enabled: boolean,
): Promise<{ ok: boolean; error?: string }> {
    try {
        await authed("/whatsapp/ai/toggle", {
            method: "POST",
            body: JSON.stringify({ enabled }),
        });
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Falha ao alterar." };
    }
}

export async function getWhatsappTemplateAction(): Promise<WhatsappTemplate> {
    return authed<WhatsappTemplate>("/whatsapp/template");
}

export async function updateWhatsappTemplateAction(input: {
    body_text?: string;
    template_name?: string;
    language?: string;
    category?: string;
    ativo?: boolean;
    variables?: string[];
}): Promise<{ ok: true; template: WhatsappTemplate } | { ok: false; error: string }> {
    try {
        const template = await authed<WhatsappTemplate>("/whatsapp/template", {
            method: "PUT",
            body: JSON.stringify(input),
        });
        return { ok: true, template };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Falha ao salvar." };
    }
}
