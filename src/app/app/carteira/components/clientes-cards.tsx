import { CalendarDays, Mail, Phone, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { EmptyState } from "./empty-state";
import { ClienteCartasSheet } from "./cliente-cartas-sheet";
import { ClienteRowActions } from "./clientes-row-actions";
import { contratoBadgeVariant } from "../lib/badges";
import { fmtCurrency, fmtDate, fmtLeadEmail, fmtPhone } from "../lib/format";
import type { CarteiraClienteCartaResumo, CarteiraClienteItem } from "../lib/types";

type ClientesCardsProps = {
    items: CarteiraClienteItem[];
    administradoras: { id: string; nome: string }[];
    parceiros?: { id: string; nome: string }[];
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

export function ClientesCards({
    items,
    administradoras,
    parceiros = [],
}: ClientesCardsProps) {
    if (items.length === 0) {
        return (
            <EmptyState
                title="Nenhum cliente encontrado"
                message="Ajuste os filtros ou cadastre um novo cliente para comecar a montar a carteira."
            />
        );
    }

    return (
        <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
            {items.map((it) => {
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
                    <Card
                        key={clienteId || `cliente-card-${clienteNome}`}
                        className="overflow-hidden rounded-[24px] border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl transition-all hover:border-emerald-400/20"
                    >
                        <CardContent className="space-y-4 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 space-y-2">
                                    <div className="flex items-start gap-3">
                                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                                            <UserRound className="h-4 w-4 text-emerald-300" />
                                        </span>

                                        <div className="min-w-0">
                                            <div className="break-words text-sm font-semibold text-foreground">
                                                {clienteNome}
                                            </div>

                                            <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground">
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
                                                        <span className="truncate">Contato nao informado na importacao</span>
                                                    </span>
                                                )}
                                            </div>
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

                                        {it.cliente.etapa ? (
                                            <Badge variant="outline" className="capitalize">
                                                {it.cliente.etapa}
                                            </Badge>
                                        ) : null}
                                    </div>
                                </div>

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

                            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                                    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                        Cartas
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-foreground">
                                        {it.resumo.qtd_cartas}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                                    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                        Contrato
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-foreground">
                                        {it.resumo.possui_contrato ? "Sim" : "Nao"}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-black/15 p-3 sm:col-span-2">
                                    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                        Valor total
                                    </div>
                                    <div className="mt-1 truncate text-sm font-semibold text-foreground">
                                        {fmtCurrency(it.resumo.valor_total_cartas)}
                                    </div>
                                </div>
                            </div>

                            {primaryCarta ? (
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-semibold text-foreground">
                                                Cota {primaryCarta.numero_cota ?? "-"}
                                            </div>
                                            <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                {primaryCarta.administradora ?? "Sem administradora"} · Grupo {primaryCarta.grupo_codigo ?? "-"}
                                            </div>
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <div className="whitespace-nowrap text-sm font-semibold text-foreground">
                                                {fmtCurrency(primaryCarta.valor_carta)}
                                            </div>
                                            <div className="mt-1 whitespace-nowrap text-[11px] text-muted-foreground">
                                                {primaryCarta.prazo ? `${primaryCarta.prazo} meses` : "Prazo -"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                        {primaryCarta.situacao ? (
                                            <Badge variant="outline" className="capitalize">
                                                {primaryCarta.situacao}
                                            </Badge>
                                        ) : null}
                                        {primaryCarta.valor_parcela != null ? (
                                            <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1">
                                                Parcela {fmtCurrency(primaryCarta.valor_parcela)}
                                            </span>
                                        ) : null}
                                        {extraCartas > 0 ? (
                                            <ClienteCartasSheet clienteNome={clienteNome} cartas={cartas} />
                                        ) : null}
                                    </div>

                                    {extraCartas > 0 ? (
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            +{extraCartas} cota(s) adicionais no detalhe lateral.
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-4 text-sm text-muted-foreground">
                                    Sem cartas vinculadas no filtro atual.
                                </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-2">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    Entrada {fmtDate(it.cliente.entered_at)}
                                </span>

                                {it.cliente.observacoes ? (
                                    <span className="max-w-full truncate xl:max-w-[60%]">{it.cliente.observacoes}</span>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
