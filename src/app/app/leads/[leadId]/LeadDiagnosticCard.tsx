"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
    CalendarClock,
    CircleDollarSign,
    FileText,
    Gauge,
    Sparkles,
    Target,
    UserRound,
    Loader2,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DiagnosticSheet } from "@/app/app/leads/ui/DiagnosticSheet";
import { getLeadDiagnostic, type DiagnosticRecord } from "@/app/app/leads/actions.diagnostic";
import { formatCurrencyBRL } from "./leadUtils";

function DiagnosticMiniCard({
                                icon,
                                label,
                                value,
                            }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                {icon}
                {label}
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
        </div>
    );
}

function fmtPercent(value: number | null | undefined) {
    if (value == null) return "—";
    return `${value}%`;
}

export function LeadDiagnosticCard({
                                       leadId,
                                       leadName,
                                   }: {
    leadId: string;
    leadName: string | null;
}) {
    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState<DiagnosticRecord | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const rec = await getLeadDiagnostic(leadId);
                if (!cancelled) setRecord(rec);
            } catch (err) {
                console.error("Erro ao carregar diagnóstico do card:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [leadId]);

    const objetivo = record?.objetivo ?? "—";
    const perfil = ((record?.extras as Record<string, unknown> | undefined)?.perfil_psicologico as string) ?? "—";
    const prazoAlvo = record?.prazo_alvo_meses ? `${record.prazo_alvo_meses} meses` : "—";
    const cartaAlvo = formatCurrencyBRL(record?.valor_carta_alvo ?? null);
    const comentarios =
        ((record?.extras as Record<string, unknown> | undefined)?.comentarios as string) ?? "";

    const readiness = record?.readiness_score ?? null;
    const risco = record?.score_risco ?? null;
    const probConversao =
        record?.prob_conversao != null ? `${Math.round(record.prob_conversao * 100)}%` : "—";

    return (
        <Card className="border-white/10 bg-white/5">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
              <Sparkles className="h-4 w-4 text-emerald-300" />
            </span>
                        Diagnóstico do lead
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Visão resumida do diagnóstico consultivo e dos indicadores principais.
                    </p>
                </div>

                <DiagnosticSheet leadId={leadId} leadName={leadName} />
            </CardHeader>

            <CardContent className="space-y-4">
                {loading ? (
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando diagnóstico...
                    </div>
                ) : !record ? (
                    <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-muted-foreground">
                        Nenhum diagnóstico preenchido ainda para este lead.
                        <span className="ml-1 text-emerald-400">
              Clique no botão acima para criar ou editar o diagnóstico.
            </span>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            <DiagnosticMiniCard
                                icon={<Target className="h-3.5 w-3.5 text-emerald-300" />}
                                label="Objetivo"
                                value={objetivo}
                            />

                            <DiagnosticMiniCard
                                icon={<UserRound className="h-3.5 w-3.5 text-emerald-300" />}
                                label="Perfil psicológico"
                                value={perfil || "—"}
                            />

                            <DiagnosticMiniCard
                                icon={<CalendarClock className="h-3.5 w-3.5 text-emerald-300" />}
                                label="Prazo alvo"
                                value={prazoAlvo}
                            />

                            <DiagnosticMiniCard
                                icon={<CircleDollarSign className="h-3.5 w-3.5 text-emerald-300" />}
                                label="Carta alvo"
                                value={cartaAlvo}
                            />

                            <DiagnosticMiniCard
                                icon={<Gauge className="h-3.5 w-3.5 text-emerald-300" />}
                                label="Readiness"
                                value={fmtPercent(readiness)}
                            />

                            <DiagnosticMiniCard
                                icon={<Gauge className="h-3.5 w-3.5 text-emerald-300" />}
                                label="Risco / conversão"
                                value={`${fmtPercent(risco)} • ${probConversao}`}
                            />
                        </div>

                        {comentarios ? (
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-emerald-300">
                                    <FileText className="h-3.5 w-3.5" />
                                    Comentários do consultor
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-emerald-50/85">
                                    {comentarios}
                                </p>
                            </div>
                        ) : null}
                    </>
                )}
            </CardContent>
        </Card>
    );
}