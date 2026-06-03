"use client";

import Link from "next/link";
import { Clock, TrendingUp, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import type { ComissaoLancamento } from "../types";
import { RepasseStatusBadge } from "./status-badges";
import { LancamentoStatusDialog } from "./LancamentoStatusDialog";
import { RepasseDialog } from "./RepasseDialog";

type Props = {
  items: ComissaoLancamento[];
  refreshPath: string;
};

const COLUMNS = [
  {
    key: "previsto" as const,
    label: "Previsto",
    desc: "Aguardando evento disparador",
    icon: Clock,
    dot: "bg-slate-400",
    header: "border-slate-500/25 bg-slate-500/8",
    text: "text-slate-300",
    empty: "text-slate-500/30",
  },
  {
    key: "disponivel" as const,
    label: "Disponível",
    desc: "Liberado, pronto para pagamento",
    icon: TrendingUp,
    dot: "bg-amber-400",
    header: "border-amber-500/25 bg-amber-500/8",
    text: "text-amber-300",
    empty: "text-amber-500/30",
  },
  {
    key: "pago" as const,
    label: "Pago",
    desc: "Comissão recebida",
    icon: CheckCircle2,
    dot: "bg-emerald-400",
    header: "border-emerald-500/25 bg-emerald-500/8",
    text: "text-emerald-300",
    empty: "text-emerald-500/30",
  },
  {
    key: "cancelado" as const,
    label: "Cancelado",
    desc: "Lançamento cancelado",
    icon: XCircle,
    dot: "bg-rose-400",
    header: "border-rose-500/25 bg-rose-500/8",
    text: "text-rose-300",
    empty: "text-rose-500/30",
  },
];

const EVENTO_LABELS: Record<string, string> = {
  adesao: "Adesão",
  primeira_cobranca_valida: "1ª Cobrança",
  proxima_cobranca: "Próx. Cobrança",
  contemplacao: "Contemplação",
  manual: "Manual",
};

export function PipelineFinanceiro({ items, refreshPath }: Props) {
  const money = (v: number | string | null | undefined) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

  return (
    <div className="flex h-full gap-4 overflow-x-auto p-6">
      {COLUMNS.map(({ key, label, desc, icon: Icon, dot, header, text, empty }) => {
        const colItems = items.filter((i) => i.status === key);
        const total = colItems.reduce((s, i) => s + Number(i.valor_bruto || 0), 0);

        return (
          <div
            key={key}
            className="flex w-72 flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/15"
          >
            {/* Column header */}
            <div className={`border-b p-4 ${header}`}>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${dot}`} />
                <Icon className={`h-4 w-4 ${text}`} />
                <span className={`text-sm font-semibold ${text}`}>{label}</span>
                <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-foreground">
                  {colItems.length}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground/70">{desc}</div>
              <div className={`mt-2 text-lg font-bold ${text}`}>{money(total)}</div>
            </div>

            {/* Cards list */}
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {colItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/35 bg-card/35 p-3 transition-colors hover:bg-card/55"
                >
                  {/* Header row */}
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium leading-tight">
                        {item.beneficiario_tipo === "empresa"
                          ? "Empresa"
                          : (item.parceiros_corretores?.nome ?? "Parceiro")}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {EVENTO_LABELS[item.tipo_evento] ?? item.tipo_evento} · #{item.ordem}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm font-bold text-foreground">{money(item.valor_bruto)}</div>
                      {item.beneficiario_tipo === "parceiro" && (
                        <div className="text-xs text-muted-foreground">
                          liq. {money(item.valor_liquido)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Competência */}
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Competência</span>
                    <span className="font-medium text-foreground">
                      {item.competencia_prevista
                        ? new Date(item.competencia_prevista).toLocaleDateString("pt-BR", {
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>

                  {/* Repasse indicator */}
                  {item.beneficiario_tipo === "parceiro" && (
                    <div className="mb-2.5 flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Repasse:</span>
                      <RepasseStatusBadge status={item.repasse_status} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 border-t border-border/25 pt-2.5">
                    <Link href={`/app/contratos/${item.contrato_id}`} className="flex-1">
                      <button className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-border/40 py-1 text-xs transition-colors hover:bg-white/5">
                        <ExternalLink className="h-3 w-3" />
                        Contrato
                      </button>
                    </Link>
                    <LancamentoStatusDialog lancamento={item} refreshPath={refreshPath} />
                    {item.beneficiario_tipo === "parceiro" && (
                      <RepasseDialog lancamento={item} refreshPath={refreshPath} />
                    )}
                  </div>
                </div>
              ))}

              {colItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <Icon className={`mb-2 h-8 w-8 opacity-20 ${empty}`} />
                  <p className="text-xs text-muted-foreground">Nenhum lançamento nesta etapa.</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
