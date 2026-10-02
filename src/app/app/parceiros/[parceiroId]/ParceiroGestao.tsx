import Link from "next/link";
import { Users, CreditCard, Wallet, TrendingUp, CheckCircle2, Clock } from "lucide-react";

export type GestaoCliente = {
    cliente_nome: string;
    leadId?: string | null;
    cartas: number;
    valorCartas: number;
    comissaoLiq: number;
    repassado: number;
    aRepassar: number;
};

export type GestaoKpis = {
    clientes: number;
    cartas: number;
    valorCartas: number;
    comissaoLiq: number;
    repassado: number;
    aRepassar: number;
    ticketMedio: number;
};

const money = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);

function Kpi({ icon, label, valor, sub, tone }: { icon: React.ReactNode; label: string; valor: string; sub?: string; tone?: "pago" | "pendente" }) {
    const cls = tone === "pago" ? "text-emerald-300" : tone === "pendente" ? "text-amber-300" : "text-foreground";
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                <span className="text-emerald-400">{icon}</span>
                {label}
            </div>
            <p className={`mt-1.5 text-xl font-bold tabular-nums ${cls}`}>{valor}</p>
            {sub ? <p className="text-[11px] text-muted-foreground">{sub}</p> : null}
        </div>
    );
}

export function ParceiroGestao({ kpis, clientes }: { kpis: GestaoKpis; clientes: GestaoCliente[] }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Kpi icon={<Users className="h-4 w-4" />} label="Clientes" valor={String(kpis.clientes)} sub={`${kpis.cartas} carta${kpis.cartas !== 1 ? "s" : ""}`} />
                <Kpi icon={<Wallet className="h-4 w-4" />} label="Valor em cartas" valor={money(kpis.valorCartas)} sub={`Ticket médio ${money(kpis.ticketMedio)}`} />
                <Kpi icon={<TrendingUp className="h-4 w-4" />} label="Comissão do parceiro (líq.)" valor={money(kpis.comissaoLiq)} />
                <Kpi icon={<CreditCard className="h-4 w-4" />} label="Cartas" valor={String(kpis.cartas)} />
                <Kpi icon={<CheckCircle2 className="h-4 w-4" />} label="Já repassado" valor={money(kpis.repassado)} tone="pago" />
                <Kpi icon={<Clock className="h-4 w-4" />} label="A repassar (total)" valor={money(kpis.aRepassar)} tone="pendente" />
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="grid grid-cols-[1.6fr_4rem_1fr_1fr_1fr_1fr] gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>Cliente</span>
                    <span className="text-center">Cartas</span>
                    <span className="text-right">Valor em cartas</span>
                    <span className="text-right">Comissão líq.</span>
                    <span className="text-right">Repassado</span>
                    <span className="text-right">A repassar</span>
                </div>
                {clientes.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum cliente vinculado.</p>
                ) : (
                    clientes.map((c) => (
                        <div
                            key={c.cliente_nome}
                            className="grid grid-cols-[1.6fr_4rem_1fr_1fr_1fr_1fr] items-center gap-3 border-b border-white/5 px-4 py-2.5 text-sm last:border-0"
                        >
                            <span className="min-w-0 truncate font-medium text-foreground">
                                {c.leadId ? (
                                    <Link href={`/app/leads/${c.leadId}`} className="hover:text-emerald-300 hover:underline">
                                        {c.cliente_nome}
                                    </Link>
                                ) : (
                                    c.cliente_nome
                                )}
                            </span>
                            <span className="text-center tabular-nums text-muted-foreground">{c.cartas}</span>
                            <span className="text-right tabular-nums text-foreground">{money(c.valorCartas)}</span>
                            <span className="text-right tabular-nums text-foreground">{money(c.comissaoLiq)}</span>
                            <span className="text-right tabular-nums text-emerald-300">{money(c.repassado)}</span>
                            <span className="text-right tabular-nums text-amber-300">{money(c.aRepassar)}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
