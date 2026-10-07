"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/server";
import { backendAuthed } from "./backend";

function srv() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false },
    });
}

export type UltimoLanceComposicao = {
    embutido: number;
    fgts: number;
    proprio: number;
    outro: number;
};

export type UltimoLanceResumo = {
    id: string;
    assembleia_data: string | null;
    tipo: string | null;
    percentual: number | null;
    valor: number | null;
    base_calculo: "saldo_devedor" | "valor_carta" | null;
    composicao: UltimoLanceComposicao;
    observacoes: string | null;
    created_at: string | null;
};

function num(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

/** Busca o último lance registrado de uma cota (para pré-preencher o "Repetir lance"). */
export async function getUltimoLanceAction(cotaId: string): Promise<UltimoLanceResumo | null> {
    const me = await getCurrentProfile();
    if (!me?.orgId || !cotaId) return null;

    const s = srv();
    const { data } = await s
        .from("lances")
        .select("id, assembleia_data, tipo, percentual, valor, base_calculo, pagamento, created_at")
        .eq("org_id", me.orgId)
        .eq("cota_id", cotaId)
        .order("assembleia_data", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!data) return null;

    const pagamento = (data.pagamento ?? {}) as {
        composicao?: Partial<UltimoLanceComposicao> | null;
        observacoes?: string | null;
    };
    const comp = pagamento.composicao ?? {};

    return {
        id: String(data.id),
        assembleia_data: data.assembleia_data ?? null,
        tipo: data.tipo ?? null,
        percentual: data.percentual != null ? num(data.percentual) : null,
        valor: data.valor != null ? num(data.valor) : null,
        base_calculo: (data.base_calculo as UltimoLanceResumo["base_calculo"]) ?? null,
        composicao: {
            embutido: num(comp.embutido),
            fgts: num(comp.fgts),
            proprio: num(comp.proprio),
            outro: num(comp.outro),
        },
        observacoes: pagamento.observacoes ?? null,
        created_at: data.created_at ?? null,
    };
}

/**
 * Repete o último lance da cota na competência atual, usando a mesma composição.
 * Se o último lance era "fixo", tenta casar com uma opção de fixo ativa de mesmo
 * percentual; se não houver (opção removida/alterada), registra como "livre"
 * preservando valor e percentual, para não travar a operação.
 */
export async function repetirUltimoLanceAction(
    cotaId: string,
    competencia: string,
    assembleiaData: string,
): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sem organização." };
    if (!cotaId || !competencia || !assembleiaData) {
        return { ok: false, error: "Dados incompletos para repetir o lance." };
    }

    const ultimo = await getUltimoLanceAction(cotaId);
    if (!ultimo) return { ok: false, error: "Esta carta ainda não tem lance para repetir." };

    let tipo = (ultimo.tipo ?? "livre").toLowerCase();
    let cotaLanceFixoOpcaoId: string | null = null;

    if (tipo === "fixo") {
        const s = srv();
        const { data: opcoes } = await s
            .from("cota_lance_fixo_opcoes")
            .select("id, percentual")
            .eq("org_id", me.orgId)
            .eq("cota_id", cotaId)
            .eq("ativo", true);

        const alvo = ultimo.percentual ?? null;
        const match =
            alvo != null
                ? (opcoes ?? []).find((op) => Math.abs(num(op.percentual) - alvo) < 0.001)
                : (opcoes ?? [])[0];

        if (match) {
            cotaLanceFixoOpcaoId = String(match.id);
        } else {
            // Sem opção de fixo compatível: repete como livre mantendo o resultado financeiro.
            tipo = "livre";
        }
    }

    try {
        await backendAuthed(`/lances/cartas/${cotaId}/registrar-lance`, {
            method: "POST",
            body: JSON.stringify({
                competencia,
                assembleia_data: assembleiaData,
                tipo,
                percentual: ultimo.percentual,
                valor: ultimo.valor,
                base_calculo: ultimo.base_calculo ?? "valor_carta",
                pagamento: {
                    composicao: {
                        embutido: ultimo.composicao.embutido,
                        fgts: ultimo.composicao.fgts,
                        proprio: ultimo.composicao.proprio,
                        outro: ultimo.composicao.outro,
                    },
                    observacoes: "Lance repetido a partir do último lance registrado.",
                },
                resultado: "pendente",
                observacoes_competencia: "Lance repetido a partir do último lance registrado.",
                cota_lance_fixo_opcao_id: cotaLanceFixoOpcaoId,
            }),
        });
    } catch (error: unknown) {
        const rawMessage = error instanceof Error ? error.message : "";
        let message = rawMessage || "Não foi possível repetir o lance.";
        try {
            const parsed = JSON.parse(rawMessage) as { detail?: string; message?: string };
            message = parsed.detail || parsed.message || message;
        } catch {
            // mensagem não era JSON, mantém texto cru
        }
        return { ok: false, error: message };
    }

    revalidatePath("/app/lances");
    revalidatePath(`/app/lances/${cotaId}`);
    return { ok: true };
}
