// src/lib/backend.ts
const DEFAULT_BACKEND_URL = "http://localhost:8000";

export function getBackendUrl() {
    return process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
}

type FetchOptions = Omit<RequestInit, "headers"> & {
    headers?: HeadersInit;
    orgId: string;
};

export async function backendFetch(
    path: string,
    { orgId, headers, ...init }: FetchOptions
) {
    const baseUrl = getBackendUrl();
    const url = `${baseUrl}${path}`;

    const res = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            "X-Org-Id": orgId,
            ...(headers || {}),
        },
        // importante: server actions normalmente rodam no server, então está ok
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("Backend error", res.status, text);
        throw new Error(`Backend error ${res.status}: ${text}`);
    }

    return res.json();
}
