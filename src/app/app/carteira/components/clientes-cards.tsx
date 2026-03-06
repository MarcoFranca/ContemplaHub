import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contratoBadgeVariant } from "../lib/badges";
import { fmtCurrency, fmtDate } from "../lib/format";
import type { CarteiraClienteItem } from "../lib/types";
import { EmptyState } from "./empty-state";

type ClientesCardsProps = {
    items: CarteiraClienteItem[];
};

export function ClientesCards({ items }: ClientesCardsProps) {
    if (items.length === 0) {
        return <EmptyState message="Nenhum cliente na carteira para o filtro atual." />;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((it) => (
                <Card key={it.cliente.lead_id} className="bg-white/5 border-white/10">
                    <CardHeader className="space-y-3">
                        <CardTitle className="flex items-start justify-between gap-2">
                            <span className="truncate">{it.cliente.nome ?? "—"}</span>
                            <Badge variant="secondary">{it.resumo.qtd_cartas} carta(s)</Badge>
                        </CardTitle>

                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="capitalize">
                                {it.cliente.status_carteira}
                            </Badge>

                            <Badge variant="secondary" className="capitalize">
                                origem: {it.cliente.origem_entrada}
                            </Badge>

                            {it.resumo.status_contrato_mais_recente ? (
                                <Badge
                                    variant={contratoBadgeVariant(it.resumo.status_contrato_mais_recente)}
                                    className="capitalize"
                                >
                                    contrato: {it.resumo.status_contrato_mais_recente}
                                </Badge>
                            ) : (
                                <Badge variant="outline">sem contrato</Badge>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="text-sm space-y-3 text-muted-foreground">
                        <div className="space-y-1">
                            <div>📞 {it.cliente.telefone ?? "—"}</div>
                            <div>✉️ {it.cliente.email ?? "—"}</div>
                            <div>📍 Etapa: {it.cliente.etapa ?? "—"}</div>
                            <div>🗂️ Entrada na carteira: {fmtDate(it.cliente.entered_at)}</div>
                            <div>💰 Total em cartas: {fmtCurrency(it.resumo.valor_total_cartas)}</div>
                        </div>

                        <div className="pt-2 space-y-2">
                            <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                Cartas
                            </div>

                            <div className="space-y-1">
                                {it.cartas.slice(0, 3).map((c) => (
                                    <div
                                        key={c.cota_id}
                                        className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-2 py-1"
                                    >
                                        <div className="truncate">
                                            <span className="font-medium">{c.numero_cota ?? "—"}</span>{" "}
                                            <span className="text-xs">({c.grupo_codigo ?? "—"})</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs">{fmtCurrency(c.valor_carta)}</div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {c.administradora ?? "—"}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {it.cartas.length === 0 && (
                                    <div className="text-sm text-muted-foreground">
                                        Sem cartas no filtro atual.
                                    </div>
                                )}

                                {it.cartas.length > 3 && (
                                    <div className="text-xs text-muted-foreground">
                                        +{it.cartas.length - 3} carta(s)
                                    </div>
                                )}
                            </div>
                        </div>

                        {it.cliente.observacoes && (
                            <div className="text-xs text-muted-foreground">
                                Obs.: {it.cliente.observacoes}
                            </div>
                        )}

                        <div className="pt-3 flex gap-2 flex-wrap">
                            <Link href={`/app/leads/${it.cliente.lead_id}`}>
                                <Button size="sm" variant="outline">
                                    Ver cliente
                                </Button>
                            </Link>

                            <form action="/app/leads" method="GET">
                                <input type="hidden" name="fromClient" value={it.cliente.lead_id} />
                                <Button size="sm">Nova negociação</Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}