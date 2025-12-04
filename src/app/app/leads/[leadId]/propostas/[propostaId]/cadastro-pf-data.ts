// src/app/app/leads/[leadId]/propostas/[propostaId]/cadastro-pf-data.ts
export const runtime = "nodejs";

const BACKEND_URL =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:8000";

export type LeadCadastroPFView = {
    cadastro: {
        id: string;
        org_id: string;
        lead_id: string;
        proposta_id: string;
        tipo_cliente: "pf" | "pj";
        status: string;
        token_publico: string;
        created_at: string;
        updated_at: string;
    };
    pf: {
        nome_completo: string | null;
        cpf: string | null;
        data_nascimento: string | null;
        estado_civil: string | null;
        nome_conjuge: string | null;
        cpf_conjuge: string | null;
        email: string | null;
        telefone_fixo: string | null;
        celular: string | null;
        rg_numero: string | null;
        rg_orgao_emissor: string | null;
        rg_data_emissao: string | null;
        cidade_nascimento: string | null;
        nome_mae: string | null;
        profissao: string | null;
        renda_mensal: number | null;
        cep: string | null;
        endereco: string | null;
        numero: string | null;
        complemento: string | null;
        bairro: string | null;
        cidade: string | null;
        uf: string | null;
        forma_pagamento: string | null;
        banco_devolucao: string | null;
        agencia_devolucao: string | null;
        conta_devolucao: string | null;
        extra_json: Record<string, unknown> | null;
    } | null;
};

/**
 * Busca cadastro PF completo a partir do ID da proposta.
 */
export async function getLeadCadastroPFByProposta(
    propostaId: string,
): Promise<LeadCadastroPFView | null> {
    const url = `${BACKEND_URL}/lead-cadastros/by-proposta/${encodeURIComponent(
        propostaId,
    )}/pf`;

    console.log("[getLeadCadastroPFByProposta] URL chamada:", url);

    const res = await fetch(url, { cache: "no-store" });

    console.log(
        "[getLeadCadastroPFByProposta] status:",
        res.status,
        res.statusText,
    );

    if (res.status === 404) {
        console.log("[getLeadCadastroPFByProposta] 404, retornando null");
        return null;
    }

    if (!res.ok) {
        throw new Error(
            `Falha ao carregar cadastro PF: ${res.status} ${res.statusText}`,
        );
    }

    const json = (await res.json()) as LeadCadastroPFView;
    console.log(
        "[getLeadCadastroPFByProposta] payload:",
        JSON.stringify(json, null, 2),
    );
    return json;
}
