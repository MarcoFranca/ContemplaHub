import { supabaseServer } from "@/lib/supabase/server";

interface Input {
    cotaId: string | null | undefined;
    orgId: string;
    values: {
        assembleiaDia?: number | null;
        percentualReducao?: number | null;
        valorParcelaSemRedutor?: number | null;
        embutidoMaxPercent?: number | null;
        taxaAdminPercentual?: number | null;
        taxaAdminValorMensal?: number | null;
        fundoReservaPercentual?: number | null;
        fundoReservaValorMensal?: number | null;
        seguroPrestamistaAtivo?: boolean;
        seguroPrestamistaPercentual?: number | null;
        seguroPrestamistaValorMensal?: number | null;
        taxaAdminAntecipadaAtivo?: boolean;
        taxaAdminAntecipadaPercentual?: number | null;
        taxaAdminAntecipadaFormaPagamento?: string | null;
        taxaAdminAntecipadaParcelas?: number | null;
        taxaAdminAntecipadaValorTotal?: number | null;
        taxaAdminAntecipadaValorParcela?: number | null;
    };
}

export async function syncCotaExtraFields({ cotaId, orgId, values }: Input) {
    if (!cotaId) return;

    const supabase = await supabaseServer();

    const payload = {
        assembleia_dia: values.assembleiaDia ?? null,
        percentual_reducao: values.percentualReducao ?? null,
        valor_parcela_sem_redutor: values.valorParcelaSemRedutor ?? null,
        embutido_max_percent: values.embutidoMaxPercent ?? null,
        taxa_admin_percentual: values.taxaAdminPercentual ?? null,
        taxa_admin_valor_mensal: values.taxaAdminValorMensal ?? null,
        fundo_reserva_percentual: values.fundoReservaPercentual ?? null,
        fundo_reserva_valor_mensal: values.fundoReservaValorMensal ?? null,
        seguro_prestamista_ativo: values.seguroPrestamistaAtivo ?? false,
        seguro_prestamista_percentual: values.seguroPrestamistaAtivo
            ? values.seguroPrestamistaPercentual ?? null
            : null,
        seguro_prestamista_valor_mensal: values.seguroPrestamistaAtivo
            ? values.seguroPrestamistaValorMensal ?? null
            : null,
        taxa_admin_antecipada_ativo: values.taxaAdminAntecipadaAtivo ?? false,
        taxa_admin_antecipada_percentual: values.taxaAdminAntecipadaAtivo
            ? values.taxaAdminAntecipadaPercentual ?? null
            : null,
        taxa_admin_antecipada_forma_pagamento: values.taxaAdminAntecipadaAtivo
            ? values.taxaAdminAntecipadaFormaPagamento ?? null
            : null,
        taxa_admin_antecipada_parcelas: values.taxaAdminAntecipadaAtivo
            ? values.taxaAdminAntecipadaFormaPagamento === "avista"
                ? 1
                : values.taxaAdminAntecipadaParcelas ?? null
            : null,
        taxa_admin_antecipada_valor_total: values.taxaAdminAntecipadaAtivo
            ? values.taxaAdminAntecipadaValorTotal ?? null
            : null,
        taxa_admin_antecipada_valor_parcela: values.taxaAdminAntecipadaAtivo
            ? values.taxaAdminAntecipadaValorParcela ?? null
            : null,
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
