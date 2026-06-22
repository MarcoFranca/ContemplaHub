"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Trophy,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ParceiroRankingItem } from "../types";

const brl = (v: number | string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    Number(v || 0)
  );
const brlFull = (v: number | string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

const tooltipStyle = {
  backgroundColor: "rgb(15 23 42)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#e2e8f0",
};

const BAR_COLORS = ["#10b981", "#38bdf8", "#a78bfa", "#f59e0b", "#22d3ee", "#f43f5e", "#64748b"];
const MEDALS = ["🥇", "🥈", "🥉"];

function cancelColor(taxa: number) {
  if (taxa >= 25) return "border-rose-500/30 bg-rose-500/10 text-rose-300";
  if (taxa >= 10) return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
}

function monthLabel(mes: string) {
  const [y, m] = mes.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
    new Date(y, m - 1, 1)
  );
}

/** Soma `delta` meses a um YYYY-MM. */
function addMonths(mes: string, delta: number) {
  const [y, m] = mes.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function ParceirosRankingView({
  de,
  ate,
  items,
}: {
  de: string;
  ate: string;
  items: ParceiroRankingItem[];
}) {
  const router = useRouter();

  const go = React.useCallback(
    (novoDe: string, novoAte: string) =>
      router.push(`/app/parceiros/gerencial?de=${novoDe}&ate=${novoAte}`),
    [router]
  );

  const periodoLabel = React.useMemo(
    () => (de === ate ? monthLabel(de) : `${monthLabel(de)} – ${monthLabel(ate)}`),
    [de, ate]
  );

  const now = thisMonth();
  const presets: { label: string; de: string; ate: string }[] = [
    { label: "Mês atual", de: now, ate: now },
    { label: "Últimos 3 meses", de: addMonths(now, -2), ate: now },
    { label: "Últimos 6 meses", de: addMonths(now, -5), ate: now },
    { label: "Ano atual", de: `${now.slice(0, 4)}-01`, ate: `${now.slice(0, 4)}-12` },
    { label: "Últimos 12 meses", de: addMonths(now, -11), ate: now },
  ];
  const activePreset = presets.find((p) => p.de === de && p.ate === ate)?.label ?? null;

  // Totais do período
  const totais = items.reduce(
    (acc, it) => {
      acc.vendas += it.vendas;
      acc.volume += Number(it.volume_cartas || 0);
      acc.pago += Number(it.repasse_pago || 0);
      acc.pendente += Number(it.repasse_pendente || 0);
      return acc;
    },
    { vendas: 0, volume: 0, pago: 0, pendente: 0 }
  );

  // Dados de gráfico (top 7)
  const top = [...items].slice(0, 7);
  const dataVendas = top
    .filter((i) => i.vendas > 0)
    .map((i) => ({ label: i.nome, value: i.vendas }));
  const dataVolume = top
    .filter((i) => Number(i.volume_cartas) > 0)
    .map((i) => ({ label: i.nome, value: Number(i.volume_cartas) }));
  const dataRepasse = top
    .filter((i) => Number(i.repasse_pago) + Number(i.repasse_pendente) > 0)
    .map((i) => ({
      label: i.nome,
      pago: Number(i.repasse_pago),
      pendente: Number(i.repasse_pendente),
    }));

  // Ranking ordenado por vendas (já vem do backend, reforçamos)
  const ranking = [...items].sort((a, b) => b.vendas - a.vendas || Number(b.volume_cartas) - Number(a.volume_cartas));

  const kpis = [
    { label: "Vendas no período", value: String(totais.vendas), icon: CreditCard, hint: "cartas vendidas" },
    { label: "Volume vendido", value: brl(totais.volume), icon: BarChart3, hint: "soma das cartas" },
    { label: "Repassado", value: brl(totais.pago), icon: Wallet, hint: "já pago aos parceiros" },
    { label: "A repassar", value: brl(totais.pendente), icon: ArrowUpRight, hint: "pendente no período" },
  ];

  return (
    <>
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/app/parceiros"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao cadastro
            </Link>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold">
              <Trophy className="h-6 w-6 text-emerald-500" />
              Gerencial de parceiros
            </h1>
            <p className="text-sm capitalize text-muted-foreground">{periodoLabel}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <label className="flex items-center gap-1.5">
              <span className="text-muted-foreground">De</span>
              <input
                type="month"
                value={de}
                max={ate}
                onChange={(e) => go(e.target.value, ate)}
                className="h-9 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
              />
            </label>
            <label className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Até</span>
              <input
                type="month"
                value={ate}
                min={de}
                onChange={(e) => go(de, e.target.value)}
                className="h-9 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
              />
            </label>
          </div>
        </div>

        {/* Atalhos de período */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => {
            const ativo = p.label === activePreset;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => go(p.de, p.ate)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  ativo
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="border-emerald-500/15">
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Icon className="h-4 w-4 text-emerald-500" />
                  {k.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold tabular-nums">{k.value}</div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{k.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum dado de parceiros neste período.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Gráficos */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Ranking de vendas"
              subtitle="Cartas vendidas por parceiro no período"
              data={dataVendas}
              empty="Nenhuma venda no período."
              formatter={(v) => [`${v} carta${v !== 1 ? "s" : ""}`, "Vendas"]}
            />
            <ChartCard
              title="Volume de cartas vendidas"
              subtitle="Soma do valor das cartas vendidas"
              data={dataVolume}
              empty="Sem volume no período."
              formatter={(v) => [brlFull(v), "Volume"]}
            />
          </div>

          {/* Repasses pago x a pagar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="h-4 w-4 text-emerald-500" />
                Repasses — pago x a pagar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dataRepasse.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Sem repasses no período.</p>
              ) : (
                <div style={{ height: dataRepasse.length * 44 + 12 }} className="w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataRepasse} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={120}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        formatter={(v: number, name) => [brlFull(v), name === "pago" ? "Pago" : "A pagar"]}
                      />
                      <Bar dataKey="pago" stackId="r" fill="#10b981" radius={[6, 0, 0, 6]} barSize={20} />
                      <Bar dataKey="pendente" stackId="r" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ranking completo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4 text-emerald-500" />
                Ranking completo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border border-white/8">
                <div className="grid grid-cols-[2.5rem_1fr_5rem_8rem_7rem_8rem_8rem] gap-3 border-b border-white/8 bg-card/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  <span>#</span>
                  <span>Parceiro</span>
                  <span className="text-center">Vendas</span>
                  <span className="text-right">Volume</span>
                  <span className="text-center">Cancel.</span>
                  <span className="text-right">Repassado</span>
                  <span className="text-right">A repassar</span>
                </div>
                {ranking.map((p, i) => {
                  const taxa = Number(p.taxa_cancelamento || 0);
                  return (
                    <Link
                      key={p.parceiro_id}
                      href={`/app/parceiros/${p.parceiro_id}`}
                      className="grid grid-cols-[2.5rem_1fr_5rem_8rem_7rem_8rem_8rem] items-center gap-3 border-b border-white/5 px-4 py-2.5 text-sm transition-colors last:border-0 hover:bg-white/3"
                    >
                      <span className="text-center text-base">{MEDALS[i] ?? <span className="text-xs text-muted-foreground">{i + 1}</span>}</span>
                      <span className="truncate font-medium">{p.nome}</span>
                      <span className="text-center font-semibold tabular-nums">{p.vendas}</span>
                      <span className="text-right tabular-nums">{brl(p.volume_cartas)}</span>
                      <span className="flex justify-center">
                        <Badge variant="outline" className={cancelColor(taxa)} title={`${p.cotas_canceladas}/${p.total_cotas} cotas canceladas`}>
                          {taxa.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
                        </Badge>
                      </span>
                      <span className="text-right tabular-nums text-emerald-400/90">{brl(p.repasse_pago)}</span>
                      <span className="text-right tabular-nums text-amber-400/90">{brl(p.repasse_pendente)}</span>
                    </Link>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                A taxa de cancelamento considera toda a carteira do parceiro (vitalícia); vendas, volume e repasses são do período selecionado.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}

function ChartCard({
  title,
  subtitle,
  data,
  empty,
  formatter,
}: {
  title: string;
  subtitle: string;
  data: { label: string; value: number }[];
  empty: string;
  formatter: (v: number) => [string, string];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          <div style={{ height: data.length * 44 + 12 }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={120}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  formatter={(v: number) => formatter(v)}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                  {data.map((_d, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
