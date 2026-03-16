"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LanceActions } from "./lance-actions";
import { StrategyPanel } from "./strategy-panel";
import type { LanceCartaListItem, StatusMes } from "../types";

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

function statusMesOrder(status: StatusMes) {
    switch (status) {
        case "pendente":
            return 0;
        case "planejado":
            return 1;
        case "feito":
            return 2;
        case "sem_lance":
            return 3;
        case "contemplada":
            return 4;
        case "cancelada":
            return 5;
        default:
            return 99;
    }
}

function isFeito(statusMes: StatusMes) {
    return statusMes === "feito";
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

        const aAsm = a.assembleia_prevista ? new Date(`${a.assembleia_prevista}T00:00:00`).getTime() : Infinity;
        const bAsm = b.assembleia_prevista ? new Date(`${b.assembleia_prevista}T00:00:00`).getTime() : Infinity;
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

function CartaCard({
                       item,
                       competencia,
                   }: {
    item: LanceCartaListItem;
    competencia: string;
}) {
    return (
        <div className={`rounded-xl border p-4 space-y-4 ${cardClass(item)}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">
                            Grupo {item.grupo_codigo} • Cota {item.numero_cota}
                        </h4>

                        <Badge variant={statusVariant(item.status)}>
                            {item.status}
                        </Badge>

                        <Badge variant={statusVariant(item.status_mes)}>
                            {item.status_mes}
                        </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground capitalize">
                        {item.produto} • {money(item.valor_carta)}
                    </p>
                </div>

                <Link
                    href={`/app/lances/${item.cota_id}?competencia=${competencia}`}
                    className="text-xs text-emerald-400 hover:underline"
                >
                    Ver detalhe da carta
                </Link>
            </div>

            <div className="grid gap-3 xl:grid-cols-[0.9fr_1.1fr_0.9fr]">
                <div className="space-y-3">
                    <div className="rounded-lg border border-white/10 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Assembleia
                        </p>

                        {item.tem_pendencia_configuracao ? (
                            <p className="mt-1 text-sm text-amber-500">Sem regra configurada</p>
                        ) : (
                            <>
                                <p className="mt-1 font-medium">{fmtDate(item.assembleia_prevista)}</p>
                                <p className="text-xs text-muted-foreground">
                                    origem: {item.assembleia_dia_origem || "—"}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="rounded-lg border border-white/10 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Resumo da carta
                        </p>

                        <div className="mt-2 space-y-1 text-sm">
                            <div className="flex items-center justify-between gap-2">
                                <span>Cliente</span>
                                <strong className="text-right">{item.cliente_nome || "—"}</strong>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <span>Operadora</span>
                                <strong className="text-right">{item.administradora_nome || "—"}</strong>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <span>Valor carta</span>
                                <strong className="text-right">{money(item.valor_carta)}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <StrategyPanel item={item} />

                <div className="rounded-lg border border-white/10 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Ações
                    </p>

                    <div className="mt-3">
                        <LanceActions item={item} competencia={competencia} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function LancesTable({ items, competencia }: Props) {
    const [hideFeitos, setHideFeitos] = React.useState(false);

    const filteredItems = React.useMemo(() => {
        if (!hideFeitos) return items;
        return items.filter((item) => !isFeito(item.status_mes));
    }, [items, hideFeitos]);

    const groups = React.useMemo(() => buildGroups(filteredItems), [filteredItems]);

    if (!items.length) {
        return (
            <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                Nenhuma carta encontrada com os filtros atuais.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm text-muted-foreground">
                    Visualização agrupada por operadora e cliente.
                </div>

                <Button
                    type="button"
                    variant={hideFeitos ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHideFeitos((prev) => !prev)}
                >
                    {hideFeitos ? "Mostrando só pendentes" : "Ocultar feitas do mês"}
                </Button>
            </div>

            {!groups.length && (
                <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                    Nenhuma carta restante após aplicar a visualização atual.
                </div>
            )}

            {groups.map((group) => (
                <section key={group.operadora} className="space-y-4">
                    <div className="rounded-xl border bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h3 className="text-lg font-semibold">{group.operadora}</h3>
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
                                className="rounded-2xl border border-white/10 bg-background/40 p-4 space-y-4"
                            >
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <div>
                                        <h4 className="text-base font-semibold">{clienteGroup.cliente}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {clienteGroup.items.length} carta(s) nesta operadora
                                        </p>
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="outline">
                                            Pendentes: {clienteGroup.items.filter((i) => i.status_mes === "pendente").length}
                                        </Badge>
                                        <Badge variant="outline">
                                            Planejadas: {clienteGroup.items.filter((i) => i.status_mes === "planejado").length}
                                        </Badge>
                                        <Badge variant="outline">
                                            Feitas: {clienteGroup.items.filter((i) => i.status_mes === "feito").length}
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