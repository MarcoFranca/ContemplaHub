// src/features/diagnostic/actions.ts
"use server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";

function srv() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false },
    });
}

export async function saveDiagnosticAnswers(params: {
    leadId: string;
    answers: Record<string, unknown>;
}) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    const s = srv();
    const { error } = await s
        .from("lead_diagnostic_answers")
        .insert({
            org_id: me.orgId,
            lead_id: params.leadId,
            answers: params.answers,
            created_by: me.userId ?? null,
        });

    if (error) throw error;
}
