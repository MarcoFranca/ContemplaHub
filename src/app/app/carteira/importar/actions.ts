"use server";

import { getBackendUrl } from "@/lib/backend";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

export type ImportProduto = "imobiliario" | "auto";
export type ImportStatus = "pronta" | "aviso" | "erro" | "ignorada";

export type ImportPreviewRow = {
    row_number: number;
    status: ImportStatus;
    cliente_nome: string | null;
    administradora_nome: string | null;
    grupo_codigo: string | null;
    numero_cota: string | null;
    contrato_numero: string | null;
    lance_tipo: "livre" | "fixo" | null;
    contemplada: boolean;
    errors: string[];
    warnings: string[];
    planned: {
        cliente_encontrado: boolean;
        cliente_criar: boolean;
        administradora_criar: boolean;
        grupo_criar: boolean;
        cota_criar: boolean;
        contrato_criar: boolean;
        lance_criar: boolean;
        contemplacao_criar: boolean;
    };
};

export type ImportSummary = {
    total_rows: number;
    prontas: number;
    avisos: number;
    erros: number;
    ignoradas: number;
    clientes_encontrados: number;
    clientes_a_criar: number;
    administradoras_a_criar: number;
    grupos_a_criar: number;
    cotas_a_criar: number;
    contratos_a_criar: number;
    lances_a_criar: number;
    contemplacoes_a_criar: number;
};

export type ImportPreviewResponse = {
    ok: boolean;
    rows: ImportPreviewRow[];
    summary: ImportSummary;
};

export type ImportConfirmRow = {
    row_number: number;
    status: ImportStatus;
    cliente_nome: string | null;
    lead_id: string | null;
    administradora_id: string | null;
    grupo_id: string | null;
    cota_id: string | null;
    contrato_id: string | null;
    lance_id: string | null;
    contemplacao_id: string | null;
    errors: string[];
    warnings: string[];
};

export type ImportConfirmResponse = {
    ok: boolean;
    imported_rows: number;
    failed_rows: number;
    ignored_rows: number;
    rows: ImportConfirmRow[];
    summary: ImportSummary;
};

async function getImportSession() {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) {
        throw new Error("Organização não identificada.");
    }
    if (!profile.isManager) {
        throw new Error("A importação em massa é permitida apenas para admin ou gestor.");
    }

    const supabase = await supabaseServer();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error("Sessão inválida. Faça login novamente.");
    }

    return {
        accessToken: session.access_token,
    };
}

async function postImport<T>(path: string, body: { raw_text: string; produto_padrao: ImportProduto }): Promise<T> {
    const { accessToken } = await getImportSession();
    const response = await fetch(`${getBackendUrl()}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.detail || data?.message || "Falha ao comunicar com o backend.");
    }
    return data as T;
}

export async function previewCarteiraImportAction(input: {
    rawText: string;
    produtoPadrao: ImportProduto;
}) {
    return postImport<ImportPreviewResponse>("/carteira/import/preview", {
        raw_text: input.rawText,
        produto_padrao: input.produtoPadrao,
    });
}

export async function confirmCarteiraImportAction(input: {
    rawText: string;
    produtoPadrao: ImportProduto;
}) {
    return postImport<ImportConfirmResponse>("/carteira/import/confirm", {
        raw_text: input.rawText,
        produto_padrao: input.produtoPadrao,
    });
}

