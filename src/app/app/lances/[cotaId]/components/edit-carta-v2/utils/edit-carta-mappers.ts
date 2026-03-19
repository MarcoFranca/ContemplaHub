import type { EditCartaSheetInitialData } from "../types";

type LegacyCota = {
    grupo_codigo: string;
    numero_cota: string;
    produto: string;
    valor_carta?: number | string | null;
    valor_parcela?: number | string | null;
    prazo?: number | null;
    status: string;
    autorizacao_gestao: boolean;
    embutido_permitido: boolean;
    embutido_max_percent?: number | string | null;
    fgts_permitido: boolean;
    tipo_lance_preferencial?: string | null;
    estrategia?: string | null;
    objetivo?: string | null;
    assembleia_dia?: number | null;
    data_adesao?: string | null;
};

type LegacyOpcao = {
    id: string;
    cota_id: string;
    percentual: number | string;
    ordem: number;
    ativo: boolean;
    observacoes?: string | null;
    created_at?: string | null;
};

function toNumber(value?: number | string | null): number | null {
    if (value == null || value === "") return null;
    const n = typeof value === "number" ? value : Number(value);
    return Number.isNaN(n) ? null : n;
}

export function mapLegacyCartaToEditSheetData(params: {
    cotaId: string;
    competencia?: string;
    cota: LegacyCota;
    opcoesLanceFixo?: LegacyOpcao[];
}): EditCartaSheetInitialData {
    const { cotaId, competencia, cota, opcoesLanceFixo = [] } = params;

    return {
        cotaId,
        competencia: competencia ?? null,

        geral: {
            grupoCodigo: cota.grupo_codigo ?? "",
            numeroCota: cota.numero_cota ?? "",
            produto: cota.produto ?? "",
            status: cota.status ?? "ativa",
            dataAdesao: cota.data_adesao ?? null,
            prazo: cota.prazo ?? null,
            valorCarta: toNumber(cota.valor_carta),
            valorParcela: toNumber(cota.valor_parcela),
        },

        estrategia: {
            objetivo: cota.objetivo ?? "",
            estrategia: cota.estrategia ?? "",
            tipoLancePreferencial:
                (cota.tipo_lance_preferencial as
                    | "livre"
                    | "fixo"
                    | "embutido"
                    | "sorteio"
                    | ""
                    | null) ?? "",
            autorizacaoGestao: !!cota.autorizacao_gestao,
        },

        modalidades: {
            embutidoPermitido: !!cota.embutido_permitido,
            embutidoMaxPercent: toNumber(cota.embutido_max_percent),
            fgtsPermitido: !!cota.fgts_permitido,
            opcoesLanceFixo: opcoesLanceFixo.map((item) => ({
                id: item.id,
                ordem: item.ordem,
                percentual: toNumber(item.percentual),
                ativo: !!item.ativo,
                observacoes: item.observacoes ?? null,
            })),
        },

        operacao: {
            assembleiaDia: cota.assembleia_dia ?? null,
            assembleiaDiaOrigem: null,
            statusMes: "pendente",
            observacoes: "",
            dataUltimoLance: null,
        },
    };
}