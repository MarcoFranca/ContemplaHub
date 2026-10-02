"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
    CheckCircle2,
    AlertTriangle,
    Undo2,
    Loader2,
    ChevronDown,
    ChevronRight,
    Wallet,
    ExternalLink,
    CalendarClock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    marcarRepassesPagosLoteAction,
    marcarParaCobrancaAction,
    removerFlagCobrancaAction,
} from "@/app/app/comissoes/actions";

export type RepasseItem = {
    id: string;
    cliente_nome: string;
    numero_cota: string;
    grupo_codigo: string;
    contrato_id: string;
    competencia: string | null;
    valor: number;
};

export type ClienteGrupo = {
    cliente_nome: string;
    total: number;
    items: RepasseItem[];
};

type Props = {
    refreshPath: string;
    aPagar: ClienteGrupo[];
    emAtraso: RepasseItem[];
    totalAPagar: number;
    qtdAPagar: number;
    cartasSlot?: React.ReactNode;
};

const money = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const nowMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const monthKey = (iso?: string | null) => (iso || "").slice(0, 7);
const monthLabel = (key: string) => {
    if (!key) return "Sem competência";
    const [y, m] = key.split("-");
    const s = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
        new Date(Number(y), Number(m) - 1, 1),
    );
    return s.charAt(0).toUpperCase() + s.slice(1);
};

type MesGrupo = { key: string; total: number; items: RepasseItem[] };

