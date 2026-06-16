"use client";

import {
    Area,
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { MonthlyPoint } from "../../_data/dashboard/get-dashboard-data";

function brlCompact(v: number) {
    if (Math.abs(v) >= 1000) return `R$ ${(v / 1000).toFixed(0)}k`;
    return `R$ ${v}`;
}

const tooltipStyle = {
    backgroundColor: "rgb(15 23 42)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    fontSize: 12,
    color: "#e2e8f0",
};

export function DashboardEvolucao({ data }: { data: MonthlyPoint[] }) {
    const vazio = data.every((d) => !d.leads && !d.contratos && !d.comissao);

    return (
        <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="space-y-1">
                <h2 className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    Evolução (últimos 6 meses)
                </h2>
                <p className="text-sm text-muted-foreground">
                    Leads e contratos por mês, com a comissão prevista no período.
                </p>
            </div>

            {vazio ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                    Ainda sem histórico suficiente para o gráfico.
                </p>
            ) : (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                            <defs>
                                <linearGradient id="gradComissao" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                            <YAxis
                                yAxisId="left"
                                tick={{ fill: "#94a3b8", fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fill: "#94a3b8", fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={brlCompact}
                            />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                formatter={(value: number, name: string) =>
                                    name === "Comissão prevista"
                                        ? [
                                              new Intl.NumberFormat("pt-BR", {
                                                  style: "currency",
                                                  currency: "BRL",
                                              }).format(value),
                                              name,
                                          ]
                                        : [value, name]
                                }
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="comissao"
                                name="Comissão prevista"
                                stroke="#10b981"
                                fill="url(#gradComissao)"
                                strokeWidth={2}
                            />
                            <Bar yAxisId="left" dataKey="contratos" name="Contratos" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={18} />
                            <Line yAxisId="left" type="monotone" dataKey="leads" name="Leads" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
