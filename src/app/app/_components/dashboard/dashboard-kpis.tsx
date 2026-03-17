import Link from "next/link";
import {
    BadgeDollarSign,
    CalendarClock,
    ClipboardList,
    FileText,
    Target,
    Users,
} from "lucide-react";

type Summary = {
    leadsNovos: number;
    diagnosticosConcluidos: number;
    propostasAtivas: number;
    contratosFechados: number;
    cotasEmOperacao: number;
    comissaoPrevistaMes: number;
    delta: {
        leadsNovos: number;
        diagnosticosConcluidos: number;
        propostasAtivas: number;
        contratosFechados: number;
        cotasEmOperacao: number;
        comissaoPrevistaMes: number;
    };
};

function formatBRL(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function formatDelta(value: number) {
    const prefix = value > 0 ? "+" : "";
    return `${prefix}${value}%`;
}

function KpiCard({
                     title,
                     value,
                     delta,
                     icon,
                     href,
                 }: {
    title: string;
    value: string;
    delta: string;
    icon: React.ReactNode;
    href: string;
}) {
    return (
        <Link href={href} className="block">
            <div className="rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-3xl font-semibold tracking-tight">{value}</p>
                    </div>
                    <div className="rounded-xl border bg-muted/40 p-2 text-muted-foreground">
                        {icon}
                    </div>
                </div>

                <div className="mt-4 text-sm text-emerald-600">{delta}</div>
            </div>
        </Link>
    );
}

export function DashboardKpis({ summary }: { summary: Summary }) {
    const cards = [
        {
            title: "Leads novos",
            value: String(summary.leadsNovos),
            delta: formatDelta(summary.delta.leadsNovos),
            icon: <Users className="h-5 w-5" />,
            href: "/app/carteira",
        },
        {
            title: "Diagnósticos concluídos",
            value: String(summary.diagnosticosConcluidos),
            delta: formatDelta(summary.delta.diagnosticosConcluidos),
            icon: <ClipboardList className="h-5 w-5" />,
            href: "/app/carteira",
        },
        {
            title: "Propostas ativas",
            value: String(summary.propostasAtivas),
            delta: formatDelta(summary.delta.propostasAtivas),
            icon: <FileText className="h-5 w-5" />,
            href: "/app/carteira",
        },
        {
            title: "Contratos fechados",
            value: String(summary.contratosFechados),
            delta: formatDelta(summary.delta.contratosFechados),
            icon: <Target className="h-5 w-5" />,
            href: "/app/contratos",
        },
        {
            title: "Cotas em operação",
            value: String(summary.cotasEmOperacao),
            delta: formatDelta(summary.delta.cotasEmOperacao),
            icon: <CalendarClock className="h-5 w-5" />,
            href: "/app/lances",
        },
        {
            title: "Comissão prevista no mês",
            value: formatBRL(summary.comissaoPrevistaMes),
            delta: formatDelta(summary.delta.comissaoPrevistaMes),
            icon: <BadgeDollarSign className="h-5 w-5" />,
            href: "/app/comissoes",
        },
    ];

    return (
        <section className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Visão geral da operação</h2>
                <p className="text-sm text-muted-foreground">
                    Comercial, cotas em operação e financeiro do mês em uma leitura rápida.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                    <KpiCard key={card.title} {...card} />
                ))}
            </div>
        </section>
    );
}