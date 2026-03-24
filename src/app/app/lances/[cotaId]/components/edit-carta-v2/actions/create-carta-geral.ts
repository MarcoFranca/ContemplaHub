"use server";

import { revalidatePath } from "next/cache";
import {
    cartaGeralSchema,
    type CartaGeralFormInput,
} from "../schemas/carta-geral.schema";
import { createCartaAction } from "@/app/app/lances/actions/carta-actions";

type Input = {
    values: CartaGeralFormInput;
};

export async function createCartaGeralAction({ values }: Input) {
    const parsed = cartaGeralSchema.safeParse(values);

    if (!parsed.success) {
        return {
            ok: false,
            message: "Dados inválidos para criar a carta.",
            issues: parsed.error.flatten(),
        };
    }

    try {
        const formData = new FormData();

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

        const result = await createCartaAction(formData);

        const cotaId = result?.cota_id ?? null;

        revalidatePath("/app/lances");
        revalidatePath("/app/carteira");

        return {
            ok: true,
            message: "Carta criada com sucesso.",
            cotaId: typeof cotaId === "string" ? cotaId : null,
        };
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof Error ? error.message : "Erro ao criar carta.",
        };
    }
}