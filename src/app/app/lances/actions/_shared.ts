"use server";

import { getBackendUrl } from "@/lib/backend";
import { getBackendAuthContext } from "./backend";

export async function backendAuthed<T>(
    path: string,
    init?: RequestInit
): Promise<T> {
    const { orgId, accessToken } = await getBackendAuthContext();

    const response = await fetch(`${getBackendUrl()}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
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
