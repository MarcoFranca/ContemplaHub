"use server";

import { revalidatePath } from "next/cache";
import {
    cartaModalidadesSchema,
    type CartaModalidadesFormValues,
} from "../schemas/carta-modalidades.schema";

type Input = {
    cotaId: string;
    values: CartaModalidadesFormValues;
};

export async function updateCartaModalidadesAction({ cotaId, values }: Input) {
    const parsed = cartaModalidadesSchema.safeParse(values);

    if (!parsed.success) {
        return {
            ok: false,
            message: "Dados inválidos para salvar as modalidades.",
            issues: parsed.error.flatten(),
        };
    }

    try {
        const payload = {
            embutido_permitido: parsed.data.embutidoPermitido,
            embutido_max_percent: parsed.data.embutidoPermitido
                ? parsed.data.embutidoMaxPercent ?? null
                : null,
            fgts_permitido: parsed.data.fgtsPermitido,
            opcoes_lance_fixo: parsed.data.opcoesLanceFixo.map((item) => ({
                id: item.id,
                ordem: item.ordem,
                percentual: item.ativo ? item.percentual ?? null : null,
                ativo: item.ativo,
            })),
        };

        /**
         * Exemplo:
         * await updateCartaModalidadesBackend({
         *   cotaId,
         *   ...payload,
         * });
         *
         * ou:
         * await updateCartaParcial(cotaId, payload);
         */

        revalidatePath("/app/lances");
        revalidatePath(`/app/lances/${cotaId}`);

        return {
            ok: true,
            message: "Modalidades atualizadas com sucesso.",
        };
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Erro ao salvar modalidades.",
        };
    }
}