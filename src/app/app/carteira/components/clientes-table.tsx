import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { contratoBadgeVariant } from "../lib/badges";
import { fmtCurrency, fmtDate } from "../lib/format";
import type { CarteiraClienteItem } from "../lib/types";
import { EmptyState } from "./empty-state";
import { CartasSummaryPopover } from "./cartas-summary-popover";

type ClientesTableProps = {
    items: CarteiraClienteItem[];
};

export function ClientesTable({ items }: ClientesTableProps) {
    if (items.length === 0) {
        return <EmptyState message="Nenhum cliente na carteira para o filtro atual." />;
    }

    return (
        <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
            <div className="max-h-[65vh] overflow-auto">
                <table className="w-full min-w-[1300px] text-sm">
                    <thead className="sticky top-0 z-10 bg-zinc-950 text-muted-foreground">
                    <tr className="border-b border-white/10">
                        <th className="text-left px-4 py-3 font-medium">Cliente</th>
                        <th className="text-left px-4 py-3 font-medium">Contato</th>
                        <th className="text-left px-4 py-3 font-medium">Etapa</th>
                        <th className="text-left px-4 py-3 font-medium">Carteira</th>
                        <th className="text-left px-4 py-3 font-medium">Origem</th>
                        <th className="text-left px-4 py-3 font-medium">Cartas</th>
                        <th className="text-left px-4 py-3 font-medium">Total</th>
                        <th className="text-left px-4 py-3 font-medium">Maior carta</th>
                        <th className="text-left px-4 py-3 font-medium">Contrato</th>
                        <th className="text-left px-4 py-3 font-medium">Entrada</th>
                        <th className="text-right px-4 py-3 font-medium">Ações</th>
                    </tr>
                    </thead>

                    <tbody>
                    {items.map((it) => (
                        <tr
                            key={it.cliente.lead_id}
                            className="border-b border-white/5 align-top hover:bg-white/[0.03]"
                        >
                            <td className="px-4 py-3">
                                <div className="font-medium text-foreground">
                                    {it.cliente.nome ?? "—"}
                                </div>
                                {it.cliente.observacoes && (
                                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {it.cliente.observacoes}
                                    </div>
                                )}
                            </td>

                            <td className="px-4 py-3 text-muted-foreground">
                                <div>{it.cliente.telefone ?? "—"}</div>
                                <div className="text-xs mt-1">{it.cliente.email ?? "—"}</div>
                            </td>

                            <td className="px-4 py-3 text-muted-foreground">
                                {it.cliente.etapa ?? "—"}
                            </td>

                            <td className="px-4 py-3">
                                <Badge variant="outline" className="capitalize">
                                    {it.cliente.status_carteira}
                                </Badge>
                            </td>

                            <td className="px-4 py-3">
                                <Badge variant="secondary" className="capitalize">
                                    {it.cliente.origem_entrada}
                                </Badge>
                            </td>

                            <td className="px-4 py-3 text-muted-foreground">
                                <div className="flex flex-col gap-2">
                                    <div className="text-sm font-medium text-foreground">
                                        {it.resumo.qtd_cartas} carta(s)
                                    </div>
                                    <div className="text-xs">
                                        Maior: {fmtCurrency(it.resumo.maior_carta_valor)}
                                    </div>
                                    <div>
                                        <CartasSummaryPopover cartas={it.cartas} />
                                    </div>
                                </div>
                            </td>

                            <td className="px-4 py-3 text-muted-foreground">
                                {fmtCurrency(it.resumo.valor_total_cartas)}
                            </td>

                            <td className="px-4 py-3 text-muted-foreground">
                                {fmtCurrency(it.resumo.maior_carta_valor)}
                            </td>

                            <td className="px-4 py-3">
                                {it.resumo.status_contrato_mais_recente ? (
                                    <Badge
                                        variant={contratoBadgeVariant(it.resumo.status_contrato_mais_recente)}
                                        className="capitalize"
                                    >
                                        {it.resumo.status_contrato_mais_recente}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">sem contrato</Badge>
                                )}
                            </td>

                            <td className="px-4 py-3 text-muted-foreground">
                                {fmtDate(it.cliente.entered_at)}
                            </td>

                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                    <Link href={`/app/leads/${it.cliente.lead_id}`}>
                                        <Button size="sm" variant="outline">
                                            Ver
                                        </Button>
                                    </Link>

                                    <form action="/app/leads" method="GET">
                                        <input type="hidden" name="fromClient" value={it.cliente.lead_id} />
                                        <Button size="sm">Negociação</Button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}