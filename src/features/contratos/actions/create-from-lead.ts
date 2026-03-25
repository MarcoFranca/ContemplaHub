"use server";

import { fromLeadSchema } from "../schemas/contrato-base.schema";
import { mapContratoFormToApi } from "../utils/contrato-payload-mappers";
import type { ContratoFormValues } from "../types/contrato-form.types";
import { getBackendUrl } from "@/lib/backend";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/server";

export async function createContratoFromLeadAction(values: ContratoFormValues) {
    const parsed = fromLeadSchema.safeParse(values);

    if (!parsed.success) {
        return {
            ok: false,
            error: parsed.error.flatten(),
        };
    }

    const supabase = await supabaseServer();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        return { ok: false, error: "Sessão inválida." };
    }

    const profile = await getCurrentProfile();
    if (!profile?.orgId) {
        return { ok: false, error: "Org não identificada." };
    }

    const response = await fetch(`${getBackendUrl()}/contracts/from-lead`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            "X-Org-Id": profile.orgId,
        },
        body: JSON.stringify(mapContratoFormToApi("fromLead", parsed.data)),
        cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        return {
            ok: false,
            error: data?.detail ?? "Erro ao criar contrato a partir do lead.",
        };
    }

    return {
        ok: true,
        data: {
            ...data,
            contract_id:
                data?.contract_id ??
                data?.contrato_id ??
                data?.id ??
                null,
        },
    };
}