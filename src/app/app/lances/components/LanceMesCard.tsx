"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    BadgePercent,
    Banknote,
    CircleGauge,
    FileStack,
    Sparkles,
    Target,
} from "lucide-react";
import type { LanceCartaListItem } from "../types";
import {
    formatPercent,
    getExecucaoDescription,
    getExecucaoLabel,
    resolveSuggestedPercent,
    resolveSuggestedTipo,
    resolveSuggestedValue,
} from "../lib/operacao";

type Props = {
    item: LanceCartaListItem;
};

function money(v?: number | null) {
    if (v == null) return "—";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(v);
}

export function LanceMesCard({ item }: Props) {
    const tipo = resolveSuggestedTipo(item);
    const percentual = resolveSuggestedPercent(item);
    const valor = resolveSuggestedValue(item);
    const execucao = getExecucaoLabel(item);

    const origem = (item.tipo_lance_preferencial ?? "").trim()
        ? `Preferência da carta: ${item.tipo_lance_preferencial}`
        : (item.opcoes_lance_fixo ?? []).some((op) => op.ativo)
            ? "Sugestão por lance fixo ativo"
            : "Ainda sem sugestão forte definida";

    return (
        <Card className="border-white/10 bg-white/5 shadow-sm">
            <CardContent className="space-y-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Target className="h-3.5 w-3.5"/>
                            Lance do mês
                        </p>

                        <p className="text-base font-semibold text-white">
                            {tipo} · {formatPercent(percentual)} · {money(valor)}
                        </p>
                    </div>

                    <Badge variant={item.status_mes === "feito" ? "default" : "outline"}>
                        {execucao}
                    </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <CircleGauge className="h-3.5 w-3.5"/>
                            Tipo
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-100">{tipo}</p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <BadgePercent className="h-3.5 w-3.5"/>
                            Percentual
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-100">
                            {formatPercent(percentual)}
                        </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Banknote className="h-3.5 w-3.5"/>
                            Valor estimado
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-100">
                            {money(valor)}
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                    <div>
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Sparkles className="h-3.5 w-3.5"/>
                            Origem
                        </p>
                        <p className="mt-1 text-sm text-slate-100">{origem}</p>
                    </div>

                    <div>
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <FileStack className="h-3.5 w-3.5"/>
                            Situação operacional
                        </p>
                        <p className="mt-1 text-sm text-slate-100">
                            {getExecucaoDescription(item)}
                        </p>
                    </div>
                </div>

                {(item.embutido_permitido ||
                    item.fgts_permitido ||
                    item.tem_pendencia_configuracao) && (
                    <div className="-mx-1 overflow-x-auto px-1">
                        <div className="flex w-max gap-2">
                            {item.embutido_permitido && (
                            <Badge variant="outline">Embute lance</Badge>
                        )}
                        {item.fgts_permitido && <Badge variant="outline">FGTS</Badge>}
                        {item.tem_pendencia_configuracao && (
                            <Badge
                                variant="outline"
                                className="border-orange-500/30 text-orange-300"
                            >
                                Pendência de configuração
                            </Badge>
                        )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}