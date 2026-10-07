"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/server";

function srv() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false },
    });
}

const round2 = (v: number) => Math.round(v * 100) / 100;

export type ReajusteItem = {
    id: string;
    valor_carta_anterior: number | null;
    valor_carta_novo: number;
    valor_parcela_anterior: number | null;
    valor_parcela_novo: number | null;
    percentual: number | null;
    created_at: string;
};

export type ReajustesResumo = {
    valorInicial: number;
    valorAtual: number;
    valorizacaoPct: number;
    reajustes: ReajusteItem[];
};

/**
 * Reajusta o valor da carta (ex.: reajuste anual do consórcio). Recalcula a parcela
 * proporcionalmente, guarda o valor inicial na cota e registra o histórico.
 * novoValorCarta na MESMA unidade já gravada em cotas.valor_carta.
 */
export async function reajustarCartaAction(
    cotaId: string,
    novoValorCarta: number,
): Promise<{ ok: boolean; error?: string; percentual?: number; novaParcela?: number }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sem organização." };
    if (!cotaId) return { ok: false, error: "Cota inválida." };
    if (!(novoValorCarta > 0)) return { ok: false, error: "Informe um valor válido." };

    const s = srv();
    const { data: cota, error } = await s
        .from("cotas")
        .select("id, valor_carta, valor_parcela, valor_carta_inicial")
        .eq("org_id", me.orgId)
        .eq("id", cotaId)
        .maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!cota) return { ok: false, error: "Carta não encontrada." };

    const anterior = Number(cota.valor_carta || 0);
    const parcelaAnt = Number(cota.valor_parcela || 0);
    if (anterior <= 0) return { ok: false, error: "A carta não tem valor atual para reajustar." };

    const ratio = novoValorCarta / anterior;
    const novaParcela = parcelaAnt > 0 ? round2(parcelaAnt * ratio) : parcelaAnt;
    const percentual = round2((ratio - 1) * 100);

    const { error: upErr } = await s
        .from("cotas")
        .update({
            valor_carta: novoValorCarta,
            valor_parcela: novaParcela,
            valor_carta_inicial: cota.valor_carta_inicial ?? anterior,
        })
        .eq("org_id", me.orgId)
        .eq("id", cotaId);
    if (upErr) return { ok: false, error: upErr.message };

    await s.from("cota_reajustes").insert({
        org_id: me.orgId,
        cota_id: cotaId,
        valor_carta_anterior: anterior,
        valor_carta_novo: novoValorCarta,
        valor_parcela_anterior: parcelaAnt || null,
        valor_parcela_novo: novaParcela || null,
        percentual,
        created_by: me.userId ?? null,
    });

    revalidatePath("/app/lances");
    revalidatePath(`/app/lances/${cotaId}`);
    return { ok: true, percentual, novaParcela };
}

/** Resumo de reajustes de uma carta (valor inicial, atual, valorização e histórico). */
export async function getReajustesCartaAction(cotaId: string): Promise<ReajustesResumo | null> {
    const me = await getCurrentProfile();
    if (!me?.orgId || !cotaId) return null;

    const s = srv();
    const { data: cota } = await s
        .from("cotas")
        .select("valor_carta, valor_carta_inicial")
        .eq("org_id", me.orgId)
        .eq("id", cotaId)
        .maybeSingle();
    if (!cota) return null;

    const { data: reajustes } = await s
        .from("cota_reajustes")
        .select("id, valor_carta_anterior, valor_carta_novo, valor_parcela_anterior, valor_parcela_novo, percentual, created_at")
        .eq("org_id", me.orgId)
        .eq("cota_id", cotaId)
        .order("created_at", { ascending: false });

    const atual = Number(cota.valor_carta || 0);
    const inicial = cota.valor_carta_inicial != null ? Number(cota.valor_carta_inicial) : atual;
    const valorizacaoPct = inicial > 0 ? round2((atual / inicial - 1) * 100) : 0;

    return {
        valorInicial: inicial,
        valorAtual: atual,
        valorizacaoPct,
        reajustes: (reajustes ?? []) as ReajusteItem[],
    };
}
