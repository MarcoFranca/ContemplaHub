import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertTriangle,
    CheckCircle2,
    Lightbulb,
    MoveRight,
    ShieldAlert,
} from "lucide-react";
import type { LancesCartaDetalhe } from "../../types";
import { buildExecutiveSummary } from "./lance-detail-helpers";

type Props = {
    data: LancesCartaDetalhe;
};

function toneClasses(tone: "success" | "warning" | "danger" | "neutral") {
    switch (tone) {
        case "success":
            return "border-emerald-500/30 bg-emerald-500/5";
        case "warning":
            return "border-amber-500/30 bg-amber-500/5";
        case "danger":
            return "border-red-500/30 bg-red-500/5";
        default:
            return "border-white/10 bg-white/5";
    }
}

function riskLabel(risk: "baixo" | "medio" | "alto") {
    if (risk === "baixo") return "Risco baixo";
    if (risk === "medio") return "Risco médio";
    return "Risco alto";
}

export function LanceExecutiveSummary({ data }: Props) {
    const summary = buildExecutiveSummary(data);

    return (
        <Card className={toneClasses(summary.tone)}>
            <CardHeader className="pb-3">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base md:text-lg">
                    {summary.tone === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : summary.tone === "danger" ? (
                        <ShieldAlert className="h-5 w-5 text-red-400" />
                    ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                    )}
                    {summary.titulo}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {summary.descricao}
                </p>

                <div className="grid gap-3 lg:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Lightbulb className="h-3.5 w-3.5" />
                            Recomendação principal
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-100">
                            {summary.recomendacao}
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <MoveRight className="h-3.5 w-3.5" />
                            Próxima ação
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-100">
                            {summary.proximaAcao}
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Exposição operacional
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge variant={summary.risco === "alto" ? "destructive" : "outline"}>
                                {riskLabel(summary.risco)}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}