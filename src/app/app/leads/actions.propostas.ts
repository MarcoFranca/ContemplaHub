"use server";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
const BACKEND_URL =
    process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

async function callBackend(path: string, options: RequestInit) {
    const profile = await getCurrentProfile();
    const orgId = profile?.orgId;
    const userId = profile?.userId;

    return fetch(`${BACKEND_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(orgId ? { "X-Org-Id": String(orgId) } : {}),
            ...(userId ? { "X-User-Id": String(userId) } : {}),
            ...(options.headers ?? {}),
        },
    });
}

export async function updatePropostaStatus(propostaId: string, status: string) {
    const res = await callBackend(`/lead-propostas/${propostaId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });

    if (!res.ok) {
        console.error("Erro ao alterar status", await res.text());
        throw new Error("Falha ao alterar status da proposta");
    }

    return res.json();
}

export async function inativarProposta(propostaId: string) {
    const res = await callBackend(`/lead-propostas/${propostaId}/inativar`, {
        method: "PATCH",
    });

    if (!res.ok) {
        console.error("Erro ao inativar", await res.text());
        throw new Error("Falha ao inativar proposta");
    }

    return res.json();
}

export async function deleteProposta(propostaId: string) {
    const res = await callBackend(`/lead-propostas/${propostaId}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        console.error("Erro ao deletar", await res.text());
        throw new Error("Falha ao deletar proposta");
    }
}
