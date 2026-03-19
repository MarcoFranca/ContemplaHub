"use server";

import { revalidatePath } from "next/cache";
import {
    cartaGeralSchema,
    type CartaGeralFormValues,
} from "../schemas/carta-geral.schema";
import { updateCartaAction } from "@/app/app/lances/actions/carta-actions";

type Input = {
    cotaId: string;
    values: CartaGeralFormValues;
};

export async function updateCartaGeralAction({ cotaId, values }: Input) {
    const parsed = cartaGeralSchema.safeParse(values);

    if (!parsed.success) {
        return {
            ok: false,
            message: "Dados inválidos para salvar os dados gerais.",
            issues: parsed.error.flatten(),
        };
    }

    try {
        const formData = new FormData();

        formData.set("cotaId", cotaId);
        formData.set("grupo_codigo", parsed.data.grupoCodigo);
        formData.set("numero_cota", parsed.data.numeroCota);
        formData.set("produto", parsed.data.produto);
        formData.set("status", parsed.data.status);
        formData.set("data_adesao", parsed.data.dataAdesao ?? "");
        formData.set("prazo", parsed.data.prazo == null ? "" : String(parsed.data.prazo));
        formData.set(
            "valor_carta",
            parsed.data.valorCarta == null ? "" : String(parsed.data.valorCarta)
        );
        formData.set(
            "valor_parcela",
            parsed.data.valorParcela == null ? "" : String(parsed.data.valorParcela)
        );

        await updateCartaAction(formData);

        revalidatePath("/app/lances");
        revalidatePath(`/app/lances/${cotaId}`);

        return {
            ok: true,
            message: "Dados gerais atualizados com sucesso.",
        };
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Erro ao salvar dados gerais.",
        };
    }
}