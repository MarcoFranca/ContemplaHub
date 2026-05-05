"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileSignature, Loader2 } from "lucide-react";

import { formatPhoneBR } from "@/lib/formatters";
import { InterestSummaryRow } from "./InterestSummaryRow";
import { InterestDetailsDialog } from "./InterestDetailsDialog";
import { DiagnosticSheet } from "@/app/app/leads/ui/DiagnosticSheet";
import { DeleteLeadButton } from "@/app/app/leads/ui/DeleteLeadButton";
import { updateContractStatus } from "@/app/app/leads/actions";
import type { LeadCard, ContractStatus, Stage } from "@/app/app/leads/types";
import {
    buildMetaAdsCompactLines,
    getMetaAdsCompactDiagnostics,
} from "@/app/app/leads/meta-ads";

function contractStatusLabel(status?: ContractStatus | null) {
    switch (status) {
        case "pendente_assinatura":
            return "Pendente assinatura";
        case "pendente_pagamento":
            return "Pendente pagamento";
        case "alocado":
            return "Alocado";
        case "contemplado":
            return "Contemplado";
        case "cancelado":
            return "Cancelado";
        default:
            return "Em contrato";
    }
}

function contractStatusClass(status?: ContractStatus | null) {
    switch (status) {
        case "pendente_assinatura":
            return "bg-amber-500/15 text-amber-200 border-amber-500/30";
        case "pendente_pagamento":
            return "bg-orange-500/15 text-orange-200 border-orange-500/30";
        case "alocado":
            return "bg-sky-500/15 text-sky-200 border-sky-500/30";
        case "contemplado":
            return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";
        case "cancelado":
            return "bg-red-500/15 text-red-200 border-red-500/30";
        default:
            return "bg-white/10 text-slate-200 border-white/10";
    }
}

function nextContractAction(status?: ContractStatus | null): {
    label: string;
    next: ContractStatus;
} | null {
    switch (status) {
        case "pendente_assinatura":
            return { label: "Assinou", next: "pendente_pagamento" };
        case "pendente_pagamento":
            return { label: "Pagamento ok", next: "alocado" };
        case "alocado":
            return { label: "Contemplado", next: "contemplado" };
        default:
            return null;
    }
}

