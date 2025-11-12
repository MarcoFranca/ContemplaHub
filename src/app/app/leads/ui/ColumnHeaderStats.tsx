// src/app/app/leads/ui/ColumnHeaderStats.tsx
"use client";
import { Clock3, TrendingUp, Users } from "lucide-react";

export function ColumnHeaderStats({
                                      count,
                                      avgDays,
                                      conversion,
                                      diagnosticCompletionPct, // 0..1
                                      readinessAvg,            // 0..100
                                      tFirstContactAvgMin,     // minutos
                                  }: {
    count: number;
    avgDays?: number;
    conversion?: number;
    diagnosticCompletionPct?: number;
    readinessAvg?: number;
    tFirstContactAvgMin?: number;
}) {
    const hasMetrics =
        avgDays !== undefined && conversion !== undefined;

    const diagPctText =
        diagnosticCompletionPct !== undefined
            ? `${Math.round(diagnosticCompletionPct * 100)}%`
            : "—";

    const readinessText =
        readinessAvg !== undefined ? `${Math.round(readinessAvg)}%` : "—";

    const tFirstText =
        tFirstContactAvgMin !== undefined ? Math.round(tFirstContactAvgMin) : "—";

    return (
        <div className="flex justify-between items-center mb-2 text-[11px] text-muted-foreground px-2">
            <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-400/80" />
                <span>
          {count} lead{count !== 1 && "s"}
        </span>
            </div>

            {hasMetrics && (
                <div className="flex items-center gap-3">
                    <p className="text-[11px] text-muted-foreground">Diag. completo: {diagPctText}</p>
                    <p className="text-[11px] text-muted-foreground">Readiness médio: {readinessText}</p>
                    <p className="text-[11px] text-muted-foreground">1º contato (min): {tFirstText}</p>

                    <div className="flex items-center gap-1">
                        <Clock3 className="w-3 h-3 text-sky-400/80" />
                        <span>{avgDays ?? "—"}d</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-amber-400/80" />
                        <span>{conversion ?? "—"}%</span>
                    </div>
                </div>
            )}
        </div>
    );
}
