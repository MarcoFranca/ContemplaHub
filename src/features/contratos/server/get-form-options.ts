import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/server";

export async function getContratoFormOptions() {
    const supabase = await supabaseServer();
    const profile = await getCurrentProfile();

    if (!profile?.orgId) {
        throw new Error("Org não identificada.");
    }

    const [
        { data: administradoras, error: administradorasError },
        { data: parceiros, error: parceirosError },
    ] = await Promise.all([
        supabase
            .from("administradoras")
            .select("id, nome")
            .order("nome", { ascending: true }),

        supabase
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
        administradoras: administradoras ?? [],
        parceiros: parceiros ?? [],
    };
}