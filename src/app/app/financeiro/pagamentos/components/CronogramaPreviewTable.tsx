"use client";

import { CalendarRange, CircleDollarSign, HandCoins, Percent, ShieldCheck } from "lucide-react";

import type { FinanceiroCronogramaPreviewItem } from "../types";

type CronogramaPreviewTableProps = {
    items: FinanceiroCronogramaPreviewItem[];
};

export function CronogramaPreviewTable({ items }: CronogramaPreviewTableProps) {
    if (!items.length) {
        return (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
                Configure a comissao para visualizar o cronograma previsto.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
            <div className="grid grid-cols-[2.5rem_1fr_3.5rem_5rem_1fr_1fr_1fr_1fr] gap-2 border-b border-white/10 bg-slate-950/40 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <span>#</span>
                <span>Evento</span>
                <span>Offset</span>
                <span>% Comissão</span>
                <span>Total bruto</span>
                <span>Parceiro bruto</span>
                <span>Imposto</span>
                <span>Empresa líq.</span>
            </div>

            <div className="divide-y divide-white/5">
                {items.map((item) => (
                    <div
                        key={`${item.ordem}-${item.tipo_evento}-${item.offset_meses}`}
                        className="grid grid-cols-[2.5rem_1fr_3.5rem_5rem_1fr_1fr_1fr_1fr] items-center gap-2 px-4 py-2.5 text-sm text-slate-200"
                    >
                        <Cell icon={CalendarRange} value={`#${item.ordem}`} />
                        <Cell value={labelEvento(item.tipo_evento)} />
                        <Cell value={`${item.offset_meses}`} />
                        <Cell icon={Percent} value={`${item.percentual_comissao.toFixed(4)}%`} />
                        <Cell icon={CircleDollarSign} value={formatMoney(item.valor_total)} />
                        <Cell icon={HandCoins} value={formatMoney(item.parceiro_bruto)} />
                        <Cell icon={ShieldCheck} value={formatMoney(item.parceiro_imposto)} />
                        <Cell icon={CircleDollarSign} value={formatMoney(item.empresa_liquida)} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function Cell({
    value,
    icon: Icon,
}: {
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className="flex min-w-0 items-center gap-2">
            {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-300" /> : null}
            <span className="truncate">{value}</span>
        </div>
    );
}

function labelEvento(value: string) {
    const map: Record<string, string> = {
        adesao: "Após alocação",
        primeira_cobranca_valida: "1ª Cobrança",
        proxima_cobranca: "Próx. Cobrança",
        contemplacao: "Contemplação",
        manual: "Manual",
    };
    return map[value] ?? value;
}

function formatMoney(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value || 0);
}
