// src/app/app/leads/[leadId]/LeadHeader.tsx
import Link from "next/link";
import {
    ArrowLeft,
    BadgeInfo,
    Gauge,
    Mail,
    Phone,
    Target,
    UserRound,
} from "lucide-react";
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
        <header className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/app/leads"
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Voltar para leads
                        </Link>

                        <Badge variant="outline" className="text-[11px] uppercase tracking-wide">
                            Detalhes do lead
                        </Badge>
                    </div>

                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-900/30">
              <span className="text-sm font-semibold text-emerald-200">
                {initial}
              </span>
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">
                                <UserRound className="h-3.5 w-3.5" />
                                Lead / cliente
                            </div>

                            <h1 className="mt-1 truncate text-xl font-semibold md:text-2xl">
                                {lead.nome ?? "Cliente sem nome"}
                            </h1>

                            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:flex-wrap md:items-center md:gap-x-4 md:gap-y-2">
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-300" />
                    {lead.telefone ?? "Sem telefone"}
                </span>

                                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-300" />
                                    {lead.email ?? "Sem email"}
                </span>

                                <span className="inline-flex items-center gap-2">
                  <BadgeInfo className="h-4 w-4 text-emerald-300" />
                  Origem: {lead.origem ?? "—"}
                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-emerald-300">
                            <Gauge className="h-3.5 w-3.5" />
                            Readiness
                        </div>
                        <div className="mt-1 text-lg font-semibold text-emerald-100">
                            {readiness != null ? `${readiness}%` : "—"}
                        </div>
                        <p className="mt-1 text-[11px] text-emerald-50/70">
                            Prontidão atual para avanço comercial.
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Target className="h-3.5 w-3.5 text-emerald-300" />
                            Valor de interesse
                        </div>
                        <div className="mt-1 text-lg font-semibold text-foreground">
                            {formatCurrencyBRL(valorInteresse)}
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Ticket principal informado no lead.
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}