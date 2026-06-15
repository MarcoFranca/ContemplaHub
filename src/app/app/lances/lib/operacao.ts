import type { ComponentType } from "react";
import { BadgePercent, Dice5, Goal, WalletCards } from "lucide-react";
import type { LanceCartaListItem, StatusMes } from "../types";

export type ExecucaoStatus =
    | "pendente"
    | "planejado"
    | "baixado"
    | "sem_lance";

export function getExecucaoStatus(item: LanceCartaListItem): ExecucaoStatus {
    if (item.status_mes === "feito") return "baixado";
    if (item.status_mes === "planejado") return "planejado";
    if (item.status_mes === "sem_lance") return "sem_lance";
    return "pendente";
}

export function getExecucaoLabel(item: LanceCartaListItem) {
    const status = getExecucaoStatus(item);

    if (status === "baixado") return "Baixado";
    if (status === "planejado") return "Planejado";
    if (status === "sem_lance") return "Sem lance";
    return "Pendente";
}

export function getExecucaoDescription(item: LanceCartaListItem) {
    const status = getExecucaoStatus(item);

    if (status === "baixado") {
        return "Lance do mês já tratado e baixado.";
    }

    if (status === "planejado") {
        return "Carta com lance definido para esta competência.";
    }

    if (status === "sem_lance") {
        return "Carta marcada para não ofertar lance nesta competência.";
    }

    if (item.tem_pendencia_configuracao) {
        return "Há pendência de configuração antes da operação.";
    }

    return "Carta aguardando definição de lance.";
}

export function getPrimaryActionLabel(item: LanceCartaListItem) {
    const status = getExecucaoStatus(item);

    if (item.status === "cancelada") return "Reativar";
    if (item.status === "contemplada") return "Contemplada";
    if (status === "baixado") return "Baixado";
    if (status === "planejado") return "Dar baixa";
    if (status === "sem_lance") return "Sem lance";
    return "Planejar lance";
}

export function getOperacaoCounts(items: LanceCartaListItem[]) {
    return {
        total: items.length,
        pendentes: items.filter((i) => getExecucaoStatus(i) === "pendente").length,
        planejados: items.filter((i) => getExecucaoStatus(i) === "planejado").length,
        baixados: items.filter((i) => getExecucaoStatus(i) === "baixado").length,
        semLance: items.filter((i) => getExecucaoStatus(i) === "sem_lance").length,
        contempladas: items.filter((i) => i.status === "contemplada").length,
    };
}

export type OperacaoView =
    | "pendentes"
    | "planejados"
    | "baixados"
    | "sem_lance"
    | "todas";

export function filterByOperacaoView(
    items: LanceCartaListItem[],
    view: OperacaoView
) {
    if (view === "pendentes") {
        return items.filter((i) => getExecucaoStatus(i) === "pendente");
    }

    if (view === "planejados") {
        return items.filter((i) => getExecucaoStatus(i) === "planejado");
    }

    if (view === "baixados") {
        return items.filter((i) => getExecucaoStatus(i) === "baixado");
    }

    if (view === "sem_lance") {
        return items.filter((i) => getExecucaoStatus(i) === "sem_lance");
    }

    return items;
}

export type PreferenciaLanceValue = "fixo" | "livre" | "embutido" | "sorteio";
export type PreferenciaLanceSource = "carta" | "fixo_ativo" | "fallback";

export type ResolvedPreferenciaLance = {
    value: PreferenciaLanceValue;
    label: string;
    source: PreferenciaLanceSource;
};

function normalizePreferencial(value?: string | null): PreferenciaLanceValue | "" {
    const v = (value ?? "").trim().toLowerCase();

    if (v === "fixo") return "fixo";
    if (v === "livre") return "livre";
    if (v === "embutido") return "embutido";
    if (v === "sorteio") return "sorteio";
    return "";
}

export function preferenciaLanceLabel(value: PreferenciaLanceValue) {
    switch (value) {
        case "fixo": return "Lance fixo";
        case "livre": return "Lance livre";
        case "embutido": return "Lance embutido";
        default: return "Sorteio";
    }
}

export function resolvePreferenciaLance(item: LanceCartaListItem): ResolvedPreferenciaLance {
    const fromCarta = normalizePreferencial(item.tipo_lance_preferencial);
    if (fromCarta) {
        return { value: fromCarta, label: preferenciaLanceLabel(fromCarta), source: "carta" };
    }

    const hasFixoAtivo = (item.opcoes_lance_fixo ?? []).some((op) => op.ativo);
    if (hasFixoAtivo) {
        return { value: "fixo", label: "Lance fixo", source: "fixo_ativo" };
    }

    return { value: "sorteio", label: "Sorteio", source: "fallback" };
}

export const preferenciaLanceIcons: Record<PreferenciaLanceValue, ComponentType<{ className?: string }>> = {
    fixo: BadgePercent,
    embutido: WalletCards,
    livre: Goal,
    sorteio: Dice5,
};

export function preferenciaLanceBadgeClass(value: PreferenciaLanceValue) {
    switch (value) {
        case "fixo": return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
        case "embutido": return "border-violet-500/30 bg-violet-500/10 text-violet-300";
        case "livre": return "border-sky-500/30 bg-sky-500/10 text-sky-300";
        default: return "border-slate-500/30 bg-slate-500/10 text-slate-300";
    }
}

export function resolveSuggestedTipo(item: LanceCartaListItem) {
    switch (resolvePreferenciaLance(item).value) {
        case "fixo": return "Fixo";
        case "livre": return "Livre";
        case "embutido": return "Embutido";
        default: return "Sorteio";
    }
}

export function resolveSuggestedPercent(item: LanceCartaListItem) {
    const fixoAtivo = [...(item.opcoes_lance_fixo ?? [])]
        .filter((op) => op.ativo)
        .sort((a, b) => a.ordem - b.ordem)[0];

    if (fixoAtivo?.percentual != null) {
        return Number(fixoAtivo.percentual);
    }

    return null;
}

export function resolveSuggestedValue(item: LanceCartaListItem) {
    const percentual = resolveSuggestedPercent(item);
    const valorCarta = Number(item.valor_carta ?? 0);

    if (percentual == null || !valorCarta) return null;

    return valorCarta * (percentual / 100);
}

export function formatPercent(value?: number | null) {
    if (value == null || Number.isNaN(value)) return "—";
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value) + "%";
}

export function statusMesOrder(status: StatusMes) {
    switch (status) {
        case "pendente":
            return 0;
        case "planejado":
            return 1;
        case "feito":
            return 2;
        case "sem_lance":
            return 3;
        case "contemplada":
            return 4;
        case "cancelada":
            return 5;
        default:
            return 99;
    }
}