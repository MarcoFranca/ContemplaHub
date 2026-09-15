"use server";

import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";
import type { DiagnosticoInputs, DiagnosticoResultado } from "@/features/diagnostico/types";

export type DiagnosticoFunilRegistro = {
    id: string;
    inputs: DiagnosticoInputs | null;
    resultado: DiagnosticoResultado | null;
    estagio: string | null;
    score: number | null;
    created_at: string;
};

// Service role escopado por org_id (a RLS de diagnostico_investidor bloqueia a leitura
// via supabaseServer neste contexto; seguimos o mesmo padrão da carteira).
function srv() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false },
    });
}

/** Busca o diagnóstico do FORMULÁRIO (funil público) mais recente de um lead. */
export async function getLeadDiagnosticoFunilAction(
    leadId: string,
): Promise<DiagnosticoFunilRegistro | null> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return null;

    const { data, error } = await srv()
        .from("diagnostico_investidor")
        .select("id, inputs, resultado, estagio, score, created_at")
        .eq("org_id", me.orgId)
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1);

    if (error) throw error;
    return (data?.[0] as DiagnosticoFunilRegistro | undefined) ?? null;
}
