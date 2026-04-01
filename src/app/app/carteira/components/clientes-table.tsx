import {
    CalendarDays,
    Mail,
    Phone,
    UserRound,
    Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { EmptyState } from "./empty-state";
import { ClienteRowActions } from "./clientes-row-actions";
import { contratoBadgeVariant } from "../lib/badges";
import { fmtCurrency, fmtDate } from "../lib/format";
import type { CarteiraClienteItem } from "../lib/types";
import { ClienteCartasSheet } from "@/app/app/carteira/components/cliente-cartas-sheet";

type Option = {
    id: string;
    nome: string;
};

type ClientesTableProps = {
    items: CarteiraClienteItem[];
    administradoras: Option[];
    parceiros?: Option[];
};

function getCarteiraBadgeClass(status?: string | null) {
    switch ((status ?? "").toLowerCase()) {
        case "ativo":
            return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
        case "inativo":
            return "border-amber-500/20 bg-amber-500/10 text-amber-300";
        case "arquivado":
            return "border-slate-500/20 bg-slate-500/10 text-slate-300";
        default:
            return "";
    }
}

export function ClientesTable({
                                  items,
                                  administradoras,
                                  parceiros = [],
                              }: ClientesTableProps) {
    if (items.length === 0) {
        return (
            <EmptyState
                title="Nenhum cliente encontrado"
                message="Ajuste os filtros ou cadastre um novo cliente para começar a montar a carteira."
            />
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="h-12">Cliente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Resumo</TableHead>
                        <TableHead>Última entrada</TableHead>
                        <TableHead className="w-[180px] text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {items.map((it, index) => {
                        const clienteId = String(it.cliente?.lead_id ?? "").trim();
                        const clienteNome = it.cliente?.nome ?? "Cliente sem nome";
                        const clienteTelefone = it.cliente?.telefone ?? undefined;
                        const clienteEmail = it.cliente?.email ?? undefined;
                        const cartas = it.cartas ?? [];
                        const topCartas = cartas.slice(0, 2);

                        return (
                            <TableRow
                                key={clienteId || `cliente-row-${index}`}
                                className="group border-white/10 transition-colors hover:bg-white/[0.03]"
                            >
                                <TableCell className="align-top">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                                            <UserRound className="h-4 w-4 text-emerald-300" />
                                        </div>

                                        <div className="min-w-0 space-y-2">
                                            <div>
                                                <div className="font-medium text-foreground">
                                                    {clienteNome}
                                                </div>

                                                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        {clienteTelefone || "Sem telefone"}
                                                    </span>

                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {clienteEmail || "Sem email"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={`capitalize ${getCarteiraBadgeClass(
                                                        it.cliente?.status_carteira
                                                    )}`}
                                                >
                                                    {it.cliente?.status_carteira ?? "—"}
                                                </Badge>

                                                <Badge variant="secondary" className="capitalize">
                                                    origem: {it.cliente?.origem_entrada ?? "—"}
                                                </Badge>

                                                {it.resumo?.status_contrato_mais_recente ? (
                                                    <Badge
                                                        variant={contratoBadgeVariant(
                                                            it.resumo.status_contrato_mais_recente
                                                        )}
                                                        className="capitalize"
                                                    >
                                                        contrato: {it.resumo.status_contrato_mais_recente}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">sem contrato</Badge>
                                                )}

                                                {it.cliente?.etapa ? (
                                                    <Badge variant="outline" className="capitalize">
                                                        etapa: {it.cliente.etapa}
                                                    </Badge>
                                                ) : null}
                                            </div>

                                            {it.cliente?.observacoes ? (
                                                <p className="max-w-[560px] line-clamp-2 text-xs text-muted-foreground">
                                                    {it.cliente.observacoes}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="space-y-2">
                                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                                Saúde da carteira
                                            </div>

                                            <div className="mt-2 space-y-1 text-sm">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-muted-foreground">Cartas</span>
                                                    <span className="font-medium">
                                                        {it.resumo?.qtd_cartas ?? 0}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-muted-foreground">
                                                        Possui contrato
                                                    </span>
                                                    <span className="font-medium">
                                                        {it.resumo?.possui_contrato ? "Sim" : "Não"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-muted-foreground">
                                                        Maior carta
                                                    </span>
                                                    <span className="font-medium">
                                                        {fmtCurrency(it.resumo?.maior_carta_valor ?? 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="space-y-3">
                                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                                <Wallet className="h-3.5 w-3.5" />
                                                Valor total em cartas
                                            </div>
                                            <div className="mt-2 text-base font-semibold text-foreground">
                                                {fmtCurrency(it.resumo?.valor_total_cartas ?? 0)}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {topCartas.length > 0 ? (
                                                topCartas.map((c, cartaIndex) => (
                                                    <div
                                                        key={c.cota_id || `${clienteId}-mini-carta-${cartaIndex}`}
                                                        className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className="truncate text-sm font-medium">
                                                                    Cota {c.numero_cota ?? "—"}
                                                                </div>
                                                                <div className="truncate text-xs text-muted-foreground">
                                                                    Grupo {c.grupo_codigo ?? "—"} · {c.administradora ?? "—"}
                                                                </div>
                                                            </div>

                                                            <div className="shrink-0 text-right text-xs">
                                                                <div className="font-medium text-foreground">
                                                                    {fmtCurrency(c.valor_carta)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-3 text-sm text-muted-foreground">
                                                    Sem cartas vinculadas no filtro atual.
                                                </div>
                                            )}

                                            {cartas.length > 2 ? (
                                                <div className="flex items-center justify-between rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-2">
                                                    <div className="text-xs text-muted-foreground">
                                                        +{cartas.length - 2} carta(s) adicionais
                                                    </div>

                                                    <ClienteCartasSheet
                                                        clienteNome={clienteNome}
                                                        cartas={cartas}
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            {fmtDate(it.cliente?.entered_at)}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="flex justify-end">
                                        <ClienteRowActions
                                            clienteId={clienteId}
                                            clienteNome={clienteNome}
                                            clienteTelefone={clienteTelefone}
                                            clienteEmail={clienteEmail}
                                            administradoras={administradoras}
                                            parceiros={parceiros}
                                            compact
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}