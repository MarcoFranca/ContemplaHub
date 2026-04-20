import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contratoBadgeVariant } from "../lib/badges";
import { fmtCurrency, fmtDate } from "../lib/format";
import type { CarteiraCartaItem } from "../lib/types";
import { EmptyState } from "./empty-state";

type CartasListProps = {
    items: CarteiraCartaItem[];
};

export function CartasList({ items }: CartasListProps) {
    return (
        <Card className="bg-white/5 border-white/10">
            <CardHeader>
                <CardTitle>Cartas da carteira</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
                {items.map((it) => (
                    <div
                        key={it.cota.cota_id}
                        className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-4 md:flex-row md:items-start md:justify-between"
                    >
                        <div className="min-w-0 space-y-3">
                            <div className="space-y-1">
                                <div className="font-medium truncate">
                                {it.cliente.nome ?? "—"}{" "}
                                <span className="text-xs text-muted-foreground">
                  • {it.cliente.telefone ?? "—"}
                </span>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                    {it.cota.administradora ?? "Sem administradora"} • Cota{" "}
                                    {it.cota.numero_cota ?? "—"} • Grupo {it.cota.grupo_codigo ?? "—"} •{" "}
                                    {it.cota.produto ?? "—"}
                                </div>
                            </div>

                            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">
                                    <div className="uppercase tracking-[0.14em] text-[10px] text-muted-foreground">
                                        Valor da carta
                                    </div>
                                    <div className="mt-1 text-sm font-medium text-foreground">
                                        {fmtCurrency(it.cota.valor_carta)}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">
                                    <div className="uppercase tracking-[0.14em] text-[10px] text-muted-foreground">
                                        Parcela
                                    </div>
                                    <div className="mt-1 text-sm font-medium text-foreground">
                                        {fmtCurrency(it.cota.valor_parcela)}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">
                                    <div className="uppercase tracking-[0.14em] text-[10px] text-muted-foreground">
                                        Prazo / assembleia
                                    </div>
                                    <div className="mt-1 text-sm font-medium text-foreground">
                                        {it.cota.prazo ? `${it.cota.prazo} meses` : "—"}
                                        {it.cota.assembleia_dia ? ` • dia ${it.cota.assembleia_dia}` : ""}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {it.cota.situacao ? (
                                    <Badge variant="outline" className="capitalize">
                                        cota: {it.cota.situacao}
                                    </Badge>
                                ) : null}

                                <Badge variant="outline" className="capitalize">
                                    carteira: {it.carteira.status_carteira}
                                </Badge>

                                {it.contrato.status ? (
                                    <Badge
                                        variant={contratoBadgeVariant(it.contrato.status)}
                                        className="capitalize"
                                    >
                                        contrato: {it.contrato.status}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">sem contrato</Badge>
                                )}

                                {it.cota.parcela_reduzida ? (
                                    <Badge variant="secondary">redutor</Badge>
                                ) : null}

                                {it.cota.fgts_permitido ? (
                                    <Badge variant="secondary">FGTS</Badge>
                                ) : null}

                                {it.cota.embutido_permitido ? (
                                    <Badge variant="secondary">
                                        embutido
                                        {typeof it.cota.embutido_max_percent === "number"
                                            ? ` ${it.cota.embutido_max_percent}%`
                                            : ""}
                                    </Badge>
                                ) : null}

                                {it.cota.parceiro_nome ? (
                                    <Badge variant="outline">parceiro: {it.cota.parceiro_nome}</Badge>
                                ) : null}
                            </div>

                            {it.cota.ultimo_lance ? (
                                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06] px-3 py-2 text-xs text-muted-foreground">
                                    <span className="font-medium text-emerald-200">Último lance:</span>{" "}
                                    {it.cota.ultimo_lance.tipo ?? "—"}
                                    {typeof it.cota.ultimo_lance.percentual === "number"
                                        ? ` • ${it.cota.ultimo_lance.percentual}%`
                                        : ""}
                                    {it.cota.ultimo_lance.valor != null
                                        ? ` • ${fmtCurrency(it.cota.ultimo_lance.valor)}`
                                        : ""}
                                    {it.cota.ultimo_lance.data
                                        ? ` • assembleia ${fmtDate(it.cota.ultimo_lance.data)}`
                                        : ""}
                                </div>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap md:justify-end">
                            <Link href={`/app/leads/${it.cliente.lead_id}`}>
                                <Button size="sm" variant="outline">
                                    Abrir cliente
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <EmptyState message="Nenhuma carta para o filtro atual." />
                )}
            </CardContent>
        </Card>
    );
}
