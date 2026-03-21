// src/lib/backend-partner.ts
import { getBackendUrl } from "@/lib/backend";

type PartnerFetchOptions = Omit<RequestInit, "headers"> & {
    headers?: HeadersInit;
    accessToken: string;
};

export async function partnerBackendFetch(
    path: string,
    { accessToken, headers, ...init }: PartnerFetchOptions
) {
    const baseUrl = getBackendUrl();
    const url = `${baseUrl}${path}`;

    const res = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            ...(headers || {}),
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("Partner backend error", res.status, text);
        throw new Error(`Backend error ${res.status}: ${text}`);
    }

    if (res.status === 204 || res.status === 205) {
        return null;
    }

    const text = await res.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}