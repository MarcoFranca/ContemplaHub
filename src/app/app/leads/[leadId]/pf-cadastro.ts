import { getBackendUrl } from "@/lib/backend";

export type LeadCadastroPF = {
    cpf: string | null;
    data_nascimento: string | null;
    estado_civil: string | null;
    nome_conjuge: string | null;
    cpf_conjuge: string | null;
    nome_mae: string | null;
    cidade_nascimento: string | null;
    cep: string | null;
    endereco: string | null;
    bairro: string | null;
    cidade: string | null;
    uf: string | null;
    rg_numero: string | null;
    rg_orgao_emissor: string | null;
    rg_data_emissao: string | null;
    profissao: string | null;
    renda_mensal: number | null;
};

/** Carrega o cadastro PF único do cliente (lead). Null se ainda não houver. */
export async function getLeadCadastroPFByLead(
    leadId: string,
    orgId: string
): Promise<LeadCadastroPF | null> {
    try {
        const res = await fetch(
            `${getBackendUrl()}/lead-cadastros/by-lead/${encodeURIComponent(leadId)}/pf`,
            { headers: { "X-Org-Id": orgId }, cache: "no-store" }
        );
        if (!res.ok) return null;
        const json = (await res.json()) as { pf: LeadCadastroPF | null };
        return json?.pf ?? null;
    } catch {
        return null;
    }
}
