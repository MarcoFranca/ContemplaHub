"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Building2, CalendarDays } from "lucide-react";

import { LanceActions } from "./lance-actions";
import { CartaDetailsSheet } from "./CartaDetailsSheet";
import type { LanceCartaListItem } from "../types";
import {
    formatPercent,
    getExecucaoLabel,
    preferenciaLanceBadgeClass,
    preferenciaLanceIcons,
    resolvePreferenciaLance,
    resolveSuggestedPercent,
    resolveSuggestedValue,
    statusMesOrder,
} from "../lib/operacao";

function money(v?: number | null) {
    if (v == null) return "—";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function fmtDate(v?: string | null) {
    if (!v) return "—";
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${v}T00:00:00`));
}

const STATUS_BADGE: Record<string, string> = {
    pendente: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    planejado: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    feito: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    sem_lance: "border-slate-500/30 bg-slate-500/10 text-slate-300",
    contemplada: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    cancelada: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

function CompactRow({ item, competencia }: { item: LanceCartaListItem; competencia: string }) {
    const pref = resolvePreferenciaLance(item);
    const PrefIcon = preferenciaLanceIcons[pref.value];
    const percent = resolveSuggestedPercent(item);
    const valor = resolveSuggestedValue(item);

    return (
        <div className="flex flex-col gap-3 border-b border-white/5 px-3 py-3 last:border-0 transition-colors hover:bg-white/3 lg:flex-row lg:items-center lg:gap-4">
            {/* Cliente / cota */}
            <div className="min-w-0 lg:w-56">
                <div className="truncate text-sm font-semibold">
                    {item.cliente_nome || "Cliente sem nome"}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                    {item.administradora_nome || "Operadora —"} · Grupo {item.grupo_codigo} · Cota {item.numero_cota}
                </div>
            </div>

            {/* Lance sugerido */}
            <div className="flex items-center gap-2 lg:w-60">
                <Badge variant="outline" className={`gap-1 ${preferenciaLanceBadgeClass(pref.value)}`}>
                    <PrefIcon className="h-3.5 w-3.5" />
                    {pref.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                    {percent != null ? formatPercent(percent) : "—"}
                    {valor != null && <span className="text-foreground"> · {money(valor)}</span>}
                </span>
            </div>

            {/* Assembleia */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground lg:w-32">
                <CalendarDays className="h-3.5 w-3.5" />
                {fmtDate(item.assembleia_prevista)}
            </div>

            {/* Status */}
            <div className="lg:w-28">
                <Badge variant="outline" className={STATUS_BADGE[item.status_mes] ?? STATUS_BADGE.pendente}>
                    {getExecucaoLabel(item)}
                </Badge>
            </div>

            {/* Ações */}
            <div className="flex flex-wrap items-center gap-2 lg:ml-auto lg:justify-end">
                <LanceActions item={item} competencia={competencia} compact />
                <CartaDetailsSheet item={item} competencia={competencia} />
            </div>
        </div>
    );
}

export function LancesCompactList({
    items,
    competencia,
}: {
    items: LanceCartaListItem[];
    competencia: string;
}) {
    // Agrupa por operadora, ordenando cartas por status do mês e data de assembleia.
    const grupos = React.useMemo(() => {
        const map = new Map<string, LanceCartaListItem[]>();
        for (const item of items) {
            const key = item.administradora_nome || "Sem operadora";
            (map.get(key) ?? (map.set(key, []), map.get(key)!)).push(item);
        }
        return Array.from(map.entries())
            .map(([operadora, list]) => ({
                operadora,
                items: [...list].sort(
                    (a, b) =>
                        statusMesOrder(a.status_mes) - statusMesOrder(b.status_mes) ||
                        (a.assembleia_prevista || "").localeCompare(b.assembleia_prevista || "")
                ),
            }))
            .sort((a, b) => a.operadora.localeCompare(b.operadora));
    }, [items]);

    if (!items.length) {
        return (
            <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                Nenhuma carta restante após aplicar a visualização atual.
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-4">
            {grupos.map((grupo) => (
                <div key={grupo.operadora} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5 text-sm font-semibold">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {grupo.operadora}
                        <span className="text-xs font-normal text-muted-foreground">
                            · {grupo.items.length} carta(s)
                        </span>
                    </div>
                    <div>
                        {grupo.items.map((item) => (
                            <CompactRow key={item.cota_id} item={item} competencia={competencia} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
