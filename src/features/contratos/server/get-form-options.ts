import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

export async function getContratoFormOptions() {
    const profile = await getCurrentProfile();

    if (!profile?.orgId) {
        throw new Error("Org não identificada.");
    }

    const [
        { data: administradoras, error: administradorasError },
        { data: parceiros, error: parceirosError },
    ] = await Promise.all([
        supabaseAdmin
            .from("administradoras")
            .select("id, nome, org_id, overrides_global_id")
            .or(`org_id.eq.${profile.orgId},org_id.is.null`)
            .order("nome", { ascending: true }),

        supabaseAdmin
            .from("parceiros_corretores")
            .select("id, nome")
            .eq("org_id", profile.orgId)
            .order("nome", { ascending: true }),
    ]);

    if (administradorasError) {
        throw new Error(administradorasError.message);
    }

    if (parceirosError) {
        throw new Error(parceirosError.message);
    }

    // Esconde globais que a org sobrescreveu (override); mostra a versão da org.
    const rows = (administradoras ?? []) as Array<{
        id: string;
        nome: string;
        org_id: string | null;
        overrides_global_id: string | null;
    }>;
    const overridden = new Set(
        rows.filter((r) => r.org_id === profile.orgId && r.overrides_global_id).map((r) => r.overrides_global_id as string),
    );

    return {
        administradoras: rows
            .filter((r) => !(r.org_id === null && overridden.has(r.id)))
            .map((item) => ({ id: item.id, nome: item.nome })),
        parceiros: parceiros ?? [],
    };
}