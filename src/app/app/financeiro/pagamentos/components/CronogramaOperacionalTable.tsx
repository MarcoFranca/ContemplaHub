"use client";

import { AlertCircle, CheckCircle2, CircleSlash, CornerDownRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { PagamentoItem, PagamentoStatus } from "../types";

type CronogramaOperacionalTableProps = {
    pagamentos: PagamentoItem[];
    busyPagamentoId?: string | null;
    onStatusChange: (item: PagamentoItem, status: PagamentoStatus) => void;
    onSkip: (item: PagamentoItem) => void;
    onCancelFuture: (item: PagamentoItem) => void;
};

export function CronogramaOperacionalTable({
    pagamentos,
    busyPagamentoId,
    onStatusChange,
    onSkip,
    onCancelFuture,
}: CronogramaOperacionalTableProps) {
    if (!pagamentos.length) {
        return (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
                Nenhuma parcela operacional foi persistida ainda. Confirme o cronograma para gerar a visão mensal prevista.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
            <div className="grid grid-cols-[0.8fr_0.8fr_0.9fr_0.8fr_0.9fr_0.9fr_1.4fr] gap-3 border-b border-white/10 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                <span>Competencia</span>
                <span>Vencimento</span>
                <span>Parcela</span>
                <span>Status</span>
                <span>Competencia</span>
                <span>Comissao</span>
                <span>Acoes</span>
            </div>
            <div className="divide-y divide-white/5">
                {pagamentos.map((item) => {
                    const busy = busyPagamentoId === item.id;
                    return (
                        <div
                            key={item.id}
                            className="grid grid-cols-[0.8fr_0.8fr_0.9fr_0.8fr_0.9fr_0.9fr_1.4fr] gap-3 px-4 py-4 text-sm text-slate-200"
                        >
                            <div className="grid gap-1">
                                <span className="font-medium text-white">{formatMonth(item.competencia)}</span>
                                <span className="text-xs text-slate-500">{item.referencia || "Cronograma operacional"}</span>
                            </div>
                            <span>{formatDate(item.vencimento)}</span>
                            <span>{formatMoney(item.valor)}</span>
                            <div className="grid gap-1">
                                <Badge variant="outline" className={statusBadgeClass(item.status)}>
                                    {labelStatus(item.status)}
                                </Badge>
                                {item.pago_em ? <span className="text-xs text-slate-500">Pago em {formatDateTime(item.pago_em)}</span> : null}
                            </div>
                            <div className="grid gap-1">
                                <Badge variant="outline" className="w-fit border-white/10 text-slate-300">
                                    {item.competencia_status ? item.competencia_status.replaceAll("_", " ") : "pendente"}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                    {item.participou_assembleia === true
                                        ? "Participou da assembleia"
                                        : item.participou_assembleia === false
                                          ? "Sem assembleia"
                                          : "Assembleia nao aplicada"}
                                </span>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-sm text-white">
                                    {item.lancamentos_pagos ? `${item.lancamentos_pagos} pagos` : item.lancamentos_disponiveis ? `${item.lancamentos_disponiveis} disponiveis` : `${item.lancamentos_previstos || 0} previstos`}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {item.repasses_pendentes ? `${item.repasses_pendentes} repasses pendentes` : `${item.lancamentos_total || 0} lancamentos`}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    className="h-9 rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                                    disabled={busy || item.status === "pago" || item.status === "cancelado"}
                                    onClick={() => onStatusChange(item, "pago")}
                                >
                                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                    Pago
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-9 rounded-xl border-amber-400/30 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20"
                                    disabled={busy || item.status === "cancelado"}
                                    onClick={() => onStatusChange(item, "inadimplente")}
                                >
                                    <AlertCircle className="mr-1 h-3.5 w-3.5" />
                                    Inadimplente
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-9 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                                    disabled={busy || item.status === "pago" || item.status === "cancelado"}
                                    onClick={() => onSkip(item)}
                                >
                                    <CornerDownRight className="mr-1 h-3.5 w-3.5" />
                                    Pular
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-9 rounded-xl border-rose-500/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                                    disabled={busy || item.status === "cancelado"}
                                    onClick={() => onCancelFuture(item)}
                                >
                                    <CircleSlash className="mr-1 h-3.5 w-3.5" />
                                    Cancelar futuros
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function labelStatus(value?: string | null) {
    if (!value) return "nao informado";
    return value.replaceAll("_", " ");
}

function statusBadgeClass(status?: string | null) {
    switch (status) {
        case "pago":
            return "w-fit border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
        case "inadimplente":
            return "w-fit border-amber-500/20 bg-amber-500/10 text-amber-100";
        case "cancelado":
            return "w-fit border-rose-500/20 bg-rose-500/10 text-rose-100";
        default:
            return "w-fit border-sky-500/20 bg-sky-500/10 text-sky-100";
    }
}

function formatMoney(value?: string | number | null) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(Number(value || 0));
}

function formatMonth(value?: string | null) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(new Date(value));
}

function formatDate(value?: string | null) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function formatDateTime(value?: string | null) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}
