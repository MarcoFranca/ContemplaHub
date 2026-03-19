"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowUpRight,
    Ban,
    Building2,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Clock3,
    CircleDollarSign,
    FolderKanban,
    LayoutList,
    SendHorizonal,
    UserRound,
    Wallet,
} from "lucide-react";

import { LanceActions } from "./lance-actions";
import { StrategyPanel } from "./strategy-panel";
import { EditCartaQuickAction } from "./edit-carta-quick-action";
import { LanceMesCard } from "./LanceMesCard";
import type { LanceCartaListItem } from "../types";
import {
    filterByOperacaoView,
    getExecucaoLabel,
    statusMesOrder,
    type OperacaoView,
} from "../lib/operacao";

type Props = {
    items: LanceCartaListItem[];
    competencia: string;
};

function money(v?: number | null) {
    if (v == null) return "—";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(v);
}

function fmtDate(v?: string | null) {
    if (!v) return "—";
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: "UTC",
    }).format(new Date(`${v}T00:00:00`));
}

function statusVariant(status: string) {
    switch (status) {
        case "ativa":
        case "feito":
        case "planejado":
            return "default";
        case "contemplada":
            return "secondary";
        case "cancelada":
        case "sem_lance":
            return "outline";
        default:
            return "outline";
    }
}

function cardClass(item: LanceCartaListItem) {
    if (item.status_mes === "feito") {
        return "border-emerald-500/40 bg-emerald-500/5";
    }

    if (item.status_mes === "planejado") {
        return "border-sky-500/30 bg-sky-500/5";
    }

    if (item.status_mes === "pendente") {
        return "border-amber-500/30 bg-amber-500/5";
    }

    if (item.status_mes === "sem_lance") {
        return "border-slate-500/30 bg-slate-500/5";
    }

    return "border-white/10 bg-white/5";
}

function sortItems(items: LanceCartaListItem[]) {
    return [...items].sort((a, b) => {
        const byStatusMes = statusMesOrder(a.status_mes) - statusMesOrder(b.status_mes);
        if (byStatusMes !== 0) return byStatusMes;

        const aAsm = a.assembleia_prevista
            ? new Date(`${a.assembleia_prevista}T00:00:00`).getTime()
            : Number.POSITIVE_INFINITY;
        const bAsm = b.assembleia_prevista
            ? new Date(`${b.assembleia_prevista}T00:00:00`).getTime()
            : Number.POSITIVE_INFINITY;

        if (aAsm !== bAsm) return aAsm - bAsm;

        const byGrupo = a.grupo_codigo.localeCompare(b.grupo_codigo);
        if (byGrupo !== 0) return byGrupo;

        return a.numero_cota.localeCompare(b.numero_cota);
    });
}

type OperadoraGroup = {
    operadora: string;
    clientes: Array<{
        cliente: string;
        items: LanceCartaListItem[];
    }>;
};

function buildGroups(items: LanceCartaListItem[]): OperadoraGroup[] {
    const operadoraMap = new Map<string, Map<string, LanceCartaListItem[]>>();

    for (const item of items) {
        const operadora = item.administradora_nome?.trim() || "Sem operadora";
        const cliente = item.cliente_nome?.trim() || "Cliente sem nome";

        if (!operadoraMap.has(operadora)) {
            operadoraMap.set(operadora, new Map<string, LanceCartaListItem[]>());
        }

        const clientesMap = operadoraMap.get(operadora)!;

        if (!clientesMap.has(cliente)) {
            clientesMap.set(cliente, []);
        }

        clientesMap.get(cliente)!.push(item);
    }

    return Array.from(operadoraMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([operadora, clientesMap]) => ({
            operadora,
            clientes: Array.from(clientesMap.entries())
                .map(([cliente, clienteItems]) => ({
                    cliente,
                    items: sortItems(clienteItems),
                }))
                .sort((a, b) => a.cliente.localeCompare(b.cliente)),
        }));
}

