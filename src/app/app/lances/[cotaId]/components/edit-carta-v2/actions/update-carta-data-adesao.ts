"use server";

import { revalidatePath } from "next/cache";
import { updateCartaAction } from "@/app/app/lances/actions/carta-actions";

type Input = {
    cotaId: string;
    dataAdesao: string;
    grupoCodigo: string;
    numeroCota: string;
    produto: "imobiliario" | "auto";
};

export async function updateCartaDataAdesaoAction({
                                                      cotaId,
                                                      dataAdesao,
                                                      grupoCodigo,
                                                      numeroCota,
                                                      produto,
                                                  }: Input) {
    if (!dataAdesao) {
        return {
            ok: false,
            message: "Informe a data de adesão.",
        };
    }

    if (!grupoCodigo || !numeroCota || !produto) {
        return {
            ok: false,
            message:
                "Não foi possível atualizar a data de adesão porque faltam dados básicos da carta.",
        };
    }

    try {
        const formData = new FormData();
        formData.set("cotaId", cotaId);
        formData.set("grupo_codigo", grupoCodigo);
        formData.set("numero_cota", numeroCota);
        formData.set("produto", produto);
        formData.set("data_adesao", dataAdesao);

        await updateCartaAction(formData);

        revalidatePath("/app/lances");
        revalidatePath(`/app/lances/${cotaId}`);

        return {
            ok: true,
            message: "Data de adesão atualizada com sucesso.",
        };
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Erro ao atualizar data de adesão.",
        };
    }
}