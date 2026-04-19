"use server";

import { registerExistingSchema } from "../schemas/contrato-base.schema";
import { mapContratoFormToApi } from "../utils/contrato-payload-mappers";
import type { ContratoFormValues } from "../types/contrato-form.types";
import { getBackendUrl } from "@/lib/backend";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { syncCotaExtraFields } from "./_sync-cota-extra-fields";

export async function registerExistingContratoAction(
    values: ContratoFormValues
) {
    const parsed = registerExistingSchema.safeParse(values);

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

    const payload = mapContratoFormToApi("registerExisting", parsed.data);

    const response = await fetch(`${getBackendUrl()}/contracts/register-existing`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            "X-Org-Id": profile.orgId,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        return {
            ok: false,
            error:
                data?.detail
                    ? typeof data.detail === "string"
                        ? data.detail
                        : JSON.stringify(data.detail)
                    : "Erro ao registrar contrato já existente.",
        };
    }

    const normalized = {
        ...data,
        contract_id:
            data?.contract_id ??
            data?.contrato_id ??
            data?.id ??
            null,
        cota_id:
            data?.cota_id ??
            data?.cotaId ??
            null,
    };

    await syncCotaExtraFields({
        cotaId: normalized.cota_id,
        orgId: profile.orgId,
        values: {
            percentualReducao: parsed.data.parcelaReduzida
                ? parsed.data.percentualReducao ?? null
                : null,
            valorParcelaSemRedutor: parsed.data.parcelaReduzida
                ? parsed.data.valorParcelaSemRedutor ?? null
                : null,
            embutidoMaxPercent: parsed.data.embutidoPermitido
                ? parsed.data.embutidoMaxPercent ?? null
                : null,
        },
    });

    return {
        ok: true,
        data: normalized,
    };
}