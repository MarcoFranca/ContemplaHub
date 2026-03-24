"use server";

import { revalidatePath } from "next/cache";
import {
    cartaContratoSchema,
    type CartaContratoFormValues,
} from "../schemas/carta-contrato.schema";
import {backendAuthed} from "@/app/app/lances/actions/_shared";

type Input = {
    values: CartaContratoFormValues;
};

type BackendResponse = {
    contrato_id?: string | null;
    cota_id?: string | null;
    status?: string | null;
};

function toBackendMoney(value: number | null | undefined): string {
    if (value == null) return "";
    return String(value).replace(".", ",");
}

function extractBackendErrorMessage(error: unknown) {
    if (!(error instanceof Error)) return "Erro ao criar contrato e carta.";

    const raw = error.message;

    try {
        const parsed = JSON.parse(raw) as {
            detail?: Array<{ loc?: unknown[]; msg?: string; type?: string }> | string;
        };

        if (Array.isArray(parsed.detail)) {
            return parsed.detail
                .map((item) => {
                    const field = Array.isArray(item.loc) ? item.loc.join(".") : "campo";
                    return `${field}: ${item.msg ?? "valor inválido"}`;
                })
                .join(" | ");
        }

        if (typeof parsed.detail === "string") {
            return parsed.detail;
        }

        return raw;
    } catch {
        return raw;
    }
}

export async function createContratoCartaAction({ values }: Input) {
    const parsed = cartaContratoSchema.safeParse(values);

    if (!parsed.success) {
        return {
            ok: false,
            message: "Dados inválidos para criar contrato e carta.",
            issues: parsed.error.flatten(),
        };
    }

    try {
        if (!parsed.data.administradoraId) {
            return {
                ok: false,
                message: "Selecione a administradora para continuar.",
            };
        }

        const payload = {
            lead_id: parsed.data.leadId,
            administradora_id: parsed.data.administradoraId,

            numero_cota: parsed.data.numeroCota,
            grupo_codigo: parsed.data.grupoCodigo,
            produto: parsed.data.produto,

            valor_carta: toBackendMoney(parsed.data.valorCarta),
            prazo: parsed.data.prazo,
            forma_pagamento: null,
            indice_correcao: null,
            valor_parcela: toBackendMoney(parsed.data.valorParcela),

            parcela_reduzida: false,
            fgts_permitido: false,
            embutido_permitido: false,
            autorizacao_gestao: false,

            data_adesao: parsed.data.dataAdesao || null,
            data_assinatura: null,
            numero_contrato: null,

            opcoes_lance_fixo: [],
        };

        const data = await backendAuthed<BackendResponse>("/contracts/from-lead", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        const contractId = data?.contrato_id ?? null;
        const cotaId = data?.cota_id ?? null;

        if (!contractId || !cotaId) {
            return {
                ok: false,
                message:
                    "Contrato criado sem retorno completo de contrato/cota. Verifique a resposta do backend.",
            };
        }

        revalidatePath("/app/leads");
        revalidatePath("/app/carteira");
        revalidatePath("/app/lances");

        return {
            ok: true,
            message: "Contrato e carta criados com sucesso.",
            contractId,
            cotaId,
        };
    } catch (error) {
        return {
            ok: false,
            message: extractBackendErrorMessage(error),
        };
    }
}