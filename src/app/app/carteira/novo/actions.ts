"use server";

import { getCurrentProfile } from "@/lib/auth/server";

type CreateClienteCarteiraState = {
    error?: string;
    ok?: boolean;
    leadId?: string;
};

export async function createClienteCarteiraAction(
    _prevState: CreateClienteCarteiraState,
    formData: FormData
): Promise<CreateClienteCarteiraState> {
    const getTrimmed = (name: string) => String(formData.get(name) ?? "").trim();
    const nullable = (value: string) => value || null;

    const me = await getCurrentProfile();

    if (!me?.orgId) {
        return { error: "Usuário sem organização vinculada." };
    }

    const nome = getTrimmed("nome");
    const telefone = getTrimmed("telefone");
    const email = getTrimmed("email");
    const observacoes = getTrimmed("observacoes");
    const cep = getTrimmed("cep");
    const logradouro = getTrimmed("endereco");
    const numero = getTrimmed("numero");
    const complemento = getTrimmed("complemento");
    const bairro = getTrimmed("bairro");
    const cidade = getTrimmed("cidade");
    const estado = getTrimmed("estado").toUpperCase().slice(0, 2);

    const hasAddressData = [cep, logradouro, numero, complemento, bairro, cidade, estado].some(
        Boolean
    );

    if (!nome) {
        return { error: "Nome é obrigatório." };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!baseUrl) {
        return { error: "NEXT_PUBLIC_BACKEND_URL não configurado." };
    }

    const resp = await fetch(`${baseUrl}/carteira/clientes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Org-Id": me.orgId,
        },
        body: JSON.stringify({
            nome,
            telefone: nullable(telefone),
            email: nullable(email),
            observacoes: nullable(observacoes),
            owner_id: me.userId ?? null,
            cep: nullable(cep),
            logradouro: nullable(logradouro),
            numero: nullable(numero),
            complemento: nullable(complemento),
            bairro: nullable(bairro),
            cidade: nullable(cidade),
            estado: nullable(estado),
            latitude: null,
            longitude: null,
            address_updated_at: hasAddressData ? new Date().toISOString() : null,
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

    return {
        ok: true,
        leadId,
    };
}
