"use client";

import { Users, Clock, CheckCircle2 } from "lucide-react";
import { RepasseDialog } from "./RepasseDialog";
import { RepasseStatusBadge } from "./status-badges";
import type { ComissaoLancamento } from "../types";

type Props = {
  items: ComissaoLancamento[];
  refreshPath: string;
};

const EVENTO_LABELS: Record<string, string> = {
  adesao: "Adesão",
  primeira_cobranca_valida: "1ª Cobrança",
  proxima_cobranca: "Próx. Cobrança",
  contemplacao: "Contemplação",
  manual: "Manual",
};

export function RepassesGestao({ items, refreshPath }: Props) {
  const money = (v: number | string | null | undefined) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

  const parcItems = items.filter((i) => i.beneficiario_tipo === "parceiro");

  // Group by parceiro, sorted by pending value desc
  const grouped: Record<string, { nome: string; items: ComissaoLancamento[] }> = {};
  parcItems.forEach((item) => {
    const pid = item.parceiro_id ?? "unknown";
    if (!grouped[pid]) {
      grouped[pid] = { nome: item.parceiros_corretores?.nome ?? "Parceiro", items: [] };
    }
    grouped[pid].items.push(item);
  });

  const parceiros = Object.entries(grouped).sort(([, a], [, b]) => {
    const pendA = a.items
      .filter((i) => i.repasse_status === "pendente")
      .reduce((s, i) => s + Number(i.valor_liquido || 0), 0);
    const pendB = b.items
      .filter((i) => i.repasse_status === "pendente")
      .reduce((s, i) => s + Number(i.valor_liquido || 0), 0);
    return pendB - pendA;
  });

  const totPendente = parcItems
    .filter((i) => i.repasse_status === "pendente")
    .reduce((s, i) => s + Number(i.valor_liquido || 0), 0);
  const totPago = parcItems
    .filter((i) => i.repasse_status === "pago")
    .reduce((s, i) => s + Number(i.valor_liquido || 0), 0);
  const countPendente = parcItems.filter((i) => i.repasse_status === "pendente").length;
  const countPago = parcItems.filter((i) => i.repasse_status === "pago").length;

  return (
    <div className="space-y-5 p-6">
      {/* ── Summary bar ── */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/40 bg-card/20 p-5">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Parceiros Ativos</span>
          </div>
          <div className="text-3xl font-bold">{parceiros.length}</div>
          <div className="mt-1 text-xs text-muted-foreground">com lançamentos no período</div>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="mb-2 flex items-center gap-2 text-amber-400">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Pendente de Repasse</span>
          </div>
          <div className="text-3xl font-bold text-amber-300">{money(totPendente)}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {countPendente} lançamento{countPendente !== 1 ? "s" : ""} aguardando
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="mb-2 flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Repasses Pagos</span>
          </div>
          <div className="text-3xl font-bold text-emerald-300">{money(totPago)}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {countPago} lançamento{countPago !== 1 ? "s" : ""} liquidados
          </div>
        </div>
      </div>

      {/* ── Per-partner accordion ── */}
      {parceiros.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 py-16">
          <Users className="mb-3 h-10 w-10 text-muted-foreground/25" />
          <p className="text-sm text-muted-foreground">Nenhum repasse a parceiros no período atual.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {parceiros.map(([pid, { nome, items: pItems }]) => {
            const pendentes = pItems.filter((i) => i.repasse_status === "pendente");
            const pagos = pItems.filter((i) => i.repasse_status === "pago");
            const totalBruto = pItems.reduce((s, i) => s + Number(i.valor_bruto || 0), 0);
            const totalLiq = pItems.reduce((s, i) => s + Number(i.valor_liquido || 0), 0);
            const totalPend = pendentes.reduce((s, i) => s + Number(i.valor_liquido || 0), 0);

            return (
              <div
                key={pid}
                className="overflow-hidden rounded-2xl border border-border/35 bg-card/15"
              >
                {/* Partner header */}
                <div className="flex items-center justify-between border-b border-border/25 bg-card/25 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold">{nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {pItems.length} lançamento{pItems.length !== 1 ? "s" : ""} ·{" "}
                        {pendentes.length > 0 ? (
                          <span className="text-amber-400">{pendentes.length} pendente{pendentes.length !== 1 ? "s" : ""}</span>
                        ) : (
                          <span className="text-emerald-400">em dia</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Bruto</div>
                      <div className="text-sm font-semibold">{money(totalBruto)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Líquido</div>
                      <div className="text-sm font-semibold text-emerald-300">{money(totalLiq)}</div>
                    </div>
                    {totalPend > 0 && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-right">
                        <div className="text-xs text-amber-400/80">Pendente</div>
                        <div className="text-sm font-bold text-amber-300">{money(totalPend)}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Launch rows */}
                <div className="divide-y divide-border/20">
                  {pItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-white/2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {EVENTO_LABELS[item.tipo_evento] ?? item.tipo_evento}
                          </span>
                          <span className="text-xs text-muted-foreground">· Parcela {item.ordem}</span>
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Competência:{" "}
                          {item.competencia_prevista
                            ? new Date(item.competencia_prevista).toLocaleDateString("pt-BR", {
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                          {item.repasse_previsto_em && (
                            <>
                              {" · "}Previsto em{" "}
                              {new Date(item.repasse_previsto_em).toLocaleDateString("pt-BR")}
                            </>
                          )}
                          {item.repasse_pago_em && (
                            <>
                              {" · "}Pago em{" "}
                              {new Date(item.repasse_pago_em).toLocaleDateString("pt-BR")}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{money(item.valor_liquido)}</div>
                        <div className="text-xs text-muted-foreground">líquido</div>
                      </div>
                      <RepasseStatusBadge status={item.repasse_status} />
                      <RepasseDialog lancamento={item} refreshPath={refreshPath} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
