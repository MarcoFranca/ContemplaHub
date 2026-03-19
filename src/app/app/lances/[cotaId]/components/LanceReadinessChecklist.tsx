import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CircleDashed, ListChecks, XCircle } from "lucide-react";
import type { LancesCartaDetalhe } from "../../types";
import { getReadinessItems, getReadinessScore } from "./lance-detail-helpers";

type Props = {
    data: LancesCartaDetalhe;
};

function readinessLabel(percent: number) {
    if (percent >= 80) return "Pronta para operar";
    if (percent >= 50) return "Pronta com ressalvas";
    return "Base incompleta";
}

export function LanceReadinessChecklist({ data }: Props) {
    const items = getReadinessItems(data);
    const score = getReadinessScore(data);

    return (
        <Card className="border-white/10 bg-white/5 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="inline-flex items-center gap-2 text-base">
                    <ListChecks className="h-4 w-4" />
                    Checklist de prontidão
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/10 p-3">
                    <div>
                        <p className="text-sm font-medium text-slate-100">{readinessLabel(score.percent)}</p>
                        <p className="text-xs text-muted-foreground">
                            {score.okCount} de {score.total} critérios atendidos
                        </p>
                    </div>

                    <Badge variant={score.percent >= 80 ? "default" : "outline"}>
                        {score.percent}%
                    </Badge>
                </div>

                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.key}
                            className="rounded-xl border border-white/10 bg-black/10 p-3"
                        >
                            <div className="flex items-start gap-3">
                                <div className="pt-0.5">
                                    {item.ok ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    ) : item.key === "contemplacao" && !item.ok ? (
                                        <CircleDashed className="h-4 w-4 text-sky-400" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-amber-400" />
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-100">{item.label}</p>
                                    {item.hint ? (
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            {item.hint}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}