import Link from "next/link";
import { CalendarDays, FileText, Mail, MessageCircle, Phone, UserRound, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { ClienteCartasSheet } from "@/app/app/carteira/components/cliente-cartas-sheet";

import { buildWhatsAppLink } from "@/lib/formatters";
import { EmptyState } from "./empty-state";
import { ClienteRowActions } from "./clientes-row-actions";
import { contratoBadgeVariant } from "../lib/badges";
import { fmtCurrency, fmtDate, fmtLeadEmail, fmtPhone } from "../lib/format";
import type { CarteiraClienteCartaResumo, CarteiraClienteItem } from "../lib/types";

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

function pickPrimaryCarta(cartas: CarteiraClienteCartaResumo[]) {
    return [...cartas].sort((a, b) => (b.valor_carta ?? 0) - (a.valor_carta ?? 0))[0] ?? null;
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
                message="Ajuste os filtros ou cadastre um novo cliente para comecar a montar a carteira."
            />
        );
    }

    return (
        <div className="overflow-auto rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.025] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
            <Table className="table-fixed">
                <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="h-11 w-[40%] pl-4">Cliente</TableHead>
                        <TableHead className="w-[18%]">Carteira</TableHead>
                        <TableHead className="w-[26%]">Cota principal</TableHead>
                        <TableHead className="w-[12%]">Entrada</TableHead>
                        <TableHead className="w-[132px] pr-4 text-right">Acoes</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {items.map((it, index) => {
                        const clienteId = String(it.cliente?.lead_id ?? "").trim();
                        const clienteNome = it.cliente?.nome ?? "Cliente sem nome";
                        const clienteTelefone = it.cliente?.telefone ?? undefined;
                        const clienteEmail = it.cliente?.email ?? undefined;
                        const phoneLabel = fmtPhone(clienteTelefone) ?? "Sem telefone";
                        const emailLabel = fmtLeadEmail(clienteEmail);
                        const cartas = it.cartas ?? [];
                        const primaryCarta = pickPrimaryCarta(cartas);
                        const extraCartas = Math.max(cartas.length - (primaryCarta ? 1 : 0), 0);

                        return (
                            <TableRow
                                key={clienteId || `cliente-row-${index}`}
                                className="border-white/10 align-top transition-colors hover:bg-white/[0.025]"
                            >
                                <TableCell className="px-4 py-3 align-top">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                                            <UserRound className="h-4 w-4 text-emerald-300" />
                                        </div>

                                        <div className="min-w-0 space-y-2">
                                            <div className="space-y-1">
                                                <div className="break-words text-sm font-semibold text-foreground">
                                                    {clienteNome}
                                                </div>

                                                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                    <span className="inline-flex min-w-0 items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5 shrink-0" />
                                                        <span className="truncate">{phoneLabel}</span>
                                                    </span>

                                                    {emailLabel ? (
                                                        <span className="inline-flex min-w-0 items-center gap-1.5">
                                                            <Mail className="h-3.5 w-3.5 shrink-0" />
                                                            <span className="truncate">{emailLabel}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px]">
                                                            <Mail className="h-3.5 w-3.5 shrink-0" />
                                                            <span className="truncate">
                                                                Contato nao informado na importacao
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5">
                                                <Badge
                                                    variant="outline"
                                                    className={`capitalize ${getCarteiraBadgeClass(it.cliente?.status_carteira)}`}
                                                >
                                                    {it.cliente?.status_carteira ?? "-"}
                                                </Badge>

                                                <Badge variant="secondary" className="capitalize">
                                                    {it.cliente?.origem_entrada ?? "Sem origem"}
                                                </Badge>

                                                {it.resumo?.status_contrato_mais_recente ? (
                                                    <Badge
                                                        variant={contratoBadgeVariant(it.resumo.status_contrato_mais_recente)}
                                                        className="capitalize"
                                                    >
                                                        {it.resumo.status_contrato_mais_recente}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Sem contrato</Badge>
                                                )}

                                                {it.cliente?.etapa ? (
                                                    <Badge variant="outline" className="capitalize">
                                                        {it.cliente.etapa}
                                                    </Badge>
                                                ) : null}
                                            </div>

                                            {it.cliente?.observacoes ? (
                                                <p className="line-clamp-2 max-w-[460px] text-xs text-muted-foreground">
                                                    {it.cliente.observacoes}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="py-3 align-top">
                                    <div className="grid min-w-0 gap-2 rounded-2xl border border-white/10 bg-black/15 p-3 text-sm">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                                    Cartas
                                                </div>
                                                <div className="mt-1 font-semibold text-foreground">
                                                    {it.resumo?.qtd_cartas ?? 0}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                                    Contrato
                                                </div>
                                                <div className="mt-1 font-semibold text-foreground">
                                                    {it.resumo?.possui_contrato ? "Sim" : "Nao"}
                                                </div>
                                            </div>

                                            <div className="col-span-2">
                                                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                                    Maior carta
                                                </div>
                                                <div className="mt-1 truncate font-semibold text-foreground">
                                                    {fmtCurrency(it.resumo?.maior_carta_valor ?? 0)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
                                            <span className="inline-flex min-w-0 items-center gap-2 text-muted-foreground">
                                                <Wallet className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">Valor agregado</span>
                                            </span>
                                            <span className="whitespace-nowrap font-semibold text-foreground">
                                                {fmtCurrency(it.resumo?.valor_total_cartas ?? 0)}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="py-3 align-top">
                                    {primaryCarta ? (
                                        <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span className="truncate text-sm font-semibold text-foreground">
                                                            Cota {primaryCarta.numero_cota ?? "-"}
                                                        </span>
                                                        {primaryCarta.situacao ? (
                                                            <Badge variant="outline" className="shrink-0 capitalize">
                                                                {primaryCarta.situacao}
                                                            </Badge>
                                                        ) : null}
                                                    </div>

                                                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                        {primaryCarta.administradora ?? "Sem administradora"} · Grupo {primaryCarta.grupo_codigo ?? "-"} · Adesão {fmtDate(primaryCarta.data_adesao)}
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <div className="whitespace-nowrap text-sm font-semibold text-foreground">
                                                        {fmtCurrency(primaryCarta.valor_carta)}
                                                    </div>
                                                    <div className="mt-1 whitespace-nowrap text-[11px] text-muted-foreground">
                                                        {primaryCarta.prazo ? `${primaryCarta.prazo} meses` : "Prazo -"}
                                                        {primaryCarta.assembleia_dia ? ` · dia ${primaryCarta.assembleia_dia}` : ""}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                                {primaryCarta.valor_parcela != null ? (
                                                    <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1">
                                                        Parcela {fmtCurrency(primaryCarta.valor_parcela)}
                                                    </span>
                                                ) : null}

                                                {primaryCarta.parcela_reduzida ? (
                                                    <Badge variant="secondary">Redutor</Badge>
                                                ) : null}

                                                {primaryCarta.fgts_permitido ? (
                                                    <Badge variant="secondary">FGTS</Badge>
                                                ) : null}

                                                {primaryCarta.embutido_permitido ? (
                                                    <Badge variant="secondary">Embutido</Badge>
                                                ) : null}

                                                <Link
                                                    href={
                                                        primaryCarta.contrato_id
                                                            ? `/app/contratos/${primaryCarta.contrato_id}`
                                                            : `/app/cartas/${primaryCarta.cota_id}`
                                                    }
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 rounded-full border-white/10 bg-white/[0.03] px-2.5 text-[11px] hover:bg-white/[0.06]"
                                                    >
                                                        <FileText className="mr-1 h-3 w-3" />
                                                        Ver carta
                                                    </Button>
                                                </Link>

                                                {extraCartas > 0 ? (
                                                    <ClienteCartasSheet
                                                        clienteNome={clienteNome}
                                                        cartas={cartas}
                                                        leadId={clienteId}
                                                        clienteTelefone={clienteTelefone}
                                                    />
                                                ) : null}
                                            </div>

                                            {extraCartas > 0 ? (
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    +{extraCartas} cota(s) adicionais fora da linha principal.
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-4 text-sm text-muted-foreground">
                                            Sem cartas vinculadas no filtro atual.
                                        </div>
                                    )}
                                </TableCell>

                                <TableCell className="py-3 pr-5 align-top">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        {fmtDate(it.cliente?.entered_at)}
                                    </div>
                                </TableCell>

                                <TableCell className="px-4 py-3 align-top">
                                    <div className="flex justify-end gap-1.5">
                                        {clienteTelefone ? (
                                            <a
                                                href={buildWhatsAppLink(
                                                    clienteTelefone,
                                                    `Olá ${clienteNome}, tudo bem?`
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 rounded-xl border-white/10 bg-white/[0.03] p-0"
                                                >
                                                    <MessageCircle className="h-3.5 w-3.5" />
                                                </Button>
                                            </a>
                                        ) : null}

                                        <ClienteRowActions
                                            clienteId={clienteId}
                                            clienteNome={clienteNome}
                                            clienteTelefone={clienteTelefone}
                                            clienteEmail={emailLabel ?? undefined}
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
