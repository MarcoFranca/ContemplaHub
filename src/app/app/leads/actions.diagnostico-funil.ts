"use server";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import type { DiagnosticoInputs, DiagnosticoResultado } from "@/features/diagnostico/types";

export type DiagnosticoFunilRegistro = {
    id: string;
    inputs: DiagnosticoInputs | null;
    resultado: DiagnosticoResultado | null;
    estagio: string | null;
    score: number | null;
    created_at: string;
};

/** Busca o diagnóstico do FORMULÁRIO (funil público) mais recente de um lead. */
export async function getLeadDiagnosticoFunilAction(
    leadId: string,
): Promise<DiagnosticoFunilRegistro | null> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return null;

    const supabase = await supabaseServer();
    const { data, error } = await supabase
        .from("diagnostico_investidor")
        .select("id, inputs, resultado, estagio, score, created_at")
        .eq("org_id", me.orgId)
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1);

    if (error) throw error;
    return (data?.[0] as DiagnosticoFunilRegistro | undefined) ?? null;
}
