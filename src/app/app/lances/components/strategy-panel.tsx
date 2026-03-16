"use client";

import { Badge } from "@/components/ui/badge";
import type { LanceCartaListItem } from "../types";

type Props = {
    item: LanceCartaListItem;
};

function formatPercent(value?: number | null) {
    if (value == null || Number.isNaN(value)) return null;

    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value) + "%";
}

function normalizePreferencial(value?: string | null) {
    const v = (value ?? "").trim().toLowerCase();

    if (v === "fixo") return "Lance fixo";
    if (v === "livre") return "Lance livre";
    if (v === "embutido") return "Lance embutido";
    return null;
}

function parseStrategyHighlights(text?: string | null): string[] {
    if (!text?.trim()) return [];

    return text
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 4);
}

export function StrategyPanel({ item }: Props) {
    const preferencial = normalizePreferencial(item.tipo_lance_preferencial);
    const opcoesFixo = [...(item.opcoes_lance_fixo ?? [])]
        .filter((op) => op.ativo)
        .sort((a, b) => a.ordem - b.ordem);

    const highlights = parseStrategyHighlights(item.estrategia);

    return (
        <div className="rounded-lg border border-white/10 p-3 space-y-3">
            <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Estratégia recomendada
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                    {preferencial ? (
                        <Badge variant="secondary">{preferencial}</Badge>
                    ) : (
                        <Badge variant="outline">Sem preferencial definido</Badge>
                    )}

                    {item.autorizacao_gestao ? (
                        <Badge variant="secondary">Autorizada</Badge>
                    ) : (
                        <Badge variant="outline">Sem autorização</Badge>
                    )}

                    {item.embutido_permitido && (
                        <Badge variant="outline">Permite embutido</Badge>
                    )}

                    {item.fgts_permitido && (
                        <Badge variant="outline">Permite FGTS</Badge>
                    )}
                </div>
            </div>

            {!!opcoesFixo.length && (
                <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Opções de fixo
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {opcoesFixo.map((op) => (
                            <Badge key={op.id} variant="outline">
                                Opção {op.ordem}: {formatPercent(Number(op.percentual))}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Direcionamento
                </p>

                {highlights.length > 0 ? (
                    <div className="space-y-1">
                        {highlights.map((line, idx) => (
                            <p key={`${item.cota_id}-strategy-${idx}`} className="text-sm leading-relaxed">
                                {line}
                            </p>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Nenhuma estratégia detalhada cadastrada para esta carta.
                    </p>
                )}
            </div>
        </div>
    );
}