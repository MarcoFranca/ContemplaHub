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

function toNumberOrNull(value?: string | null) {
    if (value == null || value === "") return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}

export async function updateCartaModalidadesAction({
                                                       cotaId,
                                                       values,
                                                   }: Input) {
    const parsed = cartaModalidadesSchema.safeParse(values);

    if (!parsed.success) {
        return {
            ok: false,
            message: "Dados inválidos para salvar modalidades.",
            issues: parsed.error.flatten(),
        };
    }

    try {
        const payload = {
            embutido_permitido: parsed.data.embutidoPermitido,
            embutido_max_percent: parsed.data.embutidoPermitido
                ? toNumberOrNull(parsed.data.embutidoMaxPercent)
                : null,
            fgts_permitido: parsed.data.fgtsPermitido,
            opcoes_lance_fixo: parsed.data.opcoesLanceFixo.map((item) => ({
                id: item.id,
                ordem: item.ordem,
                percentual: item.ativo ? toNumberOrNull(item.percentual) : null,
                ativo: item.ativo,
                observacoes: item.observacoes ?? null,
            })),
        };

        console.log("updateCartaModalidadesAction payload", { cotaId, payload });

        // TODO: conectar no backend real

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