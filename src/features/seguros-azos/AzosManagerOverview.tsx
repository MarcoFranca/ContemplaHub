import { Activity, ArrowUpRight, Landmark, TriangleAlert, WalletCards } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AzosPortfolio } from "./portfolio-actions";

const money = (value?: number | string | null) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value ?? 0));
const date = (value?: string | null) => value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value)) : "Sem data";
const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function AzosManagerOverview({ portfolio }: { portfolio: AzosPortfolio }) {
  const { resumo } = portfolio;
  const totalPolicies = resumo.apolices_ativas + resumo.apolices_inativas;
  const activeRate = totalPolicies ? (resumo.apolices_ativas / totalPolicies) * 100 : 0;
  const riskRate = resumo.premio_mensal_recorrente ? (resumo.premio_mensal_em_risco / resumo.premio_mensal_recorrente) * 100 : 0;
  const commissionRows = [
    { label: "Realizado", value: resumo.comissao_paga, color: "bg-emerald-400", helper: "Comissões pagas pela Azos" },
    { label: "Programado", value: resumo.comissao_programada, color: "bg-sky-400", helper: "Pagamento agendado" },
    { label: "Em conferência", value: resumo.comissao_em_conferencia, color: "bg-amber-300", helper: "Aguardando validação" },
  ];
  const recent = [...portfolio.comissoes].sort((a, b) => (b.paid_at ?? b.invoice_paid_at ?? "").localeCompare(a.paid_at ?? a.invoice_paid_at ?? "")).slice(0, 6);

  return <div className="space-y-4">
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Kpi title="Prêmio mensal recorrente" value={money(resumo.premio_mensal_recorrente)} helper={`${resumo.apolices_ativas} apólice(s) ativa(s)`} icon={<Activity className="h-5 w-5 text-emerald-300" />} featured />
      <Kpi title="Prêmio anualizado" value={money(resumo.premio_anualizado)} helper="MRP atual multiplicado por 12" icon={<ArrowUpRight className="h-5 w-5 text-sky-300" />} />
      <Kpi title="Ticket médio mensal" value={money(resumo.ticket_medio_mensal)} helper="Por apólice ativa" icon={<WalletCards className="h-5 w-5 text-violet-300" />} />
      <Kpi title="Prêmio mensal em risco" value={money(resumo.premio_mensal_em_risco)} helper={`${resumo.apolices_em_atraso} apólice(s) em atenção`} icon={<TriangleAlert className="h-5 w-5 text-amber-300" />} danger={resumo.premio_mensal_em_risco > 0} />
    </section>

    <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
      <Card className="border-white/10 bg-slate-950/55">
        <CardHeader><CardTitle>Fluxo de comissões Azos</CardTitle><CardDescription>Posição financeira por estágio, sem misturar com comissões de Consórcio.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3"><MiniValue label="Total mapeado" value={money(resumo.comissao_total)} /><MiniValue label="A receber" value={money(resumo.comissao_a_receber)} /><MiniValue label="Realização" value={`${resumo.realizacao_comissao_pct.toFixed(1)}%`} /></div>
          <div className="space-y-4">{commissionRows.map((row) => { const pct = resumo.comissao_total ? (row.value / resumo.comissao_total) * 100 : 0; return <div key={row.label}><div className="mb-2 flex items-end justify-between gap-4"><div><p className="text-sm font-medium text-slate-200">{row.label}</p><p className="text-xs text-slate-500">{row.helper}</p></div><p className="font-mono text-sm font-semibold text-slate-100">{money(row.value)}</p></div><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className={`h-full rounded-full ${row.color}`} style={{ width: `${clamp(pct)}%` }} /></div></div>})}</div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-slate-950/55">
        <CardHeader><CardTitle>Saúde da carteira</CardTitle><CardDescription>Retenção e exposição da receita recorrente.</CardDescription></CardHeader>
        <CardContent className="space-y-5"><Gauge label="Carteira ativa" value={activeRate} tone="emerald" /><Gauge label="MRP em risco" value={riskRate} tone="amber" /><div className="grid grid-cols-2 gap-3"><MiniValue label="Ativas" value={String(resumo.apolices_ativas)} /><MiniValue label="Inativas" value={String(resumo.apolices_inativas)} /></div></CardContent>
      </Card>
    </section>

    <Card className="border-white/10 bg-slate-950/55">
      <CardHeader><CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5 text-emerald-300" /> Movimentações recentes</CardTitle><CardDescription>Últimos registros financeiros recebidos da Azos.</CardDescription></CardHeader>
      <CardContent><div className="divide-y divide-white/5">{recent.map((item) => <div key={item.id} className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_180px_140px_100px] sm:items-center"><div><p className="font-medium text-slate-200">{item.insured_name ?? "Cliente não informado"}</p><p className="text-xs text-slate-500">Apólice {item.policy_number ?? item.policy_azos_id ?? "—"}</p></div><p className="font-mono font-semibold text-slate-100">{money(item.commission_value)}</p><p className="text-xs text-slate-400">{item.status === "paid" ? "Realizado" : item.status === "scheduled_payment" ? "Programado" : "Em conferência"}</p><p className="text-right text-xs text-slate-500">{date(item.paid_at ?? item.invoice_paid_at)}</p></div>)}{!recent.length && <div className="py-10 text-center text-sm text-slate-500">Sincronize a Azos para visualizar o movimento financeiro.</div>}</div></CardContent>
    </Card>
  </div>;
}

function Kpi({ title, value, helper, icon, featured = false, danger = false }: { title: string; value: string; helper: string; icon: React.ReactNode; featured?: boolean; danger?: boolean }) { return <Card className={featured ? "border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 to-slate-950" : danger ? "border-amber-400/25 bg-amber-400/5" : "border-white/10 bg-slate-950/55"}><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><p className="text-xs uppercase tracking-[0.14em] text-slate-500">{title}</p>{icon}</div><p className="mt-4 font-mono text-2xl font-semibold tracking-tight text-slate-50">{value}</p><p className="mt-1 text-xs text-slate-500">{helper}</p></CardContent></Card>; }
function MiniValue({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3"><p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-mono text-base font-semibold text-slate-100">{value}</p></div>; }
function Gauge({ label, value, tone }: { label: string; value: number; tone: "emerald" | "amber" }) { return <div><div className="mb-2 flex items-center justify-between"><span className="text-sm text-slate-300">{label}</span><span className="font-mono text-sm font-semibold text-slate-100">{value.toFixed(1)}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-white/5"><div className={`h-full rounded-full ${tone === "emerald" ? "bg-emerald-400" : "bg-amber-300"}`} style={{ width: `${clamp(value)}%` }} /></div></div>; }
