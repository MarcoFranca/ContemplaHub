"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";

type CreateClienteCarteiraState = {
    error?: string;
};

export async function createClienteCarteiraAction(
    _prevState: CreateClienteCarteiraState,
    formData: FormData
): Promise<CreateClienteCarteiraState> {
    const me = await getCurrentProfile();
    if (!me?.orgId) {
        return { error: "Usuário sem organização vinculada." };
    }

    const nome = String(formData.get("nome") ?? "").trim();
    const telefone = String(formData.get("telefone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const observacoes = String(formData.get("observacoes") ?? "").trim();

    if (!nome) {
        return { error: "Nome é obrigatório." };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!baseUrl) {
        return { error: "NEXT_PUBLIC_API_URL não configurado." };
    }

    const resp = await fetch(`${baseUrl}/carteira/clientes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Org-Id": me.orgId,
        },
        body: JSON.stringify({
            nome,
            telefone: telefone || null,
            email: email || null,
            observacoes: observacoes || null,
            owner_id: me.userId ?? null,
        }),
        cache: "no-store",
    });

    if (!resp.ok) {
        let detail = "Erro ao criar cliente da carteira.";
        try {
            const data = await resp.json();
            detail = data?.detail || detail;
        } catch {}
        return { error: detail };
    }

    const data = await resp.json();
    const leadId = data?.lead?.id;

    if (!leadId) {
        return { error: "Cliente criado, mas sem lead retornado pela API." };
    }

    redirect(`/app/leads/${leadId}`);
}