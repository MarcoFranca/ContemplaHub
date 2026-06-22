"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { CalendarRange, Coins, TrendingUp, UserPlus, Wallet } from "lucide-react";
import type { VendasAnalytics } from "../../_data/dashboard/get-vendas-analytics";

const brl = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
const brlFull = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const tooltipStyle = {
    backgroundColor: "rgb(15 23 42)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    fontSize: 12,
    color: "#e2e8f0",
};

function thisMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function addMonths(ym: string, delta: number) {
    const [y, m] = ym.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function DashboardVendas({ data }: { data: VendasAnalytics }) {
    const router = useRouter();
    const pathname = usePathname();

    const go = (de: string, ate: string) =>
        router.push(`${pathname}?de=${de}&ate=${ate}`, { scroll: false });

    const now = thisMonth();
    const ano = now.slice(0, 4);
    const presets: { label: string; de: string; ate: string }[] = [
        { label: "Ano atual", de: `${ano}-01`, ate: `${ano}-12` },
        { label: "Últimos 6 meses", de: addMonths(now, -5), ate: now },
        { label: "Últimos 12 meses", de: addMonths(now, -11), ate: now },
        { label: "1º trimestre", de: `${ano}-01`, ate: `${ano}-03` },
    ];
    const activePreset = presets.find((p) => p.de === data.de && p.ate === data.ate)?.label ?? null;

    const kpis = [
        { label: "Crédito vendido no ano", value: brl(data.creditoAno), icon: Coins, hint: ano },
        { label: "Crédito vendido no mês", value: brl(data.creditoMes), icon: Wallet, hint: "mês atual" },
        { label: "Clientes novos no mês", value: String(data.clientesNovosMes), icon: UserPlus, hint: "mês atual" },
        { label: "Crédito no período", value: brl(data.creditoPeriodo), icon: TrendingUp, hint: `${data.vendasPeriodo} venda(s)` },
        { label: "Clientes no período", value: String(data.clientesNovosPeriodo), icon: UserPlus, hint: "clientes distintos" },
    ];

    return (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
            {/* Header + período */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
                    <Coins className="h-5 w-5 text-emerald-400" />
                    Vendas & crédito
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex flex-wrap gap-1.5">
                        {presets.map((p) => (
                            <button
                                key={p.label}
                                type="button"
                                onClick={() => go(p.de, p.ate)}
                                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                                    p.label === activePreset
                                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                                        : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm">
                        <CalendarRange className="h-4 w-4 text-muted-foreground" />
                        <input
                            type="month"
                            value={data.de}
                            max={data.ate}
                            onChange={(e) => go(e.target.value, data.ate)}
                            className="h-8 rounded-lg border border-white/10 bg-slate-950 px-2 text-xs text-white outline-none"
                        />
                        <span className="text-muted-foreground">até</span>
                        <input
                            type="month"
                            value={data.ate}
                            min={data.de}
                            onChange={(e) => go(data.de, e.target.value)}
                            className="h-8 rounded-lg border border-white/10 bg-slate-950 px-2 text-xs text-white outline-none"
                        />
                    </span>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {kpis.map((k) => {
                    const Icon = k.icon;
                    return (
                        <div key={k.label} className="rounded-xl border border-white/10 bg-background/40 p-3">
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Icon className="h-4 w-4 text-emerald-400" />
                                {k.label}
                            </span>
                            <p className="mt-1 text-lg font-semibold tabular-nums">{k.value}</p>
                            <p className="text-[11px] text-muted-foreground">{k.hint}</p>
                        </div>
                    );
                })}
            </div>

            {/* Gráfico comparativo YoY */}
            <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Crédito vendido por mês · este ano x ano anterior
                </p>
                {data.serie.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Sem dados no período.</p>
                ) : (
                    <div style={{ height: 300 }} className="w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.serie} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                                <YAxis
                                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={64}
                                    tickFormatter={(v: number) => brl(v)}
                                />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                                    formatter={(v: number, name) => [brlFull(v), name === "credito" ? "Este ano" : "Ano anterior"]}
                                    labelFormatter={(l) => `Mês: ${l}`}
                                />
                                <Legend
                                    formatter={(value) => (value === "credito" ? "Este ano" : "Ano anterior")}
                                    wrapperStyle={{ fontSize: 12 }}
                                />
                                <Bar dataKey="creditoAnoAnterior" fill="#475569" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="credito" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </section>
    );
}
