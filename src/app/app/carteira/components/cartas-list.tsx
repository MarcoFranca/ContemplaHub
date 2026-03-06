import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contratoBadgeVariant } from "../lib/badges";
import { fmtCurrency } from "../lib/format";
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
                        className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                        <div className="min-w-0 space-y-1">
                            <div className="font-medium truncate">
                                {it.cliente.nome ?? "—"}{" "}
                                <span className="text-xs text-muted-foreground">
                  • {it.cliente.telefone ?? "—"}
                </span>
                            </div>

                            <div className="text-xs text-muted-foreground">
                                Cota {it.cota.numero_cota ?? "—"} • Grupo {it.cota.grupo_codigo ?? "—"} •{" "}
                                {it.cota.produto ?? "—"}
                            </div>

                            <div className="text-xs text-muted-foreground">
                                {it.cota.administradora ?? "—"} • Prazo {it.cota.prazo ?? "—"} meses
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
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
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="text-sm">{fmtCurrency(it.cota.valor_carta)}</div>

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