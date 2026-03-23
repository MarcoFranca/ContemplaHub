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
import { EmptyState } from "./empty-state";
import { contratoBadgeVariant } from "../lib/badges";
import { fmtCurrency, fmtDate } from "../lib/format";
import type { CarteiraClienteItem } from "../lib/types";
import { DeleteLeadButton } from "@/app/app/leads/ui/DeleteLeadButton";
import { CreateCarteiraCartaSheet } from "@/app/app/carteira/ui/CreateCarteiraCartaSheet";

type ClientesTableProps = {
    items: CarteiraClienteItem[];
};

export function ClientesTable({ items }: ClientesTableProps) {
    if (items.length === 0) {
        return <EmptyState message="Nenhum cliente na carteira para o filtro atual." />;
    }

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/10">
                        <TableHead>Cliente</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cartas</TableHead>
                        <TableHead>Total em cartas</TableHead>
                        <TableHead>Entrada</TableHead>
                        <TableHead className="w-[320px] text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {items.map((it, index) => {
                        const clienteId = String(it.cliente?.lead_id ?? "").trim();
                        const clienteNome = it.cliente?.nome ?? "Cliente sem nome";
                        const clienteTelefone = it.cliente?.telefone ?? undefined;
                        const clienteEmail = it.cliente?.email ?? undefined;

                        return (
                            <TableRow
                                key={clienteId || `cliente-row-${index}`}
                                className="border-white/10"
                            >
                                <TableCell className="align-top">
                                    <div className="space-y-1">
                                        <div className="font-medium">{clienteNome}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Etapa: {it.cliente?.etapa ?? "—"}
                                        </div>
                                        {it.cliente?.observacoes ? (
                                            <div className="line-clamp-2 text-xs text-muted-foreground">
                                                {it.cliente.observacoes}
                                            </div>
                                        ) : null}
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="space-y-1 text-sm">
                                        <div>{clienteTelefone || "—"}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {clienteEmail || "—"}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="capitalize">
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
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="space-y-1">
                                        <div className="font-medium">
                                            {it.resumo?.qtd_cartas ?? 0} carta(s)
                                        </div>

                                        <div className="space-y-1 text-xs text-muted-foreground">
                                            {it.cartas?.slice(0, 2).map((c, cartaIndex) => (
                                                <div
                                                    key={c.cota_id || `${clienteId}-mini-carta-${cartaIndex}`}
                                                    className="truncate"
                                                >
                                                    {c.numero_cota ?? "—"} ({c.grupo_codigo ?? "—"})
                                                </div>
                                            ))}

                                            {(it.cartas?.length ?? 0) > 2 ? (
                                                <div>+{(it.cartas?.length ?? 0) - 2} carta(s)</div>
                                            ) : null}

                                            {(it.cartas?.length ?? 0) === 0 ? (
                                                <div>Sem cartas</div>
                                            ) : null}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="align-top font-medium">
                                    {fmtCurrency(it.resumo?.valor_total_cartas ?? 0)}
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="text-sm">{fmtDate(it.cliente?.entered_at)}</div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <Link href={`/app/leads/${clienteId}`}>
                                            <Button size="sm" variant="outline">
                                                Ver cliente
                                            </Button>
                                        </Link>

                                        {clienteId ? (
                                            <CreateCarteiraCartaSheet
                                                clientes={[
                                                    {
                                                        id: clienteId,
                                                        nome: clienteNome,
                                                        telefone: clienteTelefone,
                                                        email: clienteEmail,
                                                    },
                                                ]}
                                                clienteId={clienteId}
                                                triggerLabel="Cadastrar carta"
                                                triggerVariant="outline"
                                            />
                                        ) : null}

                                        <form action="/app/leads" method="GET">
                                            <input type="hidden" name="fromClient" value={clienteId} />
                                            <Button size="sm">Nova negociação</Button>
                                        </form>

                                        <DeleteLeadButton
                                            leadId={clienteId}
                                            leadName={clienteNome}
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