"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

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

        revalidatePath(`/app/leads/${leadId}`);
        revalidatePath("/app/leads");
        revalidatePath("/app/carteira");

        return { ok: true };
    } catch (error) {
        console.error("updateLeadAction unexpected", error);
        return { ok: false, error: "Erro inesperado ao atualizar o cliente." };
    }
}