function OperacaoTabs({
                          value,
                          onChange,
                      }: {
    value: OperacaoView;
    onChange: (value: OperacaoView) => void;
}) {
    const tabs: Array<{
        value: OperacaoView;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
    }> = [
        { value: "pendentes", label: "Pendentes", icon: Clock3 },
        { value: "planejados", label: "Planejados", icon: SendHorizonal },
        { value: "baixados", label: "Baixados", icon: ClipboardCheck },
        { value: "sem_lance", label: "Sem lance", icon: Ban },
        { value: "todas", label: "Todas", icon: LayoutList },
    ];

    return (
        <div className="-mx-1 overflow-x-auto px-1">
            <div className="flex w-max gap-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;

                    return (
                        <Button
                            key={tab.value}
                            type="button"
                            size="sm"
                            variant={value === tab.value ? "default" : "outline"}
                            onClick={() => onChange(tab.value)}
                            className="inline-flex items-center gap-2 whitespace-nowrap"
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}

function CartaCard({
                       item,
                       competencia,
                   }: {
    item: LanceCartaListItem;
    competencia: string;
}) {
    return (
        <div
            className={`rounded-2xl border p-3 shadow-sm transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] sm:p-4 md:p-5 ${cardClass(item)}`}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-white sm:text-base md:text-lg">
                            Grupo {item.grupo_codigo} • Cota {item.numero_cota}
                        </h4>

                        <Badge variant={statusVariant(item.status)}>{item.status}</Badge>

                        <Badge variant={statusVariant(item.status_mes)}>
                            {getExecucaoLabel(item)}
                        </Badge>
                    </div>

                    <p className="inline-flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <UserRound className="h-4 w-4" />
                        {item.cliente_nome || "—"}
                        <span className="text-white/30">•</span>
                        <Building2 className="h-4 w-4" />
                        {item.administradora_nome || "—"}
                    </p>

                    <p className="inline-flex items-center gap-2 text-sm text-muted-foreground capitalize">
                        <CircleDollarSign className="h-4 w-4" />
                        {item.produto} • {money(item.valor_carta)}
                    </p>
                </div>

                <Link
                    href={`/app/lances/${item.cota_id}?competencia=${competencia}`}
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                >
                    Ver detalhe da carta
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.2fr_0.95fr]">
                <div className="space-y-3">
                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Assembleia
                        </p>

                        {item.tem_pendencia_configuracao ? (
                            <p className="mt-2 text-sm text-amber-500">Sem regra configurada</p>
                        ) : (
                            <>
                                <p className="mt-2 font-medium">{fmtDate(item.assembleia_prevista)}</p>
                                <p className="text-xs text-muted-foreground">
                                    origem: {item.assembleia_dia_origem || "—"}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <ClipboardList className="h-3.5 w-3.5" />
                            Resumo operacional
                        </p>

                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <UserRound className="h-4 w-4" />
                  Cliente
                </span>
                                <strong>{item.cliente_nome || "—"}</strong>
                            </div>

                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  Operadora
                </span>
                                <strong>{item.administradora_nome || "—"}</strong>
                            </div>

                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  Valor carta
                </span>
                                <strong>{money(item.valor_carta)}</strong>
                            </div>

                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  Status do mês
                </span>
                                <strong>{getExecucaoLabel(item)}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <LanceMesCard item={item} />
                    <StrategyPanel item={item} />
                </div>

                <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 md:border-white/10 md:bg-black/10">
                    <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                        <FolderKanban className="h-3.5 w-3.5" />
                        Ações
                    </p>

                    <EditCartaQuickAction item={item} competencia={competencia} />

                    <div className="pt-1">
                        <LanceActions item={item} competencia={competencia} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function LancesTable({ items, competencia }: Props) {
    const [view, setView] = React.useState<OperacaoView>("pendentes");
    const [hideBaixados, setHideBaixados] = React.useState(false);

    const filteredItems = React.useMemo(() => {
        const base = filterByOperacaoView(items, view);

        if (!hideBaixados) return base;
        return base.filter((item) => item.status_mes !== "feito");
    }, [items, view, hideBaixados]);

    const groups = React.useMemo(() => buildGroups(filteredItems), [filteredItems]);

    if (!items.length) {
        return (
            <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                Nenhuma carta encontrada com os filtros atuais.
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                        Gestão operacional do lance do mês por operadora e cliente.
                    </div>

                    <div className="flex flex-col gap-2 sm:items-end">
                        <OperacaoTabs value={view} onChange={setView} />

                        <Button
                            type="button"
                            variant={hideBaixados ? "default" : "outline"}
                            size="sm"
                            onClick={() => setHideBaixados((prev) => !prev)}
                            className="w-full sm:w-auto"
                        >
                            {hideBaixados ? "Ocultando baixados" : "Ocultar baixados"}
                        </Button>
                    </div>
                </div>
            </div>

            {!groups.length && (
                <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                    Nenhuma carta restante após aplicar a visualização atual.
                </div>
            )}

            {groups.map((group) => (
                <section key={group.operadora} className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    {group.operadora}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {group.clientes.reduce((acc, c) => acc + c.items.length, 0)} carta(s) •{" "}
                                    {group.clientes.length} cliente(s)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {group.clientes.map((clienteGroup) => (
                            <div
                                key={`${group.operadora}-${clienteGroup.cliente}`}
                                className="space-y-4 rounded-2xl border border-white/10 bg-background/40 p-4 shadow-sm"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h4 className="inline-flex items-center gap-2 text-base font-semibold">
                                            <UserRound className="h-4 w-4 text-muted-foreground" />
                                            {clienteGroup.cliente}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {clienteGroup.items.length} carta(s) nesta operadora
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">
                                            Pendentes: {clienteGroup.items.filter((i) => i.status_mes === "pendente").length}
                                        </Badge>
                                        <Badge variant="outline">
                                            Planejados: {clienteGroup.items.filter((i) => i.status_mes === "planejado").length}
                                        </Badge>
                                        <Badge variant="outline">
                                            Baixados: {clienteGroup.items.filter((i) => i.status_mes === "feito").length}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {clienteGroup.items.map((item) => (
                                        <CartaCard
                                            key={item.cota_id}
                                            item={item}
                                            competencia={competencia}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}