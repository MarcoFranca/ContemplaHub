import { getBackendUrl } from "@/lib/backend";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function getBackendAuthContext() {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error("Organização inválida.");

    const supabase = await supabaseServer();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;
    if (!accessToken) throw new Error("Sessão inválida. Faça login novamente.");

    return {
        orgId: profile.orgId,
        accessToken,
    };
}

export async function backendAuthed<T>(path: string, init?: RequestInit): Promise<T> {
    const { orgId, accessToken } = await getBackendAuthContext();
    const baseUrl = getBackendUrl();

    const res = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            "X-Org-Id": orgId,
            Authorization: `Bearer ${accessToken}`,
            ...(init?.headers || {}),
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erro ${res.status} ao chamar backend.`);
    }

    if (res.status === 204) return null as T;
    return (await res.json()) as T;
}

export function qs(params: Record<string, string | number | boolean | null | undefined>) {
    const s = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null || v === "") continue;
        s.set(k, String(v));
    }
    return s.toString();
}