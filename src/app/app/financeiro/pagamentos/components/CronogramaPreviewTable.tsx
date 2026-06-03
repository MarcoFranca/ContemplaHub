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
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
            <div className="grid grid-cols-[0.6fr_1fr_0.7fr_0.9fr_1fr_1fr_1fr_1fr] gap-3 border-b border-white/10 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                <span>Parcela</span>
                <span>Evento</span>
                <span>Offset</span>
                <span>% comissao</span>
                <span>Total bruto</span>
                <span>Parceiro bruto</span>
                <span>Imposto parceiro</span>
                <span>Empresa liquida</span>
            </div>

            <div className="divide-y divide-white/5">
                {items.map((item) => (
                    <div
                        key={`${item.ordem}-${item.tipo_evento}-${item.offset_meses}`}
                        className="grid grid-cols-[0.6fr_1fr_0.7fr_0.9fr_1fr_1fr_1fr_1fr] gap-3 px-4 py-4 text-sm text-slate-200"
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
        adesao: "Apos alocacao",
        primeira_cobranca_valida: "Primeira cobranca",
        proxima_cobranca: "Proxima cobranca",
        contemplacao: "Contemplacao",
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
