"use client";

import type { ReactNode } from "react";
import {
  TrendingUp,
  Wallet,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Building2,
} from "lucide-react";
import type { ComissaoLancamento, ComissaoResumo } from "../types";

type Props = {
  items: ComissaoLancamento[];
  resumo: ComissaoResumo | null;
};

const EVENTO_LABELS: Record<string, string> = {
  adesao: "Adesão",
  primeira_cobranca_valida: "1ª Cobrança",
  proxima_cobranca: "Próx. Cobrança",
  contemplacao: "Contemplação",
  manual: "Manual",
};

export function ExecutiveDashboard({ items, resumo }: Props) {
  const n = (v: string | number | null | undefined) => Number(v || 0);
  const money = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const byStatus = {
    previsto: items.filter((i) => i.status === "previsto"),
    disponivel: items.filter((i) => i.status === "disponivel"),
    pago: items.filter((i) => i.status === "pago"),
    cancelado: items.filter((i) => i.status === "cancelado"),
  };

  const totalByStatus = {
    previsto: byStatus.previsto.reduce((s, i) => s + n(i.valor_bruto), 0),
    disponivel: byStatus.disponivel.reduce((s, i) => s + n(i.valor_bruto), 0),
    pago: byStatus.pago.reduce((s, i) => s + n(i.valor_bruto), 0),
    cancelado: byStatus.cancelado.reduce((s, i) => s + n(i.valor_bruto), 0),
  };

  const totalGlobal = Object.values(totalByStatus).reduce((a, b) => a + b, 0);
  const pctExecutado = totalGlobal > 0 ? (totalByStatus.pago / totalGlobal) * 100 : 0;

  // Distribuição por evento
  const byEvento: Record<string, number> = {};
  items.forEach((i) => {
    byEvento[i.tipo_evento] = (byEvento[i.tipo_evento] ?? 0) + n(i.valor_bruto);
  });
  const maxEvento = Math.max(...Object.values(byEvento), 1);

  // Repasses pendentes
  const repassesPend = items.filter(
    (i) => i.beneficiario_tipo === "parceiro" && i.repasse_status === "pendente"
  );
  const totalRepassesPend = repassesPend.reduce((s, i) => s + n(i.valor_liquido), 0);

  const totalBrutoEmpresa = n(resumo?.total_bruto_empresa);
  const totalLiqParceiros = n(resumo?.total_liquido_parceiros);
  const totalImpostosParceiros = n(resumo?.total_impostos_parceiros);

  return (
    <div className="space-y-5 p-6">
      {/* ── KPI cards ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Empresa (Bruto)"
          value={money(totalBrutoEmpresa)}
          sub={`${items.filter((i) => i.beneficiario_tipo === "empresa").length} lançamentos`}
          icon={<Building2 className="h-4 w-4" />}
          accent="sky"
          progress={pctExecutado}
          progressLabel={`${pctExecutado.toFixed(0)}% recebido`}
        />
        <KpiCard
          label="Já Recebido (Pago)"
          value={money(totalByStatus.pago)}
          sub={`${byStatus.pago.length} lançamento${byStatus.pago.length !== 1 ? "s" : ""} pagos`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent="emerald"
        />
        <KpiCard
          label="Parceiros (Líquido)"
          value={money(totalLiqParceiros)}
          sub={`${money(totalImpostosParceiros)} em impostos retidos`}
          icon={<Users className="h-4 w-4" />}
          accent="violet"
        />
        <KpiCard
          label="Repasses Pendentes"
          value={money(totalRepassesPend)}
          sub={`${repassesPend.length} parceiro${repassesPend.length !== 1 ? "s" : ""} aguardando`}
          icon={<AlertTriangle className="h-4 w-4" />}
          accent={repassesPend.length > 0 ? "amber" : "slate"}
          alert={repassesPend.length > 0}
        />
      </div>

      {/* ── Pipeline financeiro ── */}
      <div className="rounded-2xl border border-border/40 bg-card/20 p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Pipeline Financeiro</span>
          <span className="text-xs text-muted-foreground">— Fluxo de recebimento por etapa</span>
        </div>
        <div className="flex items-stretch gap-2">
          {(
            [
              { key: "previsto", label: "Previsto", icon: Clock, color: "slate" },
              { key: "disponivel", label: "Disponível", icon: TrendingUp, color: "amber" },
              { key: "pago", label: "Pago", icon: CheckCircle2, color: "emerald" },
              { key: "cancelado", label: "Cancelado", icon: XCircle, color: "rose" },
            ] as const
          ).map(({ key, label, icon: Icon, color }, idx, arr) => {
            const count = byStatus[key].length;
            const total = totalByStatus[key];
            const pct = totalGlobal > 0 ? (total / totalGlobal) * 100 : 0;

            const styles = {
              slate: {
                wrap: "border-slate-500/25 bg-slate-500/8",
                text: "text-slate-300",
                bar: "bg-slate-500/50",
              },
              amber: {
                wrap: "border-amber-500/25 bg-amber-500/8",
                text: "text-amber-300",
                bar: "bg-amber-500/60",
              },
              emerald: {
                wrap: "border-emerald-500/25 bg-emerald-500/8",
                text: "text-emerald-300",
                bar: "bg-emerald-500/60",
              },
              rose: {
                wrap: "border-rose-500/25 bg-rose-500/8",
                text: "text-rose-300",
                bar: "bg-rose-500/50",
              },
            }[color];

            return (
              <>
                <div key={key} className={`flex-1 rounded-xl border p-4 ${styles.wrap}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`h-4 w-4 ${styles.text}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${styles.text}`}>
                      {label}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-foreground">{money(total)}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {count} lançamento{count !== 1 ? "s" : ""}
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/8">
                    <div
                      className={`h-full rounded-full transition-all ${styles.bar}`}
                      style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground/60">{pct.toFixed(0)}% do total</div>
                </div>
                {idx < arr.length - 1 && (
                  <div className="flex items-center self-center text-muted-foreground/30">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </>
            );
          })}
        </div>
      </div>

      {/* ── Bottom section: Distribuição + Alertas ── */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Distribuição por evento */}
        <div className="rounded-2xl border border-border/40 bg-card/20 p-5">
          <div className="mb-4 text-sm font-semibold">Distribuição por Evento</div>
          {Object.keys(byEvento).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum dado disponível.</p>
          ) : (
            <div className="space-y-3.5">
              {Object.entries(byEvento)
                .sort(([, a], [, b]) => b - a)
                .map(([evento, valor]) => (
                  <div key={evento}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {EVENTO_LABELS[evento] ?? evento}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{money(valor)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/6">
                      <div
                        className="h-full rounded-full bg-emerald-500/50"
                        style={{ width: `${(valor / maxEvento) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Repasses em risco */}
        <div className="rounded-2xl border border-border/40 bg-card/20 p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle
              className={`h-4 w-4 ${repassesPend.length > 0 ? "text-amber-400" : "text-muted-foreground"}`}
            />
            <span className="text-sm font-semibold">Repasses Pendentes</span>
          </div>
          {repassesPend.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <CheckCircle2 className="h-9 w-9 text-emerald-500/40" />
              <p className="text-sm text-muted-foreground">Todos os repasses estão em dia.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {repassesPend.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-amber-500/15 bg-amber-500/5 px-3.5 py-2.5"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {item.parceiros_corretores?.nome ?? "Parceiro"}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {EVENTO_LABELS[item.tipo_evento] ?? item.tipo_evento}
                      {item.repasse_previsto_em && (
                        <>
                          {" · "}Previsto{" "}
                          {new Date(item.repasse_previsto_em).toLocaleDateString("pt-BR")}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-amber-300">
                      {money(Number(item.valor_liquido || 0))}
                    </div>
                    <div className="text-xs text-muted-foreground">líquido</div>
                  </div>
                </div>
              ))}
              {repassesPend.length > 5 && (
                <p className="pt-1 text-center text-xs text-muted-foreground">
                  +{repassesPend.length - 5} outros pendentes
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type KpiCardProps = {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  accent: "emerald" | "sky" | "amber" | "violet" | "slate";
  progress?: number;
  progressLabel?: string;
  alert?: boolean;
};

const ACCENT_STYLES = {
  emerald: {
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
    icon: "text-emerald-400 bg-emerald-500/10",
    bar: "bg-emerald-500/70",
  },
  sky: {
    border: "border-sky-500/20",
    bg: "bg-sky-500/5",
    icon: "text-sky-400 bg-sky-500/10",
    bar: "bg-sky-500/70",
  },
  amber: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    icon: "text-amber-400 bg-amber-500/10",
    bar: "bg-amber-500/70",
  },
  violet: {
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
    icon: "text-violet-400 bg-violet-500/10",
    bar: "bg-violet-500/70",
  },
  slate: {
    border: "border-border/40",
    bg: "bg-card/30",
    icon: "text-muted-foreground bg-white/5",
    bar: "bg-slate-500/60",
  },
};

function KpiCard({ label, value, sub, icon, accent, progress, progressLabel, alert }: KpiCardProps) {
  const c = ACCENT_STYLES[accent];
  return (
    <div className={`rounded-2xl border p-5 transition-colors ${c.border} ${c.bg}`}>
      <div className="flex items-start justify-between">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${c.icon}`}
        >
          {icon}
        </div>
        {alert && (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400">
            !
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-xs text-muted-foreground/80">{sub}</div>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="h-1 w-full rounded-full bg-white/6">
            <div
              className={`h-full rounded-full transition-all ${c.bar}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {progressLabel && (
            <div className="mt-1 text-xs text-muted-foreground/70">{progressLabel}</div>
          )}
        </div>
      )}
    </div>
  );
}
