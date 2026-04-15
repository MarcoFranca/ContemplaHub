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
            .select("id, nome, org_id")
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

    return {
        administradoras: (administradoras ?? []).map((item) => ({
            id: item.id,
            nome: item.nome,
        })),
        parceiros: parceiros ?? [],
    };
}