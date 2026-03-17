"use client";

import { Badge } from "@/components/ui/badge";
import {
    BadgePercent,
    CircleHelp,
    Dice5,
    FileText,
    Goal,
    ShieldCheck,
    WalletCards,
} from "lucide-react";
import type { LanceCartaListItem } from "../types";

type Props = {
    item: LanceCartaListItem;
};

type PreferenciaSource = "carta" | "fixo_ativo" | "fallback";

type ResolvedPreferencia = {
    value: "fixo" | "livre" | "embutido" | "sorteio";
    label: string;
    source: PreferenciaSource;
};

function formatPercent(value?: number | null) {
    if (value == null || Number.isNaN(value)) return null;

    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value) + "%";
}

function normalizePreferencial(
    value?: string | null
): "fixo" | "livre" | "embutido" | "sorteio" | "" {
    const v = (value ?? "").trim().toLowerCase();

    if (v === "fixo") return "fixo";
    if (v === "livre") return "livre";
    if (v === "embutido") return "embutido";
    if (v === "sorteio") return "sorteio";
    return "";
}

function preferencialLabel(value?: string | null) {
    const normalized = normalizePreferencial(value);

    if (normalized === "fixo") return "Lance fixo";
    if (normalized === "livre") return "Lance livre";
    if (normalized === "embutido") return "Lance embutido";
    if (normalized === "sorteio") return "Sorteio";

    return "";
}

function parseStrategyHighlights(text?: string | null): string[] {
    if (!text?.trim()) return [];

    return text
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 4);
}

function resolvePreferencia(item: LanceCartaListItem): ResolvedPreferencia {
    const fromCard = normalizePreferencial(item.tipo_lance_preferencial);

    if (fromCard) {
        return {
            value: fromCard,
            label: preferencialLabel(fromCard),
            source: "carta",
        };
    }

    const hasFixoAtivo = (item.opcoes_lance_fixo ?? []).some((op) => op.ativo);
    if (hasFixoAtivo) {
        return {
            value: "fixo",
            label: "Lance fixo",
            source: "fixo_ativo",
        };
    }

    return {
        value: "sorteio",
        label: "Sorteio",
        source: "fallback",
    };
}

function sourceLabel(source: PreferenciaSource) {
    if (source === "carta") return "definido na carta";
    if (source === "fixo_ativo") return "sugerido por fixo ativo";
    return "fallback operacional";
}

function preferenciaIcon(value: ResolvedPreferencia["value"]) {
    if (value === "fixo") return <BadgePercent className="h-4 w-4" />;
    if (value === "embutido") return <WalletCards className="h-4 w-4" />;
    if (value === "livre") return <Goal className="h-4 w-4" />;
    return <Dice5 className="h-4 w-4" />;
}

export function StrategyPanel({ item }: Props) {
    const opcoesFixo = [...(item.opcoes_lance_fixo ?? [])]
        .filter((op) => op.ativo)
        .sort((a, b) => a.ordem - b.ordem);

    const highlights = parseStrategyHighlights(item.estrategia);
    const preferencia = resolvePreferencia(item);

    return (
        <div className="rounded-lg border border-white/10 p-3 space-y-3">
            <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground inline-flex items-center gap-2">
                    <Goal className="h-3.5 w-3.5" />
                    Estratégia recomendada
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="inline-flex items-center gap-1.5">
                        {preferenciaIcon(preferencia.value)}
                        {preferencia.label}
                    </Badge>

                    <Badge variant="outline">
                        {sourceLabel(preferencia.source)}
                    </Badge>

                    {item.autorizacao_gestao ? (
                        <Badge variant="secondary" className="inline-flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Autorizada
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="inline-flex items-center gap-1.5">
                            <CircleHelp className="h-3.5 w-3.5" />
                            Sem autorização
                        </Badge>
                    )}

                    {item.embutido_permitido && (
                        <Badge variant="outline" className="inline-flex items-center gap-1.5">
                            <WalletCards className="h-3.5 w-3.5" />
                            Permite embutido
                        </Badge>
                    )}

                    {item.fgts_permitido && (
                        <Badge variant="outline">Permite FGTS</Badge>
                    )}
                </div>
            </div>

            {!!opcoesFixo.length && (
                <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground inline-flex items-center gap-2">
                        <BadgePercent className="h-3.5 w-3.5" />
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
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground inline-flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
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
                        {preferencia.value === "sorteio"
                            ? "Sem estratégia específica cadastrada. Operar com acompanhamento da assembleia e sorteio como cenário base."
                            : "Nenhuma estratégia detalhada cadastrada para esta carta."}
                    </p>
                )}
            </div>
        </div>
    );
}