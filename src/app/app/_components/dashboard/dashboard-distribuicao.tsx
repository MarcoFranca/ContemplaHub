"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";

type Item = { label: string; value: number };

const STATUS_COLORS: Record<string, string> = {
    Ativas: "#10b981",
    Contempladas: "#38bdf8",
    Canceladas: "#f43f5e",
    Outras: "#64748b",
};

const PRODUTO_COLORS = ["#a78bfa", "#f59e0b", "#22d3ee", "#64748b"];

const tooltipStyle = {
    backgroundColor: "rgb(15 23 42)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    fontSize: 12,
    color: "#e2e8f0",
};

function Donut({
    title,
    items,
    colorFor,
}: {
    title: string;
    items: Item[];
    colorFor: (label: string, index: number) => string;
}) {
    const total = items.reduce((acc, i) => acc + i.value, 0);

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {total === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Sem dados.</p>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="relative h-36 w-36 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Pie
                                    data={items}
                                    dataKey="value"
                                    nameKey="label"
                                    innerRadius={46}
                                    outerRadius={68}
                                    paddingAngle={2}
                                    stroke="none"
                                >
                                    {items.map((it, idx) => (
                                        <Cell key={it.label} fill={colorFor(it.label, idx)} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-semibold leading-none tabular-nums">{total}</span>
                            <span className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                                total
                            </span>
                        </div>
                    </div>
                    <ul className="w-full space-y-1.5">
                        {items.map((it, idx) => (
                            <li key={it.label} className="flex items-center justify-between gap-2 text-sm">
                                <span className="inline-flex min-w-0 items-center gap-2">
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                        style={{ background: colorFor(it.label, idx) }}
                                    />
                                    <span className="truncate">{it.label}</span>
                                </span>
                                <span className="shrink-0 font-medium tabular-nums">
                                    {it.value}
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        ({Math.round((it.value / total) * 100)}%)
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export function DashboardDistribuicao({
    porStatus,
    porProduto,
}: {
    porStatus: Item[];
    porProduto: Item[];
}) {
    return (
        <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="space-y-1">
                <h2 className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
                    <PieIcon className="h-5 w-5 text-emerald-400" />
                    Distribuição da carteira
                </h2>
                <p className="text-sm text-muted-foreground">
                    Situação das cotas e mix de produtos em operação.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <Donut title="Por situação" items={porStatus} colorFor={(l) => STATUS_COLORS[l] ?? "#64748b"} />
                <Donut
                    title="Por produto (em operação)"
                    items={porProduto}
                    colorFor={(_l, i) => PRODUTO_COLORS[i % PRODUTO_COLORS.length]}
                />
            </div>
        </div>
    );
}