export function LeadCardItem({
    lead,
    onDragStart,
    onQuickMove,
}: {
    lead: LeadCard;
    onDragStart: (e: React.DragEvent, l: LeadCard) => void;
    onQuickMove?: (lead: LeadCard, to: Stage, reason?: string) => Promise<void>;
}) {
    const router = useRouter();
    const ready = lead.readiness_score ?? null;
    const [isUpdatingContract, setIsUpdatingContract] = React.useState(false);
    const [quickMoveTo, setQuickMoveTo] = React.useState<Stage | null>(null);
    const nextAction = nextContractAction(lead.contract_status);
    const metaAdsLines = buildMetaAdsCompactLines(lead);
    const metaAdsDiagnostics = getMetaAdsCompactDiagnostics(lead);
    const canShowQuickMoves =
        lead.etapa !== "frio" &&
        lead.etapa !== "perdido" &&
        lead.etapa !== "pos_venda";
    const diagnosticChips = [
        metaAdsDiagnostics.objetivoLabel,
        metaAdsDiagnostics.investimentoLabel,
        metaAdsDiagnostics.rendaLabel,
    ]
        .filter((value): value is string => Boolean(value))
        .slice(0, 3);

    async function handleQuickMove(to: Stage, reason: string) {
        if (!onQuickMove || lead.etapa === to) return;
        try {
            setQuickMoveTo(to);
            await onQuickMove(lead, to, reason);
        } catch (error) {
            console.error(error);
        } finally {
            setQuickMoveTo(null);
        }
    }

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead)}
            className="
                relative min-w-0
                rounded-xl border border-white/10 bg-white/10
                p-4 shadow-sm transition overflow-hidden
                group cursor-grab active:cursor-grabbing
                hover:bg-white/15 hover:border-white/20
            "
        >
            <div className="flex min-w-0 flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 break-words font-medium leading-tight">
                            {lead.nome ?? "—"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground truncate">
                            {lead.telefone ? formatPhoneBR(lead.telefone) : lead.email ?? "—"}
                        </p>

                        {(metaAdsLines.originLine || metaAdsLines.creativeLine) ? (
                            <div className="mt-2 rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-2.5 py-2">
                                {metaAdsLines.originLine ? (
                                    <p className="truncate text-[11px] text-emerald-200/90">
                                        {metaAdsLines.originLine}
                                    </p>
                                ) : null}

                                {metaAdsLines.creativeLine ? (
                                    <p className="mt-1 line-clamp-2 break-words text-[11px] font-medium text-emerald-100">
                                        {metaAdsLines.creativeLine}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}

                        {diagnosticChips.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {diagnosticChips.map((chip) => (
                                    <span
                                        key={chip}
                                        title={chip}
                                        className="inline-flex max-w-full rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-200"
                                    >
                                        <span className="truncate">{chip}</span>
                                    </span>
                                ))}
                            </div>
                        ) : metaAdsLines.summaryLine ? (
                            <p className="mt-2 line-clamp-2 break-words text-[11px] text-slate-300/90">
                                {metaAdsLines.summaryLine}
                            </p>
                        ) : null}

                        {(lead.etapa === "contrato" || lead.etapa === "pos_venda") ? (
                            <div className="mt-2 space-y-1">
                                <span
                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] ${contractStatusClass(
                                        lead.contract_status
                                    )}`}
                                >
                                    {contractStatusLabel(lead.contract_status)}
                                </span>

                                <div className="space-y-0.5 text-[11px] text-slate-400">
                                    {lead.administradora_nome ? (
                                        <p className="truncate">{lead.administradora_nome}</p>
                                    ) : null}

                                    {(lead.grupo_codigo || lead.cota_numero) ? (
                                        <p className="truncate">
                                            {lead.grupo_codigo ?? "—"}
                                            {lead.cota_numero ? ` • Cota ${lead.cota_numero}` : ""}
                                        </p>
                                    ) : null}

                                    {lead.valor_carta ? (
                                        <p className="truncate">Carta R$ {lead.valor_carta}</p>
                                    ) : null}
                                </div>

                                {lead.contract_id && nextAction ? (
                                    <div className="mt-2">
                                        <button
                                            type="button"
                                            disabled={isUpdatingContract}
                                            onClick={async () => {
                                                try {
                                                    setIsUpdatingContract(true);
                                                    await updateContractStatus(
                                                        lead.contract_id!,
                                                        nextAction.next
                                                    );
                                                    router.refresh();
                                                } catch (error) {
                                                    console.error(error);
                                                } finally {
                                                    setIsUpdatingContract(false);
                                                }
                                            }}
                                            className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60"
                                        >
                                            {isUpdatingContract ? (
                                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                            ) : null}
                                            {nextAction.label}
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                        {ready != null ? (
                            <span className="shrink-0 rounded-full bg-emerald-600/20 px-2 py-0.5 text-[10px] text-emerald-300">
                                Ready <span className="font-semibold">{ready}%</span>
                            </span>
                        ) : null}

                        {lead.etapa === "proposta" ? (
                            <button
                                type="button"
                                onClick={() => router.push(`/app/leads/${lead.id}/propostas/nova`)}
                                className="
                                    inline-flex items-center justify-center
                                    rounded-full border border-emerald-500/40
                                    bg-emerald-600/15 px-2 py-1 text-emerald-200
                                    transition hover:bg-emerald-500/25 hover:text-emerald-100
                                "
                                title="Criar nova proposta"
                            >
                                <FileSignature className="h-3.5 w-3.5" />
                            </button>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href={`/app/leads/${lead.id}`}
                        className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/15 hover:text-emerald-100"
                    >
                        Ver lead
                    </Link>

                    {canShowQuickMoves ? (
                        <>
                            {lead.etapa !== "contato_realizado" ? (
                                <button
                                    type="button"
                                    disabled={quickMoveTo != null}
                                    onClick={() =>
                                        handleQuickMove(
                                            "contato_realizado",
                                            "Contato realizado pelo Kanban."
                                        )
                                    }
                                    className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60"
                                >
                                    {quickMoveTo === "contato_realizado" ? "Movendo..." : "Contatado"}
                                </button>
                            ) : null}

                            {lead.etapa !== "frio" ? (
                                <button
                                    type="button"
                                    disabled={quickMoveTo != null}
                                    onClick={() =>
                                        handleQuickMove(
                                            "frio",
                                            "Lead marcado como sem resposta no Kanban."
                                        )
                                    }
                                    className="rounded-full border border-slate-400/30 bg-slate-500/10 px-2.5 py-1 text-[10px] text-slate-200 hover:bg-slate-500/20 disabled:opacity-60"
                                >
                                    {quickMoveTo === "frio" ? "Movendo..." : "Sem resposta"}
                                </button>
                            ) : null}

                            {lead.etapa !== "perdido" ? (
                                <button
                                    type="button"
                                    disabled={quickMoveTo != null}
                                    onClick={() =>
                                        handleQuickMove(
                                            "perdido",
                                            "Lead marcado como perdido no Kanban."
                                        )
                                    }
                                    className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                                >
                                    {quickMoveTo === "perdido" ? "Movendo..." : "Perdido"}
                                </button>
                            ) : null}
                        </>
                    ) : null}

                    <DiagnosticSheet leadId={lead.id} leadName={lead.nome} />

                    {lead.interest ? (
                        <InterestDetailsDialog
                            interest={lead.interest}
                            insight={lead.interest_insight}
                            phone={lead.telefone ?? null}
                            leadId={lead.id}
                        />
                    ) : null}
                </div>

                <InterestSummaryRow lead={lead} />

                <div>
                    <DeleteLeadButton leadId={lead.id} leadName={lead.nome} />
                </div>
            </div>
        </div>
    );
}
