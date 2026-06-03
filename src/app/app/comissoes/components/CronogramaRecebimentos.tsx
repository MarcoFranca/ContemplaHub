"use client";

import { CalendarDays, CheckCircle2, Clock, TrendingUp, XCircle } from "lucide-react";
import type { ComissaoLancamento } from "../types";

type Props = { items: ComissaoLancamento[] };

const EVENTO_LABELS: Record<string, string> = {
  adesao: "Adesão",
  primeira_cobranca_valida: "1ª Cobrança",
  proxima_cobranca: "Próx. Cobrança",
  contemplacao: "Contemplação",
  manual: "Manual",
};

export function CronogramaRecebimentos({ items }: Props) {
  const money = (v: number | string | null | undefined) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

  // Group by year-month
  const grouped: Record<string, ComissaoLancamento[]> = {};
  items.forEach((item) => {
    const key = item.competencia_prevista ? item.competencia_prevista.slice(0, 7) : "sem-data";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const sorted = Object.entries(grouped).sort(([a], [b]) => {
    if (a === "sem-data") return 1;
    if (b === "sem-data") return -1;
    return a.localeCompare(b);
  });

  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground/25" />
        <p className="text-sm text-muted-foreground">Nenhum lançamento com competência definida.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-semibold">Cronograma de Recebimentos</span>
        <span className="text-xs text-muted-foreground">— Projeção mensal de comissões por competência</span>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute bottom-0 left-[10px] top-0 w-px bg-border/35" />

        <div className="space-y-5">
          {sorted.map(([monthKey, monthItems]) => {
            const pago = monthItems.filter((i) => i.status === "pago");
            const disponivel = monthItems.filter((i) => i.status === "disponivel");
            const previsto = monthItems.filter((i) => i.status === "previsto");
            const cancelado = monthItems.filter((i) => i.status === "cancelado");

            const totalBruto = monthItems.reduce((s, i) => s + Number(i.valor_bruto || 0), 0);
            const totalPago = pago.reduce((s, i) => s + Number(i.valor_bruto || 0), 0);
            const pct = totalBruto > 0 ? (totalPago / totalBruto) * 100 : 0;

            const isPresent = monthKey === currentYM;
            const isPast = monthKey < currentYM && monthKey !== "sem-data";
            const isFuture = monthKey > currentYM;

            const dominant =
              pago.length > 0 && pago.length === monthItems.length
                ? "pago"
                : disponivel.length > 0
                ? "disponivel"
                : previsto.length > 0
                ? "previsto"
                : "cancelado";

            const dotStyles = {
              pago: "bg-emerald-500 ring-4 ring-emerald-500/20",
              disponivel: "bg-amber-500 ring-4 ring-amber-500/20",
              previsto: "bg-slate-500 ring-4 ring-slate-500/20",
              cancelado: "bg-rose-500 ring-4 ring-rose-500/20",
            }[dominant];

            const monthLabel =
              monthKey === "sem-data"
                ? "Sem data definida"
                : new Date(monthKey + "-15").toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  });

            return (
              <div key={monthKey} className="relative flex gap-5 pl-0">
                {/* Timeline dot */}
                <div
                  className={`
                    relative z-10 mt-4 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full
                    ${dotStyles}
                    ${isPresent ? "scale-125" : ""}
                  `}
                >
                  <div className="h-2 w-2 rounded-full bg-background" />
                </div>

                {/* Month card */}
                <div
                  className={`
                    mb-1 flex-1 overflow-hidden rounded-2xl border transition-colors
                    ${isPresent ? "border-emerald-500/30 bg-emerald-500/3" : "border-border/35 bg-card/15"}
                  `}
                >
                  {/* Month header */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold capitalize">{monthLabel}</span>
                        {isPresent && (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                            Atual
                          </span>
                        )}
                        {isPast && pct < 100 && totalBruto > 0 && (
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                            Incompleto
                          </span>
                        )}
                        {isFuture && (
                          <span className="rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Futuro
                          </span>
                        )}
                      </div>

                      {/* Status mini-badges */}
                      <div className="mt-1 flex items-center gap-3 text-xs">
                        {pago.length > 0 && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            {pago.length} pago
                          </span>
                        )}
                        {disponivel.length > 0 && (
                          <span className="flex items-center gap-1 text-amber-400">
                            <TrendingUp className="h-3 w-3" />
                            {disponivel.length} disponível
                          </span>
                        )}
                        {previsto.length > 0 && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {previsto.length} previsto
                          </span>
                        )}
                        {cancelado.length > 0 && (
                          <span className="flex items-center gap-1 text-rose-400">
                            <XCircle className="h-3 w-3" />
                            {cancelado.length} cancelado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground">{money(totalBruto)}</div>
                      <div className="text-xs text-muted-foreground">total bruto</div>
                      {totalPago > 0 && (
                        <div className="mt-0.5 text-xs text-emerald-400">{money(totalPago)} recebido</div>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {pct > 0 && (
                    <div className="h-1 w-full bg-white/5">
                      <div
                        className="h-full bg-emerald-500/55 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}

                  {/* Item rows */}
                  <div className="divide-y divide-border/15">
                    {monthItems.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 px-5 py-2.5">
                        <StatusDot status={item.status} />
                        <div className="flex-1 text-xs">
                          <span className="font-medium text-foreground">
                            {item.beneficiario_tipo === "empresa"
                              ? "Empresa"
                              : (item.parceiros_corretores?.nome ?? "Parceiro")}
                          </span>
                          <span className="ml-1.5 text-muted-foreground">
                            {EVENTO_LABELS[item.tipo_evento] ?? item.tipo_evento}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-foreground">
                          {money(item.valor_bruto)}
                        </div>
                      </div>
                    ))}
                    {monthItems.length > 4 && (
                      <div className="px-5 py-2 text-center text-xs text-muted-foreground">
                        +{monthItems.length - 4} lançamento{monthItems.length - 4 !== 1 ? "s" : ""} neste mês
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    previsto: "bg-slate-400",
    disponivel: "bg-amber-400",
    pago: "bg-emerald-400",
    cancelado: "bg-rose-400",
  };
  return <div className={`h-2 w-2 flex-shrink-0 rounded-full ${colors[status] ?? "bg-slate-400"}`} />;
}
