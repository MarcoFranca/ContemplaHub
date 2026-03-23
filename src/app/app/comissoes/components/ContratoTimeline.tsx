"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimelineContratoItem } from "../types";

export function ContratoTimeline({
                                     items,
                                     title = "Timeline operacional",
                                 }: {
    items: TimelineContratoItem[];
    title?: string;
}) {
    return (
        <Card className="bg-white/5 border-white/10">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!items.length ? (
                    <div className="text-sm text-muted-foreground">Nenhum evento encontrado.</div>
                ) : null}

                {items.map((item, idx) => (
                    <div key={`${item.tipo}-${idx}`} className="flex gap-4 border-l pl-4">
                        <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="font-medium">{item.titulo}</div>
                                <Badge variant="outline">{labelTipo(item.tipo)}</Badge>
                            </div>

                            <div className="text-xs text-muted-foreground">
                                {formatDateTime(item.timestamp)} · Ref. {formatDate(item.data_ref)}
                            </div>

                            <pre className="overflow-x-auto rounded-lg bg-muted/40 p-3 text-xs">
                {JSON.stringify(item.payload, null, 2)}
              </pre>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function labelTipo(value: TimelineContratoItem["tipo"]) {
    const map = {
        pagamento: "Pagamento",
        competencia: "Competência",
        lancamento_comissao: "Comissão",
    };
    return map[value] ?? value;
}

function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("pt-BR");
}

function formatDateTime(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleString("pt-BR");
}