// src/app/app/leads/actions.diagnostic.ts
"use server";

import { getCurrentProfile } from "@/lib/auth/server";
import { backendFetch } from "@/lib/backend";

export type DiagnosticRecord = {
    id?: string;
    org_id: string;
    lead_id: string;
    objetivo: string | null;
    prazo_meta_meses: number | null;
    preferencia_produto: string | null;
    regiao_preferencia: string | null;
    renda_mensal: number | null;
    reserva_inicial: number | null;
    comprometimento_max_pct: number | null;
    renda_provada: boolean | null;
    valor_carta_alvo: number | null;
    prazo_alvo_meses: number | null;
    estrategia_lance: string | null;
    lance_base_pct: number | null;
    lance_max_pct: number | null;
    janela_preferida_semanas: number | null;
    score_risco: number | null;
    readiness_score: number | null;
    prob_conversao: number | null;
    prob_contemplacao_short: number | null;
    prob_contemplacao_med: number | null;
    prob_contemplacao_long: number | null;
    consent_scope: string | null;
    consent_ts: string | null;
    extras: any;
    created_at: string | null;
    updated_at: string | null;
};

export type DiagnosticInputDTO = {
    objetivo?: string | null;
    prazo_meta_meses?: number | null;
    preferencia_produto?: string | null;
    regiao_preferencia?: string | null;
    renda_mensal?: number | null;
    reserva_inicial?: number | null;
    comprometimento_max_pct?: number | null;
    renda_provada?: boolean | null;
    valor_carta_alvo?: number | null;
    prazo_alvo_meses?: number | null;
    estrategia_lance?: string | null;
    lance_base_pct?: number | null;
    lance_max_pct?: number | null;
    janela_preferida_semanas?: number | null;
    extras?: Record<string, any> | null;
    consent_scope?: string | null;
};

export async function getLeadDiagnostic(
    leadId: string
): Promise<DiagnosticRecord | null> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error("Org inválida");

    try {
        const data = await backendFetch(`/diagnostico/${leadId}`, {
            method: "GET",
            orgId: profile.orgId,
        });
        return data as DiagnosticRecord;
    } catch (err: any) {
        // backendFetch lança Error("Backend error 404: ...")
        if (typeof err?.message === "string" && err.message.includes("404")) {
            return null; // sem diagnóstico ainda
        }
        throw err;
    }
}

export async function saveLeadDiagnostic(leadId: string, input: DiagnosticInputDTO) {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error("Org inválida");

    // garante consent_scope padrão, se não vier
    const payload: DiagnosticInputDTO = {
        consent_scope: input.consent_scope ?? "diagnostico_form",
        ...input,
    };

    const data = await backendFetch(`/diagnostico/${leadId}`, {
        method: "POST",
        orgId: profile.orgId,
        body: JSON.stringify(payload),
    });

    return data;
}
