"use server";

import { revalidatePath } from "next/cache";
import { getBackendUrl } from "@/lib/backend";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import type {
    LanceCartaListResponse,
    LancesCartaDetalhe,
    LancesFiltersInput,
    RegraOperadora,
    CotaComissaoConfig,
    CotaComissaoParceiro,
    CotaComissaoPayload,
    CotaComissaoResponse,
    ComissaoRegra,
    ParceiroSelectOption,
} from "./types";

async function getBackendAuthContext() {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error("Organização inválida.");

    const supabase = await supabaseServer();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;
    if (!accessToken) throw new Error("Sessão inválida. Faça login novamente.");

    return {
        orgId: profile.orgId,
        accessToken,
    };
}

export async function getContratoByCotaAction(cotaId: string): Promise<{ contrato_id: string | null }> {
    const { orgId, accessToken } = await getBackendAuthContext();
    const supabase = await supabaseServer();

    const { data, error } = await supabase
        .from("contratos")
        .select("id")
        .eq("org_id", orgId)
        .eq("cota_id", cotaId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return {
        contrato_id: data?.id ?? null,
    };
}

export async function updateCartaAction(formData: FormData): Promise<void> {
    const cotaId = String(formData.get("cotaId") || "");
    if (!cotaId) throw new Error("Cota inválida.");

    const toNullableString = (name: string) => {
        const value = String(formData.get(name) || "").trim();
        return value ? value : null;
    };

    const toNullableNumber = (name: string) => {
        const value = String(formData.get(name) || "").trim();
        if (!value) return null;
        const num = Number(value.replace(",", "."));
        return Number.isFinite(num) ? num : null;
    };

    const opcoesLanceFixoJson = String(formData.get("opcoesLanceFixoJson") || "[]");

    let opcoes_lance_fixo: Array<{
        id?: string | null;
        percentual: number;
        ordem: number;
        ativo: boolean;
        observacoes?: string | null;
    }> = [];

    try {
        const parsed = JSON.parse(opcoesLanceFixoJson);
        if (Array.isArray(parsed)) {
            opcoes_lance_fixo = parsed;
        }
    } catch {
        throw new Error("Opções de lance fixo inválidas.");
    }

    await backendAuthed(`/lances/cartas/${cotaId}`, {
        method: "PATCH",
        body: JSON.stringify({
            grupo_codigo: toNullableString("grupo_codigo"),
            numero_cota: toNullableString("numero_cota"),
            produto: toNullableString("produto"),
            valor_carta: toNullableNumber("valor_carta"),
            valor_parcela: toNullableNumber("valor_parcela"),
            prazo: toNullableNumber("prazo"),
            assembleia_dia: toNullableNumber("assembleia_dia"),
            data_adesao: toNullableString("data_adesao"), // <- adicionar
            autorizacao_gestao: Boolean(formData.get("autorizacao_gestao")),
            embutido_permitido: Boolean(formData.get("embutido_permitido")),
            embutido_max_percent: toNullableNumber("embutido_max_percent"),
            fgts_permitido: Boolean(formData.get("fgts_permitido")),
            tipo_lance_preferencial: toNullableString("tipo_lance_preferencial"),
            estrategia: toNullableString("estrategia"),
            objetivo: toNullableString("objetivo"),
            opcoes_lance_fixo,
        }),
    });

    revalidatePath("/app/lances");
}

async function backendAuthed<T>(path: string, init?: RequestInit): Promise<T> {
    const { orgId, accessToken } = await getBackendAuthContext();
    const baseUrl = getBackendUrl();

    const res = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            "X-Org-Id": orgId,
            Authorization: `Bearer ${accessToken}`,
            ...(init?.headers || {}),
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erro ${res.status} ao chamar backend.`);
    }

    if (res.status === 204) return null as T;
    return (await res.json()) as T;
}

function qs(params: Record<string, string | number | boolean | null | undefined>) {
    const s = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null || v === "") continue;
        s.set(k, String(v));
    }
    return s.toString();
}

export async function listLancesCartas(
    filters: LancesFiltersInput
): Promise<LanceCartaListResponse> {
    const query = qs({
        competencia: filters.competencia,
        status_cota: filters.status_cota ?? "ativa",
        administradora_id: filters.administradora_id,
        produto: filters.produto,
        somente_autorizadas: filters.somente_autorizadas ? "true" : undefined,
        q: filters.q,
        page: filters.page ?? 1,
        page_size: filters.page_size ?? 20,
    });

    return backendAuthed<LanceCartaListResponse>(`/lances/cartas?${query}`, {
        method: "GET",
    });
}

export async function getLanceCartaDetalhe(
    cotaId: string,
    competencia: string
): Promise<LancesCartaDetalhe> {
    const query = qs({ competencia });
    return backendAuthed<LancesCartaDetalhe>(`/lances/cartas/${cotaId}?${query}`, {
        method: "GET",
    });
}

export async function listRegrasOperadora(): Promise<RegraOperadora[]> {
    return backendAuthed<RegraOperadora[]>(`/lances/config/regras-operadora`, {
        method: "GET",
    });
}

export async function salvarControleMensalAction(formData: FormData) {
    const cotaId = String(formData.get("cota_id") || "");
    const competencia = String(formData.get("competencia") || "");
    const status_mes = String(formData.get("status_mes") || "");
    const observacoes = String(formData.get("observacoes") || "");

    if (!cotaId || !competencia || !status_mes) {
        throw new Error("Dados obrigatórios do controle mensal não informados.");
    }

    await backendAuthed(`/lances/cartas/${cotaId}/controle-mensal`, {
        method: "POST",
        body: JSON.stringify({
            competencia,
            status_mes,
            observacoes: observacoes || null,
        }),
    });

    revalidatePath("/app/lances");
    revalidatePath(`/app/lances/${cotaId}`);
}

export async function registrarLanceAction(formData: FormData) {
    const cotaId = String(formData.get("cota_id") || "");
    const competencia = String(formData.get("competencia") || "");
    const assembleia_data = String(formData.get("assembleia_data") || "");
    const tipo = String(formData.get("tipo") || "");
    const percentualRaw = String(formData.get("percentual") || "");
    const valorRaw = String(formData.get("valor") || "");
    const base_calculo = String(formData.get("base_calculo") || "saldo_devedor");
    const pagamento_embutido_raw = String(formData.get("pagamento_embutido") || "0");
    const pagamento_fgts_raw = String(formData.get("pagamento_fgts") || "0");
    const pagamento_proprio_raw = String(formData.get("pagamento_proprio") || "0");
    const pagamento_outro_raw = String(formData.get("pagamento_outro") || "0");
    const observacoes_competencia = String(formData.get("observacoes_competencia") || "");
    const cota_lance_fixo_opcao_id = String(formData.get("cota_lance_fixo_opcao_id") || "");

    if (!cotaId || !competencia || !assembleia_data || !tipo) {
        throw new Error("Preencha os dados obrigatórios do lance.");
    }

    const percentual =
        percentualRaw.trim() === "" ? null : Number(percentualRaw.replace(",", "."));
    const valor = valorRaw.trim() === "" ? null : Number(valorRaw.replace(",", "."));
    const pagamento_embutido = Number(pagamento_embutido_raw.replace(",", ".") || "0");
    const pagamento_fgts = Number(pagamento_fgts_raw.replace(",", ".") || "0");
    const pagamento_proprio = Number(pagamento_proprio_raw.replace(",", ".") || "0");
    const pagamento_outro = Number(pagamento_outro_raw.replace(",", ".") || "0");

    await backendAuthed(`/lances/cartas/${cotaId}/registrar-lance`, {
        method: "POST",
        body: JSON.stringify({
            competencia,
            assembleia_data,
            tipo,
            percentual,
            valor,
            base_calculo,
            pagamento: {
                composicao: {
                    embutido: pagamento_embutido,
                    fgts: pagamento_fgts,
                    proprio: pagamento_proprio,
                    outro: pagamento_outro,
                },
                observacoes: observacoes_competencia || null,
            },
            resultado: "pendente",
            observacoes_competencia: observacoes_competencia || null,
            cota_lance_fixo_opcao_id: cota_lance_fixo_opcao_id || null,
        }),
    });
    revalidatePath("/app/lances");
    revalidatePath(`/app/lances/${cotaId}`);
}

export async function contemplarCotaAction(formData: FormData) {
    const cotaId = String(formData.get("cota_id") || "");
    const competencia = String(formData.get("competencia") || "");
    const data = String(formData.get("data") || "");
    const motivo = String(formData.get("motivo") || "lance");
    const lance_percentual_raw = String(formData.get("lance_percentual") || "");

    if (!cotaId || !competencia || !data) {
        throw new Error("Preencha os dados da contemplação.");
    }

    await backendAuthed(`/lances/cartas/${cotaId}/contemplar`, {
        method: "POST",
        body: JSON.stringify({
            competencia,
            data,
            motivo,
            lance_percentual:
                lance_percentual_raw.trim() === ""
                    ? null
                    : Number(lance_percentual_raw.replace(",", ".")),
        }),
    });

    revalidatePath("/app/lances");
    revalidatePath(`/app/lances/${cotaId}`);
}

export async function cancelarCotaAction(formData: FormData) {
    const cotaId = String(formData.get("cota_id") || "");
    const competencia = String(formData.get("competencia") || "");
    const observacoes = String(formData.get("observacoes") || "");

    if (!cotaId || !competencia) {
        throw new Error("Dados obrigatórios para cancelamento não informados.");
    }

    await backendAuthed(`/lances/cartas/${cotaId}/cancelar`, {
        method: "POST",
        body: JSON.stringify({
            competencia,
            observacoes: observacoes || null,
        }),
    });

    revalidatePath("/app/lances");
    revalidatePath(`/app/lances/${cotaId}`);
}

export async function reativarCotaAction(formData: FormData) {
    const cotaId = String(formData.get("cota_id") || "");
    if (!cotaId) throw new Error("Cota não informada.");

    await backendAuthed(`/lances/cartas/${cotaId}/reativar`, {
        method: "POST",
    });

    revalidatePath("/app/lances");
    revalidatePath(`/app/lances/${cotaId}`);
}
export async function getComissaoCotaAction(cotaId: string): Promise<CotaComissaoResponse> {
    const data = await backendAuthed<{ ok?: boolean; config: CotaComissaoConfig | null; regras: ComissaoRegra[]; parceiros: CotaComissaoParceiro[] }>(
        `/comissoes/cotas/${cotaId}`,
        { method: "GET" }
    );

    return {
        config: data.config ?? null,
        regras: data.regras ?? [],
        parceiros: data.parceiros ?? [],
    };
}

export async function listParceirosForSelectAction(): Promise<ParceiroSelectOption[]> {
    const data = await backendAuthed<{ ok?: boolean; items: Array<{ id: string; nome: string; ativo: boolean }> }>(
        `/comissoes/parceiros?ativos=true`,
        { method: "GET" }
    );

    return (data.items ?? []).map((item) => ({
        id: item.id,
        nome: item.nome,
        ativo: Boolean(item.ativo),
    }));
}

export async function saveComissaoCotaAction(cotaId: string, payload: CotaComissaoPayload): Promise<CotaComissaoResponse> {
    const data = await backendAuthed<{ ok?: boolean; config: CotaComissaoConfig | null; regras: ComissaoRegra[]; parceiros: CotaComissaoParceiro[] }>(
        `/comissoes/cotas/${cotaId}`,
        {
            method: "PUT",
            body: JSON.stringify(payload),
        }
    );

    revalidatePath("/app/lances");
    revalidatePath(`/app/lances/${cotaId}`);

    return {
        config: data.config ?? null,
        regras: data.regras ?? [],
        parceiros: data.parceiros ?? [],
    };
}
