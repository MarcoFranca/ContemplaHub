import { supabaseServer } from "@/lib/supabase/server";

interface Input {
    cotaId: string | null | undefined;
    orgId: string;
    values: {
        percentualReducao?: number | null;
        valorParcelaSemRedutor?: number | null;
        embutidoMaxPercent?: number | null;
    };
}

export async function syncCotaExtraFields({ cotaId, orgId, values }: Input) {
    if (!cotaId) return;

    const supabase = await supabaseServer();

    const payload = {
        percentual_reducao: values.percentualReducao ?? null,
        valor_parcela_sem_redutor: values.valorParcelaSemRedutor ?? null,
        embutido_max_percent: values.embutidoMaxPercent ?? null,
    };

    const { error } = await supabase
        .from("cotas")
        .update(payload)
        .eq("id", cotaId)
        .eq("org_id", orgId);

    if (error) {
        console.error("Erro ao sincronizar campos extras da cota:", error.message);
    }
}
