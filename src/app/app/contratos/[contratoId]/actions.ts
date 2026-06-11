"use server";

import { getBackendUrl } from "@/lib/backend";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import {
    formNullableNumber,
    formNullableString,
} from "@/app/app/lances/utils/form-parsers";

async function getBackendAuthContext() {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error("Organização inválida.");

    const supabase = await supabaseServer();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    if (!accessToken) throw new Error("Sessão inválida. Faça login novamente.");

    return { orgId: profile.orgId, accessToken };
}

async function backendAuthed<T>(path: string, init?: RequestInit): Promise<T> {
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

export async function updateCotaDadosAction(formData: FormData): Promise<void> {
    const cotaId = String(formData.get("cotaId") || "");
    if (!cotaId) throw new Error("Cota inválida.");

    const parcelaReduzida = Boolean(formData.get("parcela_reduzida"));

    await backendAuthed(`/lances/cartas/${cotaId}`, {
        method: "PATCH",
        body: JSON.stringify({
            grupo_codigo: formNullableString(formData, "grupo_codigo"),
            numero_cota: formNullableString(formData, "numero_cota"),
            produto: formNullableString(formData, "produto"),
            valor_carta: formNullableNumber(formData, "valor_carta"),
            valor_parcela: formNullableNumber(formData, "valor_parcela"),
            prazo: formNullableNumber(formData, "prazo"),
            assembleia_dia: formNullableNumber(formData, "assembleia_dia"),
            data_adesao: formNullableString(formData, "data_adesao"),
            fgts_permitido: Boolean(formData.get("fgts_permitido")),
            embutido_permitido: Boolean(formData.get("embutido_permitido")),
            embutido_max_percent: formNullableNumber(formData, "embutido_max_percent"),
            autorizacao_gestao: Boolean(formData.get("autorizacao_gestao")),
            parcela_reduzida: parcelaReduzida,
            percentual_reducao: parcelaReduzida
                ? formNullableNumber(formData, "percentual_reducao")
                : null,
            valor_parcela_sem_redutor: formNullableNumber(formData, "valor_parcela_sem_redutor"),
            taxa_admin_percentual: formNullableNumber(formData, "taxa_admin_percentual"),
            taxa_admin_valor_mensal: formNullableNumber(formData, "taxa_admin_valor_mensal"),
            observacoes: formNullableString(formData, "observacoes"),
            fundo_reserva_percentual: formNullableNumber(formData, "fundo_reserva_percentual"),
            fundo_reserva_valor_mensal: formNullableNumber(formData, "fundo_reserva_valor_mensal"),
            seguro_prestamista_ativo: Boolean(formData.get("seguro_prestamista_ativo")),
            seguro_prestamista_percentual: formNullableNumber(formData, "seguro_prestamista_percentual"),
            seguro_prestamista_valor_mensal: formNullableNumber(formData, "seguro_prestamista_valor_mensal"),
            taxa_admin_antecipada_ativo: Boolean(formData.get("taxa_admin_antecipada_ativo")),
            taxa_admin_antecipada_percentual: formNullableNumber(formData, "taxa_admin_antecipada_percentual"),
            taxa_admin_antecipada_forma_pagamento: formNullableString(
                formData,
                "taxa_admin_antecipada_forma_pagamento"
            ),
            taxa_admin_antecipada_parcelas: formNullableNumber(formData, "taxa_admin_antecipada_parcelas"),
            taxa_admin_antecipada_valor_total: formNullableNumber(formData, "taxa_admin_antecipada_valor_total"),
            taxa_admin_antecipada_valor_parcela: formNullableNumber(
                formData,
                "taxa_admin_antecipada_valor_parcela"
            ),
        }),
    });
}

export async function updateContratoDadosAction(formData: FormData): Promise<void> {
    const contratoId = String(formData.get("contratoId") || "");
    if (!contratoId) throw new Error("Contrato inválido.");

    await backendAuthed(`/contracts/${contratoId}/dados`, {
        method: "PATCH",
        body: JSON.stringify({
            numero: formNullableString(formData, "numero"),
            data_assinatura: formNullableString(formData, "data_assinatura"),
        }),
    });
}
