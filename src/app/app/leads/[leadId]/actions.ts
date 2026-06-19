"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getBackendUrl } from "@/lib/backend";

type UpdateLeadResult =
    | { ok: true }
    | { ok: false; error: string };

function toNullableString(value: FormDataEntryValue | null) {
    const str = String(value ?? "").trim();
    return str ? str : null;
}

function toNullableNumber(value: FormDataEntryValue | null) {
    const str = String(value ?? "").trim().replace(",", ".");
    if (!str) return null;
    const num = Number(str);
    return Number.isFinite(num) ? num : null;
}

export async function updateLeadAction(
    leadId: string,
    formData: FormData
): Promise<UpdateLeadResult> {
    try {
        const profile = await getCurrentProfile();
        if (!profile?.orgId) {
            return { ok: false, error: "Organização inválida." };
        }

        const supabase = await supabaseServer();

        const nome = toNullableString(formData.get("nome"));
        const telefone = toNullableString(formData.get("telefone"));
        const email = toNullableString(formData.get("email"));
        const origem = toNullableString(formData.get("origem"));
        const valor_interesse = toNullableNumber(formData.get("valor_interesse"));
        const prazo_meses = toNullableNumber(formData.get("prazo_meses"));

        if (!nome) {
            return { ok: false, error: "Nome é obrigatório." };
        }

        const payload = {
            nome,
            telefone,
            email,
            origem,
            valor_interesse,
            prazo_meses,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from("leads")
            .update(payload)
            .eq("org_id", profile.orgId)
            .eq("id", leadId);

        if (error) {
            console.error("updateLeadAction", error);
            return { ok: false, error: "Não foi possível atualizar o cliente." };
        }

        // --- Interesse comercial (lead_interesses) ---
        const norm = (v: string | null) => (v && v !== "none" ? v : null);
        const produto = norm(toNullableString(formData.get("produto")));
        const perfil_desejado = norm(toNullableString(formData.get("perfil_desejado")));
        const objetivo = toNullableString(formData.get("objetivo"));
        const observacao = toNullableString(formData.get("observacao"));
        const temComercial =
            formData.has("produto") ||
            formData.has("perfil_desejado") ||
            formData.has("objetivo") ||
            formData.has("observacao");

        if (temComercial) {
            const { data: existente } = await supabase
                .from("lead_interesses")
                .select("id")
                .eq("org_id", profile.orgId)
                .eq("lead_id", leadId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            const interessePayload = { produto, perfil_desejado, objetivo, observacao };

            if (existente?.id) {
                await supabase
                    .from("lead_interesses")
                    .update(interessePayload)
                    .eq("org_id", profile.orgId)
                    .eq("id", existente.id);
            } else if (produto || perfil_desejado || objetivo || observacao) {
                await supabase.from("lead_interesses").insert({
                    org_id: profile.orgId,
                    lead_id: leadId,
                    ...interessePayload,
                    status: "aberto",
                    created_by: profile.userId,
                });
            }
        }

        // --- Cadastro completo do cliente (PF) — fonte única em lead_cadastros_pf ---
        const pfKeys = [
            "pf_cpf", "pf_data_nascimento", "pf_estado_civil", "pf_nome_conjuge",
            "pf_cpf_conjuge", "pf_nome_mae", "pf_cidade_nascimento", "pf_rg_numero",
            "pf_rg_orgao_emissor", "pf_rg_data_emissao", "pf_profissao", "pf_renda_mensal",
            "pf_cep", "pf_endereco", "pf_bairro", "pf_cidade", "pf_uf",
        ];
        if (pfKeys.some((k) => formData.has(k))) {
            const onlyDigits = (v: string | null) => (v ? v.replace(/\D/g, "") : null) || null;
            const moneyToNum = (v: string | null) => {
                if (!v) return null;
                const n = Number(v.replace(/\./g, "").replace(",", "."));
                return Number.isFinite(n) ? n : null;
            };
            const pfBody = {
                nome_completo: nome, // usa o nome do cliente (sem duplicar campo)
                cpf: onlyDigits(toNullableString(formData.get("pf_cpf"))),
                data_nascimento: toNullableString(formData.get("pf_data_nascimento")),
                estado_civil: toNullableString(formData.get("pf_estado_civil")),
                nome_conjuge: toNullableString(formData.get("pf_nome_conjuge")),
                cpf_conjuge: onlyDigits(toNullableString(formData.get("pf_cpf_conjuge"))),
                nome_mae: toNullableString(formData.get("pf_nome_mae")),
                cidade_nascimento: toNullableString(formData.get("pf_cidade_nascimento")),
                rg_numero: toNullableString(formData.get("pf_rg_numero")),
                rg_orgao_emissor: toNullableString(formData.get("pf_rg_orgao_emissor")),
                rg_data_emissao: toNullableString(formData.get("pf_rg_data_emissao")),
                profissao: toNullableString(formData.get("pf_profissao")),
                renda_mensal: moneyToNum(toNullableString(formData.get("pf_renda_mensal"))),
                cep: onlyDigits(toNullableString(formData.get("pf_cep"))),
                endereco: toNullableString(formData.get("pf_endereco")),
                bairro: toNullableString(formData.get("pf_bairro")),
                cidade: toNullableString(formData.get("pf_cidade")),
                uf: (toNullableString(formData.get("pf_uf")) ?? "").toUpperCase().slice(0, 2) || null,
                email,
                telefone_celular: telefone,
            };
            try {
                const res = await fetch(
                    `${getBackendUrl()}/lead-cadastros/by-lead/${encodeURIComponent(leadId)}/pf`,
                    {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json", "X-Org-Id": profile.orgId },
                        body: JSON.stringify(pfBody),
                        cache: "no-store",
                    }
                );
                if (!res.ok) {
                    console.error("updateLeadAction PF", await res.text());
                    return { ok: false, error: "Cliente salvo, mas falhou ao salvar o cadastro completo." };
                }
            } catch (e) {
                console.error("updateLeadAction PF fetch", e);
                return { ok: false, error: "Cliente salvo, mas o serviço de cadastro não respondeu." };
            }
        }

        revalidatePath(`/app/leads/${leadId}`);
        revalidatePath("/app/leads");
        revalidatePath("/app/carteira");

        return { ok: true };
    } catch (error) {
        console.error("updateLeadAction unexpected", error);
        return { ok: false, error: "Erro inesperado ao atualizar o cliente." };
    }
}