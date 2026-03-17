"use server";

import { revalidatePath } from "next/cache";
import type {
    ComissaoRegra,
    CotaComissaoConfig,
    CotaComissaoParceiro,
    CotaComissaoPayload,
    CotaComissaoResponse,
    ParceiroSelectOption,
} from "../types";
import { backendAuthed } from "./backend";

type DeleteCheckResponse = {
    ok: boolean;
    config_exists: boolean;
    pode_excluir: boolean;
    motivo_bloqueio?: string | null;
    resumo?: {
        total_lancamentos: number;
        lancamentos_pagos: number;
        repasses_pagos: number;
    };
};

type ConfigEnvelope = {
    ok?: boolean;
    config: CotaComissaoConfig | null;
    regras: ComissaoRegra[];
    parceiros: CotaComissaoParceiro[];
};

export async function getComissaoCotaAction(cotaId: string): Promise<CotaComissaoResponse> {
    const data = await backendAuthed<ConfigEnvelope>(`/comissoes/cotas/${cotaId}`, {
        method: "GET",
    });

    return {
        config: data.config ?? null,
        regras: data.regras ?? [],
        parceiros: data.parceiros ?? [],
    };
}

export async function listParceirosForSelectAction(): Promise<ParceiroSelectOption[]> {
    const data = await backendAuthed<{
        ok?: boolean;
        items: Array<{ id: string; nome: string; ativo: boolean }>;
    }>(`/comissoes/parceiros?ativos=true`, {
        method: "GET",
    });

    return (data.items ?? []).map((item) => ({
        id: item.id,
        nome: item.nome,
        ativo: Boolean(item.ativo),
    }));
}

export async function saveComissaoCotaAction(
    cotaId: string,
    payload: CotaComissaoPayload
): Promise<CotaComissaoResponse> {
    const data = await backendAuthed<ConfigEnvelope>(`/comissoes/cotas/${cotaId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });

    revalidatePath("/app/lances");
    revalidatePath(`/app/lances/${cotaId}`);

    return {
        config: data.config ?? null,
        regras: data.regras ?? [],
        parceiros: data.parceiros ?? [],
    };
}

export async function getDeleteComissaoCheckAction(
    cotaId: string
): Promise<DeleteCheckResponse> {
    return backendAuthed<DeleteCheckResponse>(`/comissoes/cotas/${cotaId}/delete-check`, {
        method: "GET",
    });
}

export async function deleteComissaoCotaAction(cotaId: string, force = false) {
    const suffix = force ? "?force=true" : "";
    const data = await backendAuthed<{ ok: boolean; deleted: boolean; message?: string }>(
        `/comissoes/cotas/${cotaId}${suffix}`,
        { method: "DELETE" }
    );

    revalidatePath("/app/lances");
    revalidatePath("/app/comissoes");
    return data;
}

export async function cancelarComissaoCotaAction(cotaId: string) {
    const data = await backendAuthed<{ ok: boolean; updated: boolean; message?: string }>(
        `/comissoes/cotas/${cotaId}/cancelar`,
        { method: "POST" }
    );

    revalidatePath("/app/lances");
    revalidatePath("/app/comissoes");
    return data;
}