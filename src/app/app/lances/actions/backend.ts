import { getBackendUrl } from "@/lib/backend";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

type SupabaseUserMetadata = {
    org_id?: string;
};

export async function getBackendAuthContext() {
    const supabase = await supabaseServer();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error("Sessão inválida. Faça login novamente.");
    }

    // tenta pegar profile
    const profile = await getCurrentProfile();

    let orgId = profile?.orgId;

    // fallback: tenta pegar do JWT
    if (!orgId) {
        const user = session.user;

        // 👇 ajuste conforme sua estrutura
        const userMetadata = user?.user_metadata as unknown as SupabaseUserMetadata;
        const appMetadata = user?.app_metadata as unknown as SupabaseUserMetadata;

        orgId =
            userMetadata?.org_id ||
            appMetadata?.org_id ||
            null;
    }

    if (!orgId) {
        console.error("DEBUG AUTH", {
            profile,
            sessionUser: session.user,
        });

        throw new Error("Organização inválida.");
    }

    return {
        orgId,
        accessToken: session.access_token,
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