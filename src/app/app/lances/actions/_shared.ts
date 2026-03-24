
"use server";

import { getBackendUrl } from "@/lib/backend";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function backendAuthed<T>(
    path: string,
    init?: RequestInit
): Promise<T> {
    const supabase = await supabaseServer();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error("Sessão inválida. Faça login novamente.");
    }

    const profile = await getCurrentProfile();
    const orgId = profile?.orgId;

    if (!orgId) {
        throw new Error("Organização inválida.");
    }

    const response = await fetch(`${getBackendUrl()}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            "X-Org-Id": orgId,
            ...(init?.headers ?? {}),
        },
        cache: "no-store",
    });

    if (!response.ok) {
        let message = "Erro ao comunicar com o backend.";
        try {
            const errorData = await response.json();
            message = errorData?.detail || errorData?.message || message;
        } catch {}
        throw new Error(message);
    }

    return response.json() as Promise<T>;
}