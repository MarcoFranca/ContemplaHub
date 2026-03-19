"use server";

import { revalidatePath } from "next/cache";
import {
    cartaOperacaoSchema,
    type CartaOperacaoFormValues,
} from "../schemas/carta-operacao.schema";

type Input = {
    cotaId: string;
    competencia?: string | null;
    values: CartaOperacaoFormValues;
};

export async function updateCartaOperacaoAction({
                                                    cotaId,
                                                    competencia,
                                                    values,
                                                }: Input) {
    const parsed = cartaOperacaoSchema.safeParse(values);

    if (!parsed.success) {
        return {
            ok: false,
            message: "Dados inválidos para salvar a operação.",
            issues: parsed.error.flatten(),
        };
    }

    try {
        const payload = {
            assembleia_dia: parsed.data.assembleiaDia ?? null,
            assembleia_dia_origem: parsed.data.assembleiaDiaOrigem ?? null,
            status_mes: parsed.data.statusMes ?? null,
            observacoes: parsed.data.observacoes ?? null,
            data_ultimo_lance: parsed.data.dataUltimoLance ?? null,
            competencia: competencia ?? null,
        };

        /**
         * Exemplo:
         * await updateCartaOperacaoBackend({
         *   cotaId,
         *   ...payload,
         * });
         */

        revalidatePath("/app/lances");
        revalidatePath(`/app/lances/${cotaId}`);

        return {
            ok: true,
            message: "Operação atualizada com sucesso.",
        };
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof Error ? error.message : "Erro ao salvar operação.",
        };
    }
}