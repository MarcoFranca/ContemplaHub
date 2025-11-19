"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatPhoneBR } from "@/lib/formatters";
import { InterestSummaryRow } from "./InterestSummaryRow";
import { InterestDetailsDialog } from "./InterestDetailsDialog";
import { DiagnosticPanel } from "@/app/app/leads/ui/DiagnosticPanel";
import { Button } from "@/components/ui/button";

// 👇 importa os tipos centrais
import type { LeadCard } from "@/app/app/leads/types";

export function LeadCardItem({
                                 lead,
                                 onDragStart,
                             }: {
    lead: LeadCard;
    onDragStart: (e: React.DragEvent, l: LeadCard) => void;
}) {
    const ready = lead.readiness_score ?? null;

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead)}
            className="group cursor-grab active:cursor-grabbing rounded-xl border border-white/10 bg-white/10 p-3 md:p-3 shadow-sm hover:bg-white/15 hover:border-white/20 transition overflow-hidden"
        >
            {/* topo: nome + ready */}
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

                {ready != null && (
                    <span className="ml-2 shrink-0 rounded-full bg-emerald-600/20 px-2 py-0.5 text-[10px] text-emerald-300">
            Ready <span className="font-semibold">{ready}%</span>
          </span>
                )}
            </div>

            {/* ações: diagnóstico + interesse */}
            <div className="mt-2 flex items-center justify-end gap-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="h-6 px-2 text-[11px] text-emerald-100 hover:bg-emerald-500/10 hover:text-emerald-50"
                        >
                            Diagnóstico
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Diagnóstico do lead {lead.nome ?? ""}</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 pb-2">
                            <DiagnosticPanel leadId={lead.id} />
                        </div>
                    </DialogContent>
                </Dialog>

                {lead.interest && (
                    <InterestDetailsDialog
                        interest={lead.interest}
                        insight={lead.interest_insight}
                        phone={lead.telefone ?? null}
                    />
                )}
            </div>

            {/* linhas de interesse */}
            <InterestSummaryRow lead={lead} />
        </div>
    );
}
