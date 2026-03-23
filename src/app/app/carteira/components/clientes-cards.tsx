import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CalendarDays,
    FileText,
    Mail,
    Phone,
    UserRound,
    Wallet,
    Workflow,
} from "lucide-react";

import { contratoBadgeVariant } from "../lib/badges";
import { fmtCurrency, fmtDate } from "../lib/format";
import type { CarteiraClienteItem } from "../lib/types";
import { EmptyState } from "./empty-state";
import { DeleteLeadButton } from "@/app/app/leads/ui/DeleteLeadButton";
import { CreateCarteiraCartaSheet } from "@/app/app/carteira/ui/CreateCarteiraCartaSheet";

type ClientesCardsProps = {
    items: CarteiraClienteItem[];
};

export function ClientesCards({ items }: ClientesCardsProps) {
    if (items.length === 0) {
        return <EmptyState message="Nenhum cliente na carteira para o filtro atual." />;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((it) => {
                const clienteId = String(it.cliente?.lead_id ?? "").trim();
                const clienteNome = it.cliente?.nome ?? "Cliente sem nome";
                const clienteTelefone = it.cliente?.telefone ?? undefined;
                const clienteEmail = it.cliente?.email ?? undefined;

                return (
                    <Card
                        key={clienteId || `cliente-card-${clienteNome}`}
                        className="border-white/10 bg-white/5 backdrop-blur-sm transition hover:border-emerald-400/20 hover:bg-white/7"
                    >
                        <CardHeader className="space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <CardTitle className="flex items-center gap-2 text-base">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/20">
                      <UserRound className="h-4 w-4 text-emerald-300" />
                    </span>
                                        <span className="truncate">{clienteNome}</span>
                                    </CardTitle>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Lead vinculado à carteira
                                    </p>
                                </div>

                                <Badge variant="secondary">{it.resumo.qtd_cartas} carta(s)</Badge>
                            </div>

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

                        <CardContent className="space-y-4 text-sm">
                            <div className="grid gap-2 rounded-xl border border-white/10 bg-black/10 p-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span className="truncate">{it.cliente.telefone ?? "—"}</span>
                                </div>

                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{it.cliente.email ?? "—"}</span>
                                </div>

                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Workflow className="h-4 w-4" />
                                    <span>Etapa: {it.cliente.etapa ?? "—"}</span>
                                </div>

                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>Entrada: {fmtDate(it.cliente.entered_at)}</span>
                                </div>

                                <div className="flex items-center gap-2 font-medium text-foreground">
                                    <Wallet className="h-4 w-4 text-emerald-300" />
                                    <span>Total em cartas: {fmtCurrency(it.resumo.valor_total_cartas)}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                                    <FileText className="h-3.5 w-3.5" />
                                    Cartas
                                </div>

                                <div className="space-y-2">
                                    {it.cartas.slice(0, 3).map((c, index) => (
                                        <div
                                            key={c.cota_id || `${clienteId}-carta-${index}`}
                                            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                                        >
                                            <div className="min-w-0">
                                                <div className="truncate font-medium">
                                                    {c.numero_cota ?? "—"}{" "}
                                                    <span className="text-xs text-muted-foreground">
                            ({c.grupo_codigo ?? "—"})
                          </span>
                                                </div>

                                                <div className="truncate text-xs text-muted-foreground">
                                                    {c.administradora ?? "—"}
                                                </div>
                                            </div>

                                            <div className="text-right text-xs">
                                                <div className="font-medium text-foreground">
                                                    {fmtCurrency(c.valor_carta)}
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
                                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">Observações:</span>{" "}
                                    {it.cliente.observacoes}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-2">
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
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}