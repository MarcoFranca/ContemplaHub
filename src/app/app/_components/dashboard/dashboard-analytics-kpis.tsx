import { Briefcase, Receipt, Percent } from "lucide-react";
import type { DashboardAnalytics } from "../../_data/dashboard/get-dashboard-data";

function brl(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
    }).format(value);
}

export function DashboardAnalyticsKpis({ analytics }: { analytics: DashboardAnalytics }) {
    const cards = [
        {
            title: "Carteira sob gestão",
            value: brl(analytics.carteiraSobGestao),
            hint: "Soma do crédito das cotas em operação",
            icon: <Briefcase className="h-5 w-5 text-emerald-400" />,
        },
        {
            title: "Ticket médio da carta",
            value: brl(analytics.ticketMedioCarta),
            hint: "Crédito médio por cota ativa",
            icon: <Receipt className="h-5 w-5 text-sky-400" />,
        },
        {
            title: "Conversão lead → contrato",
            value: `${analytics.taxaConversao}%`,
            hint: `${analytics.contratosNoMes} contrato(s) no mês`,
            icon: <Percent className="h-5 w-5 text-violet-400" />,
        },
    ];

    return (
        <section className="grid gap-4 sm:grid-cols-3">
            {cards.map((c) => (
                <div key={c.title} className="rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{c.title}</p>
                            <p className="text-2xl font-semibold tracking-tight">{c.value}</p>
                        </div>
                        <span className="rounded-xl border border-white/10 bg-white/5 p-2">{c.icon}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{c.hint}</p>
                </div>
            ))}
        </section>
    );
}
