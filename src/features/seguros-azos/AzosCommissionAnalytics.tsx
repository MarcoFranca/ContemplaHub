"use client";

import { useMemo, useState } from "react";
import { CalendarRange, ChevronLeft, ChevronRight, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AzosCommission } from "./portfolio-actions";

type Period = 3 | 6 | 12 | 0;
type StatusFilter = "all" | "paid" | "scheduled_payment" | "awaiting_verification";
type MonthPoint = { key: string; label: string; value: number };

const PAGE_SIZE = 20;
const money = (value?: number | string | null) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value ?? 0));
const date = (value?: string | null) => value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value)) : "Sem data";
const statusLabels: Record<string, string> = { paid: "Realizada", scheduled_payment: "Programada", awaiting_verification: "Em conferência" };

function financialDate(item: AzosCommission) { return item.paid_at ?? item.invoice_paid_at ?? null; }
function monthKey(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`; }
function monthLabel(value: Date) { return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" }).format(value).replace(" de ", "/"); }
function startOfMonth(value: Date) { return new Date(value.getFullYear(), value.getMonth(), 1); }
function addMonths(value: Date, amount: number) { return new Date(value.getFullYear(), value.getMonth() + amount, 1); }

function buildClosedMonthSeries(items: AzosCommission[], months = 12): MonthPoint[] {
  const currentMonth = startOfMonth(new Date());
  return Array.from({ length: months }, (_, index) => addMonths(currentMonth, index - months)).map((month) => ({
    key: monthKey(month), label: monthLabel(month),
    value: items.reduce((sum, item) => item.status === "paid" && financialDate(item)?.slice(0, 7) === monthKey(month) ? sum + Number(item.commission_value ?? 0) : sum, 0),
  }));
}

function prediction(series: MonthPoint[]) {
  const values = series.map((point) => point.value);
  const latest = values.at(-1) ?? 0;
  const previous = values.slice(-4, -1);
  const baseline = previous.length ? previous.reduce((sum, value) => sum + value, 0) / previous.length : 0;
  const score = baseline > 0 ? (latest / baseline) * 100 : null;
  const lastThree = values.slice(-3);
  const forecast = lastThree.length === 3 ? lastThree[2] * 0.5 + lastThree[1] * 0.3 + lastThree[0] * 0.2 : 0;
  const mean = lastThree.length ? lastThree.reduce((sum, value) => sum + value, 0) / lastThree.length : 0;
  const deviation = lastThree.length ? Math.sqrt(lastThree.reduce((sum, value) => sum + (value - mean) ** 2, 0) / lastThree.length) : 0;
  const variation = mean > 0 ? deviation / mean : 1;
  const nonZeroMonths = values.filter((value) => value > 0).length;
  const confidence = nonZeroMonths >= 6 && variation <= 0.35 ? "Alta" : nonZeroMonths >= 3 && variation <= 0.7 ? "Média" : "Baixa";
  return { latest, baseline, score, forecast, lower: Math.max(0, forecast - deviation), upper: forecast + deviation, confidence };
}

function performanceLabel(score: number | null) {
  if (score == null) return { label: "Sem base comparável", tone: "text-slate-300", description: "Ainda não há meses anteriores suficientes para comparação." };
  if (score >= 120) return { label: "Mês excelente", tone: "text-emerald-300", description: "Resultado pelo menos 20% acima da média recente." };
  if (score >= 100) return { label: "Mês bom", tone: "text-emerald-200", description: "Resultado acima da média dos três meses anteriores." };
  if (score >= 80) return { label: "Mês de atenção", tone: "text-amber-300", description: "Resultado até 20% abaixo da média recente." };
  return { label: "Abaixo da média", tone: "text-rose-300", description: "Resultado mais de 20% abaixo da média recente." };
}

export function AzosCommissionAnalytics({ commissions }: { commissions: AzosCommission[] }) {
  const [period, setPeriod] = useState<Period>(6); const [status, setStatus] = useState<StatusFilter>("all"); const [page, setPage] = useState(1);
  const series = useMemo(() => buildClosedMonthSeries(commissions), [commissions]);
  const model = useMemo(() => prediction(series), [series]);
  const performance = performanceLabel(model.score);
  const filtered = useMemo(() => {
    const cutoff = period ? addMonths(startOfMonth(new Date()), -(period - 1)) : null;
    return [...commissions].filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      const reference = financialDate(item);
      if (!cutoff) return true;
      return Boolean(reference && new Date(reference) >= cutoff);
    }).sort((a, b) => (financialDate(b) ?? "").localeCompare(financialDate(a) ?? ""));
  }, [commissions, period, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)); const safePage = Math.min(page, pageCount); const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const filteredTotal = filtered.reduce((sum, item) => sum + Number(item.commission_value ?? 0), 0);
  const undatedCount = commissions.filter((item) => !financialDate(item)).length;
  const visibleSeries = series.slice(-(period || 12)); const maxMonth = Math.max(...visibleSeries.map((point) => point.value), model.forecast, 1);
  const nextMonth = monthLabel(addMonths(startOfMonth(new Date()), 1));

  function updatePeriod(value: Period) { setPeriod(value); setPage(1); }
  function updateStatus(value: StatusFilter) { setStatus(value); setPage(1); }

  return <div className="space-y-4">
    <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/55 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div><p className="flex items-center gap-2 text-sm font-medium text-slate-200"><CalendarRange className="h-4 w-4 text-emerald-300" /> Período de análise</p><p className="mt-1 text-xs text-slate-500">O filtro controla o extrato e a janela exibida no histórico mensal.</p></div>
      <div className="flex flex-wrap gap-2">{([3, 6, 12, 0] as Period[]).map((value) => <Button key={value} type="button" size="sm" variant={period === value ? "default" : "outline"} onClick={() => updatePeriod(value)}>{value === 0 ? "Todo histórico" : `${value} meses`}</Button>)}<select aria-label="Filtrar status" value={status} onChange={(event) => updateStatus(event.target.value as StatusFilter)} className="h-9 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-slate-200"><option value="all">Todos os status</option><option value="paid">Realizadas</option><option value="scheduled_payment">Programadas</option><option value="awaiting_verification">Em conferência</option></select></div>
    </section>

    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="border-white/10 bg-slate-950/55"><CardHeader><CardTitle>Último mês fechado</CardTitle><CardDescription>{series.at(-1)?.label ?? "Sem competência"}</CardDescription></CardHeader><CardContent><p className="font-mono text-2xl font-semibold">{money(model.latest)}</p><p className={`mt-3 flex items-center gap-1 text-sm font-medium ${performance.tone}`}>{model.score != null && model.score >= 100 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}{performance.label}</p><p className="mt-1 text-xs text-slate-500">{performance.description}</p>{model.score != null && <p className="mt-3 text-xs text-slate-400">Índice de performance: <span className="font-mono text-slate-200">{model.score.toFixed(1)}</span> · média-base {money(model.baseline)}</p>}</CardContent></Card>
      <Card className="border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-slate-950 lg:col-span-2"><CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-300" /> Previsão para {nextMonth}</CardTitle><CardDescription>Média móvel ponderada dos três últimos meses fechados, ajustada pela volatilidade.</CardDescription></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-3"><ForecastValue label="Estimativa central" value={money(model.forecast)} /><ForecastValue label="Faixa provável" value={`${money(model.lower)} – ${money(model.upper)}`} /><ForecastValue label="Confiança" value={model.confidence} /></div><p className="mt-4 rounded-lg border border-violet-400/15 bg-violet-400/5 p-3 text-xs leading-relaxed text-slate-400">Esta é uma projeção estatística, não uma garantia de recebimento. Ela ainda não incorpora mudanças de comissão, novas vendas futuras ou cancelamentos que não estejam refletidos no histórico Azos.</p></CardContent></Card>
    </section>

    <Card className="border-white/10 bg-slate-950/55"><CardHeader><CardTitle>Performance mensal realizada</CardTitle><CardDescription>Somente comissões com status pago, agrupadas pelo mês de referência.</CardDescription></CardHeader><CardContent><div className="flex h-64 items-end gap-2 overflow-x-auto pb-2">{visibleSeries.map((point) => <div key={point.key} className="flex min-w-14 flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] font-medium text-slate-400">{point.value ? money(point.value) : "—"}</span><div className="w-full max-w-14 rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-300 transition-all" style={{ height: `${Math.max(point.value ? 8 : 2, (point.value / maxMonth) * 180)}px` }} /><span className="text-[10px] capitalize text-slate-500">{point.label}</span></div>)}</div></CardContent></Card>

    <Card className="border-white/10 bg-slate-950/55"><CardHeader><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><CardTitle>Extrato filtrado</CardTitle><CardDescription>{filtered.length} lançamento(s) · total {money(filteredTotal)}</CardDescription></div>{undatedCount > 0 && <p className="text-xs text-amber-300">{undatedCount} registro(s) sem data aparecem apenas em “Todo histórico”.</p>}</div></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500"><tr><th className="pb-3">Data</th><th className="pb-3">Cliente</th><th className="pb-3">Apólice</th><th className="pb-3">Status</th><th className="pb-3 text-right">Comissão</th></tr></thead><tbody>{paged.map((item) => <tr key={item.id} className="border-b border-white/5"><td className="py-3 text-slate-400">{date(financialDate(item))}</td><td className="py-3 font-medium text-slate-200">{item.insured_name ?? "Cliente não informado"}</td><td className="py-3 text-slate-400">{item.policy_number ?? item.policy_azos_id ?? "—"}</td><td className="py-3 text-slate-300">{statusLabels[item.status ?? ""] ?? item.status ?? "Sem status"}</td><td className="py-3 text-right font-mono font-semibold">{money(item.commission_value)}</td></tr>)}{!paged.length && <tr><td colSpan={5} className="py-10 text-center text-slate-500">Nenhum lançamento para os filtros selecionados.</td></tr>}</tbody></table></div><div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4"><p className="text-xs text-slate-500">Página {safePage} de {pageCount}</p><div className="flex gap-2"><Button type="button" size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft /> Anterior</Button><Button type="button" size="sm" variant="outline" disabled={safePage >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Próxima <ChevronRight /></Button></div></div></CardContent></Card>
  </div>;
}

function ForecastValue({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3"><p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-mono text-lg font-semibold text-slate-100">{value}</p></div>; }
