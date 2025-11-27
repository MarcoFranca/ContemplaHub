// src/app/app/leads/KanbanBoard/LeadCardItem.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";           // ✅ aqui!
import { FileSignature } from "lucide-react";

import { formatPhoneBR } from "@/lib/formatters";
import { InterestSummaryRow } from "./InterestSummaryRow";
import { InterestDetailsDialog } from "./InterestDetailsDialog";
import { DiagnosticSheet } from "@/app/app/leads/ui/DiagnosticSheet";
import { DeleteLeadButton } from "@/app/app/leads/ui/DeleteLeadButton";

import type { LeadCard } from "@/app/app/leads/types";

export function LeadCardItem({
                                 lead,
                                 onDragStart,
                             }: {
    lead: LeadCard;
    onDragStart: (e: React.DragEvent, l: LeadCard) => void;
}) {
    const router = useRouter();                     // ✅ instância do router
    const ready = lead.readiness_score ?? null;

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead)}
            className="
        relative                                     /* ✅ pra suportar absolute interno */
        group cursor-grab active:cursor-grabbing
        rounded-xl border border-white/10 bg-white/10
        p-3 md:p-3 shadow-sm
        hover:bg-white/15 hover:border-white/20
        transition overflow-hidden
      "
        >
            {/* topo: nome + ready + botão de proposta */}
            <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0">
                    <p className="font-medium leading-tight truncate">
                        {lead.nome ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {lead.telefone ? formatPhoneBR(lead.telefone) : lead.email ?? "—"} •{" "}
                        {lead.origem ?? lead.utm_source ?? "site"}
                    </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                    {ready != null && (
                        <span className="ml-2 shrink-0 rounded-full bg-emerald-600/20 px-2 py-0.5 text-[10px] text-emerald-300">
              Ready <span className="font-semibold">{ready}%</span>
            </span>
                    )}

                    {/* ✅ botão aparece só na coluna "proposta" */}
                    {lead.etapa === "proposta" && (
                        <button
                            type="button"
                            onClick={() =>
                                router.push(`/app/leads/${lead.id}/propostas/nova`)
                            }
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

            {/* linha com link e ações rápidas */}
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

            {/* resumo do interesse */}
            <InterestSummaryRow lead={lead} />

            {/* botão de excluir lead (fica sempre no rodapé do card) */}
            <div className="mt-2">
                <DeleteLeadButton leadId={lead.id} leadName={lead.nome} />
            </div>
        </div>
    );
}
