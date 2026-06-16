"use client";

import {
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { CircleDollarSign } from "lucide-react";

type FinancialData = {
    previsto: number;
    disponivel: number;
    pago: number;
    repassePendente: number;
    porAdministradora: Array<{ label: string; value: number }>;
};

const tooltipStyle = {
    backgroundColor: "rgb(15 23 42)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    fontSize: 12,
    color: "#e2e8f0",
};

function brl(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

function brlFull(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

const ADMIN_COLORS = ["#10b981", "#38bdf8", "#a78bfa", "#f59e0b", "#22d3ee", "#f43f5e", "#64748b"];

export function DashboardComissaoChart({ data }: { data: FinancialData }) {
    const estados = [
        { label: "Previsto", value: data.previsto, color: "#64748b" },
        { label: "Disponível", value: data.disponivel, color: "#38bdf8" },
        { label: "Pago", value: data.pago, color: "#10b981" },
    ];

    const porAdmin = [...data.porAdministradora]
        .filter((a) => a.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    return (
        <div className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="space-y-1">
                <h2 className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
                    <CircleDollarSign className="h-5 w-5 text-emerald-400" />
                    Comissão — fluxo e operadoras
                </h2>
                <p className="text-sm text-muted-foreground">
                    Do previsto ao pago, e a concentração por administradora.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {estados.map((e) => (
                    <div key={e.label} className="rounded-xl border p-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />
                            {e.label}
                        </span>
                        <p className="mt-1 text-lg font-semibold">{brl(e.value)}</p>
                    </div>
                ))}
            </div>

            <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Por administradora (líquido)</p>
                {porAdmin.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Sem dados de comissão por operadora.</p>
                ) : (
                    <div style={{ height: porAdmin.length * 42 + 10 }} className="w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={porAdmin}
                                layout="vertical"
                                margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="label"
                                    width={110}
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                                    formatter={(v: number) => [brlFull(v), "Líquido"]}
                                />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                                    {porAdmin.map((_a, i) => (
                                        <Cell key={i} fill={ADMIN_COLORS[i % ADMIN_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
