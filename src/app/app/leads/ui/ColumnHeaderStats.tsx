"use client";
import { Clock3, TrendingUp, Users } from "lucide-react";

export function ColumnHeaderStats({
                                      count,
                                      avgDays,
                                      conversion,
                                  }: {
    count: number;
    avgDays?: number;
    conversion?: number;
}) {
    const hasMetrics = avgDays !== undefined && conversion !== undefined;
    return (
        <div className="flex justify-between items-center mb-2 text-[11px] text-muted-foreground px-2">
            <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-400/80" />
                <span>{count} lead{count !== 1 && "s"}</span>
            </div>
            {hasMetrics && (
                <div className="flex items-center gap-3">
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
