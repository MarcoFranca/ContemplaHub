"use client";

import * as React from "react";
import { InterestSummaryRow } from "./InterestSummaryRow";
import { InterestDetailsDialog } from "./InterestDetailsDialog";

export type Stage =
    | "novo"
    | "diagnostico"
    | "proposta"
    | "negociacao"
    | "fechamento"
    | "ativo"
    | "perdido";

export type Lead = {
    id: string;
    nome: string | null;
    etapa: Stage;
    telefone?: string | null;
    email?: string | null;
    origem?: string | null;
    utm_source?: string | null;
    valor_interesse?: string | null;
    prazo_meses?: number | null;
    interest?: {
        produto?: string | null;
        valorTotal?: string | null;
        prazoMeses?: number | null;
        objetivo?: string | null;
        perfilDesejado?: string | null;
        observacao?: string | null;
    } | null;
};

export function LeadCardItem({
                                 lead,
                                 onDragStart,
                             }: {
    lead: Lead;
    onDragStart: (e: React.DragEvent, l: Lead) => void;
}) {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead)}
            className="group rounded-xl border border-white/10 bg-white/10 p-3 md:p-3 cursor-grab active:cursor-grabbing shadow-sm hover:bg-white/15 hover:border-white/20 transition overflow-hidden"
        >
            <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0">
                    <p className="font-medium leading-tight truncate">{lead.nome ?? "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {(lead.telefone ?? lead.email ?? "—")} • {(lead.origem ?? lead.utm_source ?? "site")}
                    </p>
                </div>

                {lead.interest ? <InterestDetailsDialog interest={lead.interest} /> : null}
            </div>

            <InterestSummaryRow lead={lead as any} />
        </div>
    );
}
