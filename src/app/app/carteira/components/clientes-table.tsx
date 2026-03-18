import Link from "next/link";
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
import {
    CalendarDays,
    Mail,
    Phone,
    UserRound,
    Wallet,
    FileText,
    ArrowUpRight,
} from "lucide-react";
import { fmtCurrency, fmtDate } from "../lib/format";
import type { CarteiraClienteItem } from "../lib/types";
import { contratoBadgeVariant } from "../lib/badges";
import { DeleteLeadButton } from "@/app/app/leads/ui/DeleteLeadButton";
import { EmptyState } from "./empty-state";

type Props = {
    items: CarteiraClienteItem[];
};

export function ClientesTable({ items }: Props) {
    if (items.length === 0) {
        return <EmptyState message="Nenhum cliente encontrado para o filtro atual." />;
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="min-w-[260px]">Cliente</TableHead>
                            <TableHead className="min-w-[220px]">Contato</TableHead>
                            <TableHead className="min-w-[150px]">Entrada</TableHead>
                            <TableHead className="min-w-[150px]">Cartas</TableHead>
                            <TableHead className="min-w-[170px]">Valor total</TableHead>
                            <TableHead className="min-w-[180px]">Contrato</TableHead>
                            <TableHead className="min-w-[220px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {items.map((it) => (
                            <TableRow
                                key={it.cliente.lead_id}
                                className="border-white/10 hover:bg-white/5"
                            >
                                <TableCell className="align-top">
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/20">
                        <UserRound className="h-4 w-4 text-emerald-300" />
                      </span>

                                            <div className="min-w-0">
                                                <div className="truncate font-medium text-foreground">
                                                    {it.cliente.nome ?? "—"}
                                                </div>

                                                <div className="mt-1 flex flex-wrap gap-2">
                                                    <Badge variant="outline" className="capitalize">
                                                        {it.cliente.status_carteira ?? "sem status"}
                                                    </Badge>

                                                    {it.cliente.origem_entrada ? (
                                                        <Badge variant="secondary" className="capitalize">
                                                            {it.cliente.origem_entrada}
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>

                                        {it.cliente.observacoes ? (
                                            <div className="line-clamp-2 text-xs text-muted-foreground">
                                                {it.cliente.observacoes}
                                            </div>
                                        ) : null}
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            <span className="truncate">{it.cliente.telefone ?? "—"}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            <span className="truncate">{it.cliente.email ?? "—"}</span>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CalendarDays className="h-4 w-4" />
                                        {fmtDate(it.cliente.entered_at)}
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <FileText className="h-4 w-4 text-emerald-300" />
                                            {it.resumo.qtd_cartas} carta(s)
                                        </div>

                                        {it.cartas[0] ? (
                                            <div className="text-xs text-muted-foreground">
                                                Maior destaque: {fmtCurrency(it.cartas[0].valor_carta)}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-muted-foreground">
                                                Sem cartas
                                            </div>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                        <Wallet className="h-4 w-4 text-emerald-300" />
                                        {fmtCurrency(it.resumo.valor_total_cartas)}
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    {it.resumo.status_contrato_mais_recente ? (
                                        <Badge
                                            variant={contratoBadgeVariant(it.resumo.status_contrato_mais_recente)}
                                            className="capitalize"
                                        >
                                            {it.resumo.status_contrato_mais_recente}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">Sem contrato</Badge>
                                    )}
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/app/leads/${it.cliente.lead_id}`}>
                                            <Button size="sm" variant="outline">
                                                <ArrowUpRight className="mr-2 h-4 w-4" />
                                                Ver cliente
                                            </Button>
                                        </Link>

                                        <form action="/app/leads" method="GET">
                                            <input type="hidden" name="fromClient" value={it.cliente.lead_id} />
                                            <Button size="sm">Nova negociação</Button>
                                        </form>

                                        <DeleteLeadButton
                                            leadId={it.cliente.lead_id}
                                            leadName={it.cliente.nome}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}