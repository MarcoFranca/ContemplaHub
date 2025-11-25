// src/app/app/leads/[leadId]/LeadHeader.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyBRL } from "./leadUtils";

type LeadRow = {
    id: string;
    nome: string | null;
    telefone: string | null;
    email: string | null;
    origem: string | null;
    valor_interesse: number | null;
    readiness_score?: number | null;
};

export function LeadHeader({ lead }: { lead: LeadRow }) {
    const readiness = lead.readiness_score ?? null;
    const valorInteresse = lead.valor_interesse ?? null;
    const initial =
        (lead.nome ?? "?").toString().trim().charAt(0).toUpperCase() || "?";

    return (
        <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
                <Link
                    href="/app/leads"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Voltar
                </Link>

                <div className="h-5 w-px bg-border" />

                <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500/40 to-emerald-800/50 flex items-center justify-center border border-emerald-500/30">
                        <span className="text-sm font-semibold text-emerald-200">
                            {initial}
                        </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-emerald-400">
                            Lead
                        </span>
                        <span className="text-lg md:text-xl font-semibold truncate">
                            {lead.nome ?? "Cliente sem nome"}
                        </span>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {lead.telefone && <span>{lead.telefone}</span>}
                            {lead.email && <span>• {lead.email}</span>}
                            {lead.origem && (
                                <span className="inline-flex items-center gap-1">
                                    •{" "}
                                    <span className="uppercase tracking-wide text-[10px]">
                                        Origem:
                                    </span>{" "}
                                    {lead.origem}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                {readiness != null && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                        <span className="text-[11px] uppercase tracking-[0.14em] text-emerald-300">
                            Readiness
                        </span>
                        <span className="text-sm font-semibold text-emerald-100">
                            {readiness}%
                        </span>
                    </div>
                )}

                <Badge variant="outline" className="text-[11px]">
                    Valor interesse: {formatCurrencyBRL(valorInteresse)}
                </Badge>
            </div>
        </header>
    );
}