function agruparPorMes(items: RepasseItem[]): MesGrupo[] {
    const mapa = new Map<string, MesGrupo>();
    for (const it of items) {
        const k = monthKey(it.competencia);
        const g = mapa.get(k) ?? { key: k, total: 0, items: [] };
        g.items.push(it);
        g.total += it.valor;
        mapa.set(k, g);
    }
    return Array.from(mapa.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export function ParceiroRepasses({ refreshPath, aPagar, emAtraso, totalAPagar, qtdAPagar, cartasSlot }: Props) {
    const router = useRouter();
    const [busy, setBusy] = React.useState<string | null>(null);
    const [mesAberto, setMesAberto] = React.useState<Record<string, boolean>>({});
    const mesAtual = nowMonth();

    const run = async (key: string, fn: () => Promise<unknown>, okMsg?: string) => {
        setBusy(key);
        try {
            await fn();
            if (okMsg) toast.success(okMsg);
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Erro.");
        } finally {
            setBusy(null);
        }
    };
    const pagar = (ids: string[], msg: string) =>
        run(ids.join(","), () => marcarRepassesPagosLoteAction(ids, refreshPath), msg);

    const todosIds = aPagar.flatMap((g) => g.items.map((i) => i.id));
    const totalCotas = new Set(aPagar.flatMap((g) => g.items.map((i) => i.numero_cota))).size;

    return (
        <div className="space-y-6">
            {/* Resumo + ação geral */}
            <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80">A pagar até este mês</p>
                    <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">{money(totalAPagar)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {qtdAPagar} repasse{qtdAPagar !== 1 ? "s" : ""} · {aPagar.length} cliente{aPagar.length !== 1 ? "s" : ""} · {totalCotas} cota{totalCotas !== 1 ? "s" : ""}
                    </p>
                </div>
                {todosIds.length > 0 && (
                    <Button
                        size="lg"
                        onClick={() => pagar(todosIds, "Repasses marcados como pagos.")}
                        disabled={busy !== null}
                        className="bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                        {busy === todosIds.join(",") ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                        Pagar tudo ({money(totalAPagar)})
                    </Button>
                )}
            </div>

            {cartasSlot}

            {aPagar.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-muted-foreground">
                    Tudo em dia. Nenhum repasse a pagar até este mês.
                </div>
            ) : (
                aPagar.map((cliente) => {
                    const meses = agruparPorMes(cliente.items);
                    return (
                        <div key={cliente.cliente_nome} className="space-y-2">
                            {/* Cabeçalho do cliente */}
                            <div className="flex items-center justify-between gap-3 px-1">
                                <h3 className="truncate text-base font-semibold text-foreground">{cliente.cliente_nome}</h3>
                                <div className="flex shrink-0 items-center gap-3">
                                    <span className="text-sm font-semibold tabular-nums text-muted-foreground">{money(cliente.total)}</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-emerald-300 hover:bg-emerald-500/10"
                                        onClick={() => pagar(cliente.items.map((i) => i.id), `Repasses de ${cliente.cliente_nome} pagos.`)}
                                        disabled={busy !== null}
                                    >
                                        Pagar tudo do cliente
                                    </Button>
                                </div>
                            </div>

                            {/* Cartões de mês */}
                            <div className="grid gap-2">
                                {meses.map((m) => {
                                    const vencido = m.key < mesAtual;
                                    const ids = m.items.map((i) => i.id);
                                    const aberto = mesAberto[cliente.cliente_nome + m.key] ?? false;
                                    const accent = vencido ? "border-l-amber-400" : "border-l-emerald-400";
                                    return (
                                        <div key={m.key} className={`overflow-hidden rounded-xl border border-white/10 border-l-[3px] ${accent} bg-white/[0.02]`}>
                                            <div className="flex items-center gap-3 px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setMesAberto((p) => ({ ...p, [cliente.cliente_nome + m.key]: !aberto }))}
                                                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                                >
                                                    {aberto ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                                                    <CalendarClock className={`h-4 w-4 shrink-0 ${vencido ? "text-amber-400" : "text-emerald-400"}`} />
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-foreground">{monthLabel(m.key)}</span>
                                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${vencido ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"}`}>
                                                                {vencido ? "Vencido" : "Este mês"}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {m.items.length} cota{m.items.length !== 1 ? "s" : ""}
                                                        </div>
                                                    </div>
                                                </button>
                                                <div className="flex shrink-0 items-center gap-3">
                                                    <span className="text-lg font-bold tabular-nums text-foreground">{money(m.total)}</span>
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 text-white hover:bg-emerald-500"
                                                        onClick={() => pagar(ids, `${monthLabel(m.key)} pago.`)}
                                                        disabled={busy !== null}
                                                    >
                                                        {busy === ids.join(",") ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pagar mês"}
                                                    </Button>
                                                </div>
                                            </div>

                                            {aberto && (
                                                <div className="divide-y divide-white/5 border-t border-white/5 bg-black/10">
                                                    {m.items.map((it) => (
                                                        <div key={it.id} className="flex items-center justify-between gap-3 px-4 py-2 pl-11 text-sm">
                                                            <span className="flex items-center gap-2 text-muted-foreground">
                                                                Cota {it.numero_cota}
                                                                <Link href={`/app/contratos/${it.contrato_id}`} title="Abrir carta" className="text-muted-foreground/50 hover:text-emerald-300">
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </Link>
                                                                <span className="tabular-nums text-foreground">{money(it.valor)}</span>
                                                            </span>
                                                            <div className="flex shrink-0 items-center gap-1">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7 text-emerald-300 hover:bg-emerald-500/15"
                                                                    title="Repasse pago"
                                                                    onClick={() => pagar([it.id], "Repasse pago.")}
                                                                    disabled={busy !== null}
                                                                >
                                                                    {busy === it.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7 text-amber-300 hover:bg-amber-500/15"
                                                                    title="Cliente em atraso"
                                                                    onClick={() => run("atraso-" + it.id, () => marcarParaCobrancaAction(it.id), "Marcado em atraso.")}
                                                                    disabled={busy !== null}
                                                                >
                                                                    {busy === "atraso-" + it.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })
            )}

            {/* Em atraso */}
            {emAtraso.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/[0.05]">
                    <div className="flex items-center gap-2 border-b border-amber-500/15 px-4 py-3">
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-semibold text-amber-200">Em atraso (cliente não pagou)</span>
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-300">{emAtraso.length}</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {emAtraso.map((it) => (
                            <div key={it.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                                <div className="min-w-0 text-sm">
                                    <div className="truncate font-medium text-foreground">{it.cliente_nome}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {monthLabel(monthKey(it.competencia))} · Cota {it.numero_cota} · {money(it.valor)}
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 border-white/10"
                                    title="Cliente regularizou, volta para a lista de pagar"
                                    onClick={() => run("voltar-" + it.id, () => removerFlagCobrancaAction(it.id), "Voltou para a lista de pagar.")}
                                    disabled={busy !== null}
                                >
                                    {busy === "voltar-" + it.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Undo2 className="mr-1 h-3.5 w-3.5" /> Regularizou</>}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export function HistoricoRepasses({ pagos }: { pagos: RepasseItem[] }) {
    const [aberto, setAberto] = React.useState(false);
    const [mesAberto, setMesAberto] = React.useState<Record<string, boolean>>({});
    if (pagos.length === 0) return null;

    const total = pagos.reduce((s, i) => s + i.valor, 0);
    // Agrupa por mês, do mais recente para o mais antigo
    const meses = agruparPorMes(pagos).sort((a, b) => b.key.localeCompare(a.key));

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <button type="button" onClick={() => setAberto((v) => !v)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Wallet className="h-4 w-4 text-emerald-400" />
                    Histórico de repasses pagos
                    <span className="text-muted-foreground">({pagos.length})</span>
                </span>
                <span className="flex items-center gap-2 text-sm font-semibold tabular-nums text-foreground">
                    {money(total)}
                    {aberto ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </span>
            </button>

            {aberto && (
                <div className="space-y-1.5 border-t border-white/5 p-3">
                    {meses.map((m) => {
                        const open = mesAberto[m.key] ?? false;
                        return (
                            <div key={m.key} className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
                                <button
                                    type="button"
                                    onClick={() => setMesAberto((p) => ({ ...p, [m.key]: !open }))}
                                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left"
                                >
                                    <span className="flex items-center gap-2 text-sm">
                                        {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                                        <span className="font-medium text-foreground">{monthLabel(m.key)}</span>
                                        <span className="text-xs text-muted-foreground">{m.items.length} repasse{m.items.length !== 1 ? "s" : ""}</span>
                                    </span>
                                    <span className="font-semibold tabular-nums text-emerald-200/90">{money(m.total)}</span>
                                </button>
                                {open && (
                                    <div className="divide-y divide-white/5 border-t border-white/5 bg-black/10">
                                        {m.items.map((it) => (
                                            <div key={it.id} className="flex items-center justify-between gap-3 px-4 py-2 pl-9 text-sm">
                                                <span className="truncate text-muted-foreground">
                                                    {it.cliente_nome} · Cota {it.numero_cota}
                                                </span>
                                                <span className="tabular-nums text-foreground">{money(it.valor)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
