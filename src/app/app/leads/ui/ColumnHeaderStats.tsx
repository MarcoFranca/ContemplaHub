// src/app/app/leads/ui/ColumnHeaderStats.tsx
"use client";

import { Clock3, TrendingUp, Users } from "lucide-react";
import type { Stage } from "./LeadCardItem";

type Props = {
    stage: Stage;
    count: number;
    avgDays?: number;
    conversion?: number;
    diagCompletionPct?: number;       // 0..1
    diagnosticCompletionPct?: number; // 0..1 (alias, se vier com outro nome)
    readinessAvg?: number;            // 0..100
    tFirstContactAvgMin?: number;     // minutos
};

function formatFirstContact(min?: number) {
    if (min == null || Number.isNaN(min)) return "—";

    if (min >= 1440) {
        // mais de 1 dia
        return `${(min / 1440).toFixed(1)}d`;
    }
    if (min >= 60) {
        return `${(min / 60).toFixed(1)}h`;
    }
    return `${Math.round(min)}min`;
}

export function ColumnHeaderStats({
                                      stage,
                                      count,
                                      avgDays,
                                      conversion,
                                      diagCompletionPct,
                                      diagnosticCompletionPct,
                                      readinessAvg,
                                      tFirstContactAvgMin,
                                  }: Props) {
    const label = count === 1 ? "1 lead" : `${count} leads`;

    // aceita tanto diagCompletionPct quanto diagnosticCompletionPct
    const diag = diagCompletionPct ?? diagnosticCompletionPct;

    const hasAnyMetric =
        avgDays != null || diag != null || readinessAvg != null || tFirstContactAvgMin != null || conversion != null;

    const diagText = diag != null ? `${Math.round(diag * 100)}%` : "—";
    const readyText = readinessAvg != null ? `${Math.round(readinessAvg)}%` : "—";
    const firstText = formatFirstContact(tFirstContactAvgMin);
    const convText = conversion != null ? `${Math.round(conversion)}%` : "—";

    return (
        <div className="px-4 pt-3 pb-2 text-[11px] text-muted-foreground space-y-1.5">
            {/* Linha 1: leads + tempo médio */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-emerald-400/80" />
                    <span>{label}</span>
                </div>

                {avgDays != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px]">
            <Clock3 className="w-3 h-3" />
            <span>{avgDays.toFixed(1)}d méd.</span>
          </span>
                )}
            </div>

            {/* Linha 2: chips principais */}
            {hasAnyMetric && (
                <div className="flex flex-wrap gap-1.5">
                    {diag != null && (
                        <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-200">
              Diag. completo {diagText}
            </span>
                    )}
                    {readinessAvg != null && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-200">
              Ready médio {readyText}
            </span>
                    )}
                </div>
            )}

            {/* Linha 3: 1º contato + conversão */}
            <div className="flex flex-wrap gap-3">
                {tFirstContactAvgMin != null && (
                    <div className="flex items-center gap-1">
                        <Clock3 className="w-3 h-3 text-slate-400/90" />
                        <span>1º contato: {firstText}</span>
                    </div>
                )}
                {conversion != null && (
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-amber-400/90" />
                        <span>Conv.: {convText}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
