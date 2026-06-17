"use server";

import { getBackendUrl } from "@/lib/backend";
import { getBackendAuthContext } from "./backend";

export type DocumentoImportado = {
    tipo_documento: "extrato" | "proposta" | null;
    dados: {
        grupo_codigo?: string;
        numero_cota?: string;
        numero_contrato?: string;
        produto?: "imobiliario" | "auto";
        valor_carta?: number;
        valor_parcela?: number;
        prazo?: number;
        data_adesao?: string;
        taxa_admin_percentual?: number;
        fundo_reserva_percentual?: number;
        percentual_reducao?: number;
        parcela_reduzida?: boolean;
        assembleia_dia?: number;
        embutido_max_percent?: number;
        embutido_permitido?: boolean;
        cliente_nome?: string;
        cliente_cpf?: string;
        cliente_nascimento?: string;
    };
    avisos: string[];
};

export type ImportarDocumentoResult =
    | { ok: true; data: DocumentoImportado }
    | { ok: false; error: string };

export async function importarDocumentoCartaAction(
    formData: FormData
): Promise<ImportarDocumentoResult> {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
        return { ok: false, error: "Selecione um arquivo PDF." };
    }

    let orgId: string;
    let accessToken: string;
    try {
        ({ orgId, accessToken } = await getBackendAuthContext());
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Sessão inválida." };
    }

    const upload = new FormData();
    upload.set("file", file, file.name);

    const res = await fetch(`${getBackendUrl()}/lances/cartas/importar-documento`, {
        method: "POST",
        headers: {
            "X-Org-Id": orgId,
            Authorization: `Bearer ${accessToken}`,
        },
        body: upload,
        cache: "no-store",
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        const detail =
            (data && (data.detail || data.message)) ||
            "Não foi possível ler o documento.";
        return { ok: false, error: typeof detail === "string" ? detail : "Erro ao ler o PDF." };
    }

    const data = (await res.json()) as DocumentoImportado;
    return { ok: true, data };
}
