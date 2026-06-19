import Link from "next/link";
import { Briefcase, CircleDollarSign, Coins, Layers, Wallet } from "lucide-react";
import { formatCurrencyBRL } from "./leadUtils";

export type ResumoExecutivo = {
    totalCartas: number;
    cartasAtivas: number;
    carteiraSobGestao: number;
    comissaoPrevista: number;
    comissaoPaga: number;
    totalContratos: number;
};

function Kpi({
    icon,
    label,
    value,
    hint,
    accent,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    hint?: string;
    accent?: boolean;
}) {
    return (
        <div
            className={`rounded-2xl border p-4 ${
                accent ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/10 bg-white/5"
            }`}
        >
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                {icon}
                {label}
            </div>
            <div className={`mt-1 text-xl font-semibold ${accent ? "text-emerald-200" : "text-foreground"}`}>
                {value}
            </div>
            {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
        </div>
    );
}

export function ClienteResumoExecutivo({ resumo }: { resumo: ResumoExecutivo }) {
    return (
        <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <Briefcase className="h-4 w-4 text-emerald-400" />
                    Panorama do cliente
                </h2>
                <Link href="/app/lances" className="text-xs text-emerald-400 hover:underline">
                    Abrir operação de lances
                </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi
                    accent
                    icon={<Wallet className="h-3.5 w-3.5 text-emerald-300" />}
                    label="Carteira sob gestão"
                    value={formatCurrencyBRL(resumo.carteiraSobGestao)}
                    hint="Crédito das cartas em operação"
                />
                <Kpi
                    icon={<Layers className="h-3.5 w-3.5 text-emerald-300" />}
                    label="Cartas"
                    value={`${resumo.cartasAtivas}/${resumo.totalCartas}`}
                    hint={`ativas/total · ${resumo.totalContratos} contrato(s)`}
                />
                <Kpi
                    icon={<CircleDollarSign className="h-3.5 w-3.5 text-emerald-300" />}
                    label="Comissão prevista"
                    value={formatCurrencyBRL(resumo.comissaoPrevista)}
                    hint="Total projetado nas cartas"
                />
                <Kpi
                    icon={<Coins className="h-3.5 w-3.5 text-emerald-300" />}
                    label="Comissão paga"
                    value={formatCurrencyBRL(resumo.comissaoPaga)}
                    hint="Já liquidada"
                />
            </div>
        </section>
    );
}
