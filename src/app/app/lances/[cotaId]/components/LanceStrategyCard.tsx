import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BadgePercent,
    Brain,
    FileStack,
    Goal,
    ShieldCheck,
    WalletCards,
} from "lucide-react";
import type { LancesCartaDetalhe } from "../../types";
import { getPreferenciaResolvida } from "./lance-detail-helpers";

type Props = {
    data: LancesCartaDetalhe;
};

function fmtPercent(v?: number | string | null) {
    if (v == null) return "—";
    const num = typeof v === "string" ? Number(v) : v;
    if (!Number.isFinite(num)) return "—";
    return `${new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(num)}%`;
}

function preferenciaLabel(value: string) {
    switch (value) {
        case "fixo":
            return "Lance fixo";
        case "livre":
            return "Lance livre";
        case "embutido":
            return "Lance embutido";
        case "sorteio":
            return "Sorteio";
        default:
            return "Não definido";
    }
}

export function LanceStrategyCard({ data }: Props) {
    const preferencia = getPreferenciaResolvida(data);
    const fixosAtivos = (data.opcoes_lance_fixo ?? [])
        .filter((op) => op.ativo)
        .sort((a, b) => a.ordem - b.ordem);

    return (
        <Card className="border-white/10 bg-white/5 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="inline-flex items-center gap-2 text-base">
                    <Brain className="h-4 w-4" />
                    Estratégia da carta
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{preferenciaLabel(preferencia)}</Badge>

                    {data.cota.autorizacao_gestao ? (
                        <Badge variant="outline" className="inline-flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Gestão autorizada
                        </Badge>
                    ) : (
                        <Badge variant="outline">Sem autorização</Badge>
                    )}

                    {data.cota.embutido_permitido && (
                        <Badge variant="outline" className="inline-flex items-center gap-1.5">
                            <WalletCards className="h-3.5 w-3.5" />
                            Embutido
                        </Badge>
                    )}

                    {data.cota.fgts_permitido && <Badge variant="outline">FGTS</Badge>}
                </div>

                <div className="grid gap-3">
                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Goal className="h-3.5 w-3.5" />
                            Objetivo
                        </p>
                        <p className="mt-2 text-sm text-slate-100">
                            {data.cota.objetivo || "Sem objetivo operacional registrado."}
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <FileStack className="h-3.5 w-3.5" />
                            Direcionamento da cota
                        </p>
                        <p className="mt-2 text-sm whitespace-pre-line text-slate-100">
                            {data.cota.estrategia || "Sem estratégia textual cadastrada na carta."}
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Estratégia do diagnóstico
                            </p>
                            <p className="mt-2 text-sm text-slate-100">
                                {data.diagnostico?.estrategia_lance || "—"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Readiness
                            </p>
                            <p className="mt-2 text-sm text-slate-100">
                                {data.diagnostico?.readiness_score ?? "—"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                <BadgePercent className="h-3.5 w-3.5" />
                                Lance base
                            </p>
                            <p className="mt-2 text-sm text-slate-100">
                                {fmtPercent(data.diagnostico?.lance_base_pct)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                <BadgePercent className="h-3.5 w-3.5" />
                                Lance máximo
                            </p>
                            <p className="mt-2 text-sm text-slate-100">
                                {fmtPercent(data.diagnostico?.lance_max_pct)}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Opções de lance fixo
                        </p>

                        {!fixosAtivos.length ? (
                            <p className="mt-2 text-sm text-muted-foreground">
                                Nenhuma opção ativa cadastrada.
                            </p>
                        ) : (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {fixosAtivos.map((op) => (
                                    <Badge key={op.id} variant="outline">
                                        Opção {op.ordem}: {fmtPercent(op.percentual)}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}