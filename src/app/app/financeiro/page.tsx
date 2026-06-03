import Link from "next/link";
import { ArrowUpRight, CircleDollarSign, Clock3, Landmark, ShieldAlert } from "lucide-react";

import { listComissaoLancamentosAction } from "@/app/app/comissoes/actions";
import type { ComissaoLancamento } from "@/app/app/comissoes/types";
import { getCurrentProfile } from "@/lib/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function FinanceiroOverviewPage() {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) {
        return <main className="p-6">Vincule-se a uma organização.</main>;
    }

    const data = await listComissaoLancamentosAction();
    const resumo = buildOverview(data.items);

    return (
        <div className="h-full overflow-y-auto px-4 py-6 pb-10 md:px-6">
            <div className="grid gap-6">
                <section className="grid gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.45)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="grid gap-2">
                            <Badge className="w-fit border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-300">
                                Panorama financeiro
                            </Badge>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-white">Comissões da empresa e repasses em uma visão só</h1>
                                <p className="max-w-4xl text-sm leading-6 text-slate-400">
                                    Acompanhe o que já foi pago, o que temos a receber, o que está travado por inadimplência e o que foi cancelado,
                                    com leitura mensal de projeção e realizado.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button asChild className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                                <Link href="/app/financeiro/pagamentos">
                                    Ir para pagamentos
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]">
                                <Link href="/app/comissoes">Abrir lançamentos</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <MetricCard title="Empresa a receber" value={formatMoney(resumo.empresaDisponivel)} helper="Parcelas liberadas para recebimento" icon={<CircleDollarSign className="h-5 w-5 text-emerald-300" />} />
                        <MetricCard title="Parceiro pendente" value={formatMoney(resumo.parceiroPendente)} helper="Repasse ainda não pago ao parceiro" icon={<Landmark className="h-5 w-5 text-cyan-300" />} />
                        <MetricCard title="Travado por pendência" value={formatMoney(resumo.previsto)} helper="Previsto mas ainda sem liberação financeira" icon={<Clock3 className="h-5 w-5 text-amber-300" />} />
                        <MetricCard title="Cancelado" value={formatMoney(resumo.cancelado)} helper="Receita interrompida por cancelamento" icon={<ShieldAlert className="h-5 w-5 text-rose-300" />} />
                    </div>
                </section>

                <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
                    <Card className="border-white/10 bg-slate-900/70 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg">Timeline mensal de comissões</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-[1.1fr_repeat(4,minmax(0,1fr))] gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                <span>Mês</span>
                                <span>Projetado</span>
                                <span>Pago</span>
                                <span>Pendente</span>
                                <span>Cancelado</span>
                            </div>

                            <div className="grid gap-3">
                                {resumo.timeline.length ? (
                                    resumo.timeline.map((row) => (
                                        <div key={row.label} className="grid grid-cols-[1.1fr_repeat(4,minmax(0,1fr))] gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                            <div className="grid gap-1">
                                                <span className="text-sm font-medium text-white">{row.label}</span>
                                                <span className="text-xs text-slate-500">{row.totalItens} lançamentos</span>
                                            </div>
                                            <BarCell value={row.projetado} max={resumo.timelineMax} tone="slate" />
                                            <BarCell value={row.pago} max={resumo.timelineMax} tone="emerald" />
                                            <BarCell value={row.pendente} max={resumo.timelineMax} tone="amber" />
                                            <BarCell value={row.cancelado} max={resumo.timelineMax} tone="rose" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
                                        Ainda não há lançamentos suficientes para montar a timeline financeira.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-slate-900/70 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg">Leitura operacional</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <InsightRow
                                label="Já pago"
                                value={formatMoney(resumo.pago)}
                                hint="Empresa e parceiros já liquidados"
                            />
                            <InsightRow
                                label="A receber"
                                value={formatMoney(resumo.disponivel)}
                                hint="Comissão liberada aguardando baixa financeira"
                            />
                            <InsightRow
                                label="Projetado mês a mês"
                                value={formatMoney(resumo.projetado)}
                                hint="Carteira prevista considerando o cronograma confirmado"
                            />
                            <InsightRow
                                label="Pendente por falta de pagamento"
                                value={formatMoney(resumo.previsto)}
                                hint="Competências ainda sem pagamento elegível ou bloqueadas"
                            />
                            <InsightRow
                                label="Repasse parceiro pendente"
                                value={formatMoney(resumo.parceiroPendente)}
                                hint={`${resumo.repassesPendentes} repasses pendentes`}
                            />
                            <InsightRow
                                label="Cancelado"
                                value={formatMoney(resumo.cancelado)}
                                hint="Parcelas sem expectativa futura de recebimento"
                            />
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}

function buildOverview(items: ComissaoLancamento[]) {
    const byMonth = new Map<string, {
        label: string;
        projetado: number;
        pago: number;
        pendente: number;
        cancelado: number;
        totalItens: number;
    }>();

    let pago = 0;
    let disponivel = 0;
    let previsto = 0;
    let cancelado = 0;
    let parceiroPendente = 0;
    let empresaDisponivel = 0;
    let projetado = 0;
    let repassesPendentes = 0;

    for (const item of items) {
        const valor = Number(item.valor_liquido || 0);
        const monthKey = normalizeMonth(item.competencia_prevista || item.competencia_real || "");
        const monthLabel = monthKey ? formatMonthLabel(monthKey) : "Sem mês";
        const row = byMonth.get(monthKey || "sem-mes") ?? {
            label: monthLabel,
            projetado: 0,
            pago: 0,
            pendente: 0,
            cancelado: 0,
            totalItens: 0,
        };

        row.projetado += valor;
        row.totalItens += 1;
        projetado += valor;

        if (item.status === "pago") {
            pago += valor;
            row.pago += valor;
        } else if (item.status === "disponivel") {
            disponivel += valor;
            row.pendente += valor;
            if (item.beneficiario_tipo === "empresa") {
                empresaDisponivel += valor;
            }
        } else if (item.status === "cancelado") {
            cancelado += valor;
            row.cancelado += valor;
        } else {
            previsto += valor;
            row.pendente += valor;
        }

        if (item.beneficiario_tipo === "parceiro" && item.repasse_status === "pendente") {
            parceiroPendente += valor;
            repassesPendentes += 1;
        }

        byMonth.set(monthKey || "sem-mes", row);
    }

    const timeline = Array.from(byMonth.values()).sort((a, b) => a.label.localeCompare(b.label));
    const timelineMax = Math.max(1, ...timeline.map((item) => Math.max(item.projetado, item.pago, item.pendente, item.cancelado)));

    return {
        pago,
        disponivel,
        previsto,
        cancelado,
        projetado,
        parceiroPendente,
        empresaDisponivel,
        repassesPendentes,
        timeline,
        timelineMax,
    };
}

function normalizeMonth(value: string) {
    if (!value) return "";
    return value.slice(0, 7);
}

function formatMonthLabel(value: string) {
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(date);
}

function MetricCard({
    title,
    value,
    helper,
    icon,
}: {
    title: string;
    value: string;
    helper: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                {icon}
                {title}
            </div>
            <p className="text-xl font-semibold text-white">{value}</p>
            <p className="text-xs text-slate-500">{helper}</p>
        </div>
    );
}

function InsightRow({ label, value, hint }: { label: string; value: string; hint: string }) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="grid gap-1">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-slate-500">{hint}</p>
            </div>
            <p className="text-sm font-semibold text-white">{value}</p>
        </div>
    );
}

function BarCell({ value, max, tone }: { value: number; max: number; tone: "slate" | "emerald" | "amber" | "rose" }) {
    const width = `${Math.max(6, (value / max) * 100)}%`;
    const toneClass =
        tone === "emerald"
            ? "bg-emerald-400/70"
            : tone === "amber"
              ? "bg-amber-400/70"
              : tone === "rose"
                ? "bg-rose-400/70"
                : "bg-slate-400/60";

    return (
        <div className="grid gap-2">
            <span className="text-sm text-slate-200">{formatMoney(value)}</span>
            <div className="h-2 rounded-full bg-white/5">
                <div className={`h-2 rounded-full ${toneClass}`} style={{ width }} />
            </div>
        </div>
    );
}

function formatMoney(value: string | number | null | undefined) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}
