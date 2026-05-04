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
import type { LeadCard, ContractStatus } from "@/app/app/leads/types";
import { buildMetaAdsCompactLines } from "@/app/app/leads/meta-ads";

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
                             }: {
    lead: LeadCard;
    onDragStart: (e: React.DragEvent, l: LeadCard) => void;
}) {
    const router = useRouter();
    const ready = lead.readiness_score ?? null;
    const [isUpdatingContract, setIsUpdatingContract] = React.useState(false);
    const nextAction = nextContractAction(lead.contract_status);
    const metaAdsLines = buildMetaAdsCompactLines(lead);

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead)}
            className="
                relative
                group cursor-grab active:cursor-grabbing
                rounded-xl border border-white/10 bg-white/10
                p-3 md:p-3 shadow-sm
                hover:bg-white/15 hover:border-white/20
                transition overflow-hidden
            "
        >
            <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0">
                    <p className="font-medium leading-tight truncate">
                        {lead.nome ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {lead.telefone ? formatPhoneBR(lead.telefone) : lead.email ?? "—"}
                    </p>

                    {metaAdsLines.originLine ? (
                        <p className="mt-1 text-[11px] text-emerald-200/90 truncate">
                            {metaAdsLines.originLine}
                        </p>
                    ) : null}

                    {metaAdsLines.creativeLine ? (
                        <p className="mt-1 text-[11px] font-medium text-emerald-100 truncate">
                            {metaAdsLines.creativeLine}
                        </p>
                    ) : null}

                    {metaAdsLines.summaryLine ? (
                        <p className="mt-1 text-[11px] text-slate-300/90 line-clamp-2">
                            {metaAdsLines.summaryLine}
                        </p>
                    ) : null}

                    {lead.etapa === "contrato" && (
                        <div className="mt-2 space-y-1">
                            <span
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] ${contractStatusClass(
                                    lead.contract_status
                                )}`}
                            >
                                {contractStatusLabel(lead.contract_status)}
                            </span>

                            <div className="text-[11px] text-slate-400 space-y-0.5">
                                {lead.administradora_nome && (
                                    <p className="truncate">{lead.administradora_nome}</p>
                                )}

                                {(lead.grupo_codigo || lead.cota_numero) && (
                                    <p className="truncate">
                                        {lead.grupo_codigo ?? "—"}
                                        {lead.cota_numero ? ` • Cota ${lead.cota_numero}` : ""}
                                    </p>
                                )}

                                {lead.valor_carta && (
                                    <p className="truncate">Carta R$ {lead.valor_carta}</p>
                                )}
                            </div>

                            {lead.contract_id && nextAction && (
                                <div className="mt-2">
                                    <button
                                        type="button"
                                        disabled={isUpdatingContract}
                                        onClick={async () => {
                                            try {
                                                setIsUpdatingContract(true);
                                                await updateContractStatus(lead.contract_id!, nextAction.next);
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
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-1">
                    {ready != null && (
                        <span className="ml-2 shrink-0 rounded-full bg-emerald-600/20 px-2 py-0.5 text-[10px] text-emerald-300">
                            Ready <span className="font-semibold">{ready}%</span>
                        </span>
                    )}

                    {lead.etapa === "proposta" && (
                        <button
                            type="button"
                            onClick={() => router.push(`/app/leads/${lead.id}/propostas/nova`)}
                            className="
                                inline-flex items-center justify-center
                                rounded-full border border-emerald-500/40
                                bg-emerald-600/15 text-emerald-200
                                hover:bg-emerald-500/25 hover:text-emerald-100
                                transition px-2 py-1
                            "
                            title="Criar nova proposta"
                        >
                            <FileSignature className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
                <Link
                    href={`/app/leads/${lead.id}`}
                    className="text-[11px] text-emerald-300 hover:text-emerald-100 underline-offset-2 hover:underline"
                >
                    Ver lead
                </Link>

                <div className="flex items-center gap-2">
                    <DiagnosticSheet leadId={lead.id} leadName={lead.nome} />

                    {lead.interest && (
                        <InterestDetailsDialog
                            interest={lead.interest}
                            insight={lead.interest_insight}
                            phone={lead.telefone ?? null}
                            leadId={lead.id}
                        />
                    )}
                </div>
            </div>

            <InterestSummaryRow lead={lead} />

            <div className="mt-2">
                <DeleteLeadButton leadId={lead.id} leadName={lead.nome} />
            </div>
        </div>
    );
}
