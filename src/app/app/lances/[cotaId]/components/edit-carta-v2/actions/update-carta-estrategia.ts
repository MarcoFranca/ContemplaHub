"use server";

import { revalidatePath } from "next/cache";
import {
    cartaEstrategiaSchema,
    type CartaEstrategiaFormValues,
} from "../schemas/carta-estrategia.schema";

type Input = {
    cotaId: string;
    values: CartaEstrategiaFormValues;
};

export async function updateCartaEstrategiaAction({
                                                      cotaId,
                                                      values,
                                                  }: Input) {
    const parsed = cartaEstrategiaSchema.safeParse(values);

    if (!parsed.success) {
        return {
            ok: false,
            message: "Dados inválidos para salvar a estratégia.",
            issues: parsed.error.flatten(),
        };
    }

    try {
        const payload = {
            objetivo: parsed.data.objetivo ?? null,
            estrategia: parsed.data.estrategia ?? null,
            tipo_lance_preferencial: parsed.data.tipoLancePreferencial ?? null,
            autorizacao_gestao: parsed.data.autorizacaoGestao,
        };

        /**
         * Exemplo:
         * await updateCartaEstrategiaBackend({
         *   cotaId,
         *   ...payload,
         * });
         */

        revalidatePath("/app/lances");
        revalidatePath(`/app/lances/${cotaId}`);

        return {
            ok: true,
            message: "Estratégia atualizada com sucesso.",
        };
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof Error ? error.message : "Erro ao salvar estratégia.",
        };
    }
}