"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

export type AjusteRepasse = { id: string; valor: number | null };

/**
 * Salva (ou limpa, com valor null) o valor de repasse ajustado manualmente.
 * Não altera valor_liquido: o ajuste fica em valor_repasse_ajustado e é o valor
 * exibido ao parceiro. Restrito a gestores e aos lançamentos deste parceiro.
 */
export async function salvarAjustesRepasseAction(
    parceiroId: string,
    ajustes: AjusteRepasse[],
): Promise<{ ok: boolean; salvos?: number; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sem organização." };
    if (!me.isManager) return { ok: false, error: "Apenas gestores podem ajustar repasses." };
    if (!parceiroId || ajustes.length === 0) return { ok: true, salvos: 0 };

    let salvos = 0;
    for (const a of ajustes) {
        const valor = a.valor == null ? null : Math.round(a.valor * 100) / 100;
        if (valor != null && !(valor >= 0)) return { ok: false, error: "Valor inválido." };
        const { error } = await supabaseAdmin
            .from("comissao_lancamentos")
            .update({ valor_repasse_ajustado: valor, updated_at: new Date().toISOString() })
            .eq("org_id", me.orgId)
            .eq("id", a.id)
            .eq("parceiro_id", parceiroId)
            .eq("beneficiario_tipo", "parceiro");
        if (error) {
            const semColuna = /valor_repasse_ajustado/.test(error.message);
            return {
                ok: false,
                salvos,
                error: semColuna
                    ? "A coluna de ajuste ainda não existe no banco. Rode a migration 035."
                    : error.message,
            };
        }
        salvos += 1;
    }

    revalidatePath(`/app/parceiros/${parceiroId}`);
    revalidatePath(`/app/parceiros/${parceiroId}/repasses/print`);
    return { ok: true, salvos };
}
