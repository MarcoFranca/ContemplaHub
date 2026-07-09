"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRightLeft,
  CircleDollarSign,
  Clock3,
  Layers3,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

type PanoramaProps = {
  resumo: {
    totalLancamentos: number;
    empresaProjetada: number;
    empresaDisponivel: number;
    empresaPago: number;
    repassePendente: number;
    repassePago: number;
    cancelado: number;
  };
  timeline: Array<{
    mes: string;
    label: string;
    projetado: number;
    pago: number;
    cancelado: number;
    repassePendente: number;
    repassePago: number;
  }>;
  contratosCriticos: Array<{
    contratoId: string;
    contratoNumero: string;
    cliente: string;
    cota: string;
    empresaReceber: number;
    empresaPaga: number;
    repassePendente: number;
  }>;
};

const chartConfig = {
  projetado: { label: "Projetado", color: "#38bdf8" },
  pago: { label: "Pago", color: "#34d399" },
  cancelado: { label: "Cancelado", color: "#fb7185" },
  repassePendente: { label: "Repasse pendente", color: "#f59e0b" },
  repassePago: { label: "Repasse pago", color: "#10b981" },
};

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

export function FinanceiroPanorama({ resumo, timeline, contratosCriticos }: PanoramaProps) {
  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.45)]">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.24),transparent_60%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid max-w-3xl gap-3">
            <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-300">
              Financeiro operacional
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Panorama de comissoes e repasses</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-400">
                Veja o que a empresa ja recebeu, o que ainda deve entrar por competencia e onde os repasses do parceiro estao acumulando.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              <Link href="/app/financeiro/pagamentos">Cadastrar cronogramas</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]">
              <Link href="/app/comissoes">Abrir modulo de comissoes</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard label="Empresa projetada" value={money(resumo.empresaProjetada)} hint="competencias futuras" icon={Clock3} />
        <MetricCard label="Empresa disponivel" value={money(resumo.empresaDisponivel)} hint="aguardando baixa" icon={TrendingUp} />
        <MetricCard label="Empresa recebida" value={money(resumo.empresaPago)} hint="baixas confirmadas" icon={CircleDollarSign} />
        <MetricCard label="Repasse pendente" value={money(resumo.repassePendente)} hint="parceiros aguardando pagamento" icon={ArrowRightLeft} />
        <MetricCard label="Repasse pago" value={money(resumo.repassePago)} hint="repasses liquidados" icon={WalletCards} />
        <MetricCard label="Cancelado" value={money(resumo.cancelado)} hint={`${resumo.totalLancamentos} lancamentos mapeados`} icon={Layers3} />
      </section>

      <section className="grid gap-6 min-[1500px]:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">Timeline da comissao</h2>
            <p className="mt-0.5 text-sm text-slate-400">Ultimos 12 meses entre projetado, pago, cancelado e repasse do parceiro.</p>
          </div>
          {timeline.length ? (
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <AreaChart data={timeline} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillProjetado" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-projetado)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-projetado)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillPago" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-pago)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-pago)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.18} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${Math.round(Number(v) / 1000)}k`} width={54} />
                <Tooltip content={<ChartTooltipContent formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-slate-300">{String(name)}</span>
                    <span className="font-medium text-white">{money(Number(value || 0))}</span>
                  </div>
                )} />} />
                <Area type="monotone" dataKey="projetado" stroke="var(--color-projetado)" fill="url(#fillProjetado)" strokeWidth={2} />
                <Area type="monotone" dataKey="pago" stroke="var(--color-pago)" fill="url(#fillPago)" strokeWidth={2} />
                <Bar dataKey="cancelado" fill="var(--color-cancelado)" radius={[8, 8, 0, 0]} maxBarSize={18} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <EmptyBlock text="Ainda nao existem lancamentos suficientes para montar a timeline do financeiro." />
          )}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">Fluxo de repasses</h2>
            <p className="mt-0.5 text-sm text-slate-400">Leitura rapida do que ficou pendente versus o que ja saiu para parceiros.</p>
          </div>
          {timeline.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={timeline} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.14} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} width={40} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  formatter={(value: number) => money(Number(value || 0))}
                />
                <Bar dataKey="repassePendente" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                <Bar dataKey="repassePago" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyBlock text="Sem repasses suficientes para gerar o comparativo mensal." />
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Contratos com maior saldo operacional</h2>
            <p className="mt-0.5 text-sm text-slate-400">Priorize as cartas onde ainda existe mais comissao a receber ou repasse a executar.</p>
          </div>
          <Button asChild variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]">
            <Link href="/app/financeiro/pagamentos">Ir para pagamentos</Link>
          </Button>
        </div>

        {contratosCriticos.length ? (
          <div className="overflow-x-auto">
            <div className="min-w-[860px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
              <div className="grid grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr] gap-3 border-b border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span>Contrato / cliente</span>
                <span className="text-right">Empresa a receber</span>
                <span className="text-right">Empresa recebida</span>
                <span className="text-right">Repasse pendente</span>
              </div>
              <div className="divide-y divide-white/5">
                {contratosCriticos.map((item) => (
                  <div key={`${item.contratoId}:${item.cota}`} className="grid grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr] gap-3 px-4 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{item.cliente}</p>
                      <p className="truncate text-xs text-slate-500">
                        {item.contratoNumero} · Cota {item.cota}
                      </p>
                    </div>
                    <span className="text-right font-medium text-sky-300">{money(item.empresaReceber)}</span>
                    <span className="text-right text-emerald-300">{money(item.empresaPaga)}</span>
                    <span className="text-right text-amber-300">{money(item.repassePendente)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyBlock text="Sem contratos com saldo de comissao para destacar agora." />
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.24)]">
      <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
        <Icon className="h-4 w-4 text-emerald-300" />
        {label}
      </div>
      <p className="text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
      {text}
    </div>
  );
}
