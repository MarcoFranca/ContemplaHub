"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

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

export function PartnerHomeChart({ data }: { data: { label: string; valor: number }[] }) {
    if (data.length === 0) {
        return (
            <p className="py-10 text-center text-sm text-muted-foreground">
                Sem dados de comissão para exibir.
            </p>
        );
    }

    return (
        <div style={{ height: 260 }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
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
                        formatter={(v: number) => [brlFull(v), "Líquido"]}
                        labelFormatter={(l) => `Mês: ${l}`}
                    />
                    <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
