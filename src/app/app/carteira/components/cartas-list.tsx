import Link from "next/link";
import { FileText, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { buildWhatsAppLink } from "@/lib/formatters";
import { contratoBadgeVariant } from "../lib/badges";
import { fmtCurrency, fmtDate, fmtPhone } from "../lib/format";
import type { CarteiraCartaItem } from "../lib/types";
import { EmptyState } from "./empty-state";

type CartasListProps = {
    items: CarteiraCartaItem[];
};

export function CartasList({ items }: CartasListProps) {
    if (items.length === 0) {
        return <EmptyState message="Nenhuma carta para o filtro atual." />;
    }

    return (
        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.025] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
            <div className="grid border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.14em] text-muted-foreground md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center">
                <div>Cliente / carta</div>
                <div>Valor e prazo</div>
                <div>Estado</div>
                <div className="text-right">Acao</div>
            </div>

            <div className="divide-y divide-white/10">
                {items.map((it) => (
                    <div
                        key={it.cota.cota_id}
                        className="grid gap-3 px-4 py-3 transition-colors hover:bg-white/[0.025] md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center"
                    >
                        <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-foreground">
                                {it.cliente.nome ?? "-"}
                            </div>
                            <div className="mt-1 truncate text-xs text-muted-foreground">
                                {fmtPhone(it.cliente.telefone) ?? "Sem telefone"} · {it.cota.administradora ?? "Sem administradora"} ·
                                {" "}Cota {it.cota.numero_cota ?? "-"} · Grupo {it.cota.grupo_codigo ?? "-"}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-sm font-semibold text-foreground">
                                {fmtCurrency(it.cota.valor_carta)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Parcela {fmtCurrency(it.cota.valor_parcela)} ·{" "}
                                {it.cota.prazo ? `${it.cota.prazo} meses` : "Prazo -"}
                                {it.cota.assembleia_dia ? ` · dia ${it.cota.assembleia_dia}` : ""}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex flex-wrap gap-1.5">
                                {it.cota.situacao ? (
                                    <Badge variant="outline" className="capitalize">
                                        {it.cota.situacao}
                                    </Badge>
                                ) : null}

                                <Badge variant="outline" className="capitalize">
                                    {it.carteira.status_carteira}
                                </Badge>

                                {it.contrato.status ? (
                                    <Badge
                                        variant={contratoBadgeVariant(it.contrato.status)}
                                        className="capitalize"
                                    >
                                        {it.contrato.status}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Sem contrato</Badge>
                                )}
                            </div>

                            <div className="text-xs text-muted-foreground">
                                Adesão {fmtDate(it.cota.data_adesao)} · Entrada {fmtDate(it.carteira.entered_at)}
                                {it.cota.ultimo_lance?.data ? ` · ultimo lance ${fmtDate(it.cota.ultimo_lance.data)}` : ""}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                            {it.cliente.telefone ? (
                                <a
                                    href={buildWhatsAppLink(
                                        it.cliente.telefone,
                                        `Olá ${it.cliente.nome ?? ""}, tudo bem?`
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 rounded-xl border-white/10 bg-white/[0.03]"
                                    >
                                        <MessageCircle className="h-3.5 w-3.5" />
                                    </Button>
                                </a>
                            ) : null}

                            <Link
                                href={
                                    it.contrato.contrato_id
                                        ? `/app/contratos/${it.contrato.contrato_id}`
                                        : `/app/cartas/${it.cota.cota_id}`
                                }
                            >
                                <Button size="sm" variant="outline" className="h-8 rounded-xl border-white/10 bg-white/[0.03]">
                                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                                    Ver carta
                                </Button>
                            </Link>

                            <Link href={`/app/leads/${it.cliente.lead_id}`}>
                                <Button size="sm" variant="outline" className="h-8 rounded-xl border-white/10 bg-white/[0.03]">
                                    Abrir cliente
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
