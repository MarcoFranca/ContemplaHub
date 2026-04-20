import {
    CalendarDays,
    FileText,
    Mail,
    Phone,
    UserRound,
    Wallet,
    Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { EmptyState } from "./empty-state";
import { ClienteRowActions } from "./clientes-row-actions";
import { ClienteCartasSheet } from "./cliente-cartas-sheet";
import { contratoBadgeVariant } from "../lib/badges";
import { fmtCurrency, fmtDate } from "../lib/format";
import type { CarteiraClienteItem } from "../lib/types";

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

export function ClientesCards({
                                  items,
                                  administradoras,
                                  parceiros = [],
                              }: ClientesCardsProps) {
    if (items.length === 0) {
        return (
            <EmptyState
                title="Nenhum cliente encontrado"
                message="Ajuste os filtros ou cadastre um novo cliente para começar a montar a carteira."
            />
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {items.map((it) => {
                const clienteId = String(it.cliente?.lead_id ?? "").trim();
                const clienteNome = it.cliente?.nome ?? "Cliente sem nome";
                const clienteTelefone = it.cliente?.telefone ?? undefined;
                const clienteEmail = it.cliente?.email ?? undefined;
                const cartas = it.cartas ?? [];
                const cartasPreview = cartas.slice(0, 2);
                const cartasExtras = Math.max(cartas.length - cartasPreview.length, 0);

                return (
                    <Card
                        key={clienteId || `cliente-card-${clienteNome}`}
                        className="group overflow-hidden rounded-2xl border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-emerald-400/20"
                    >
                        <CardHeader className="space-y-4 pb-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <CardTitle className="flex min-w-0 items-start gap-3 text-base leading-tight">
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                                            <UserRound className="h-4 w-4 text-emerald-300" />
                                        </span>
                                        <span className="min-w-0 flex-1 break-words">
                                            {clienteNome}
                                        </span>
                                    </CardTitle>

                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 pl-[52px] text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5" />
                                            {clienteTelefone || "Sem telefone"}
                                        </span>

                                        <span className="inline-flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5" />
                                            {clienteEmail || "Sem email"}
                                        </span>
                                    </div>
                                </div>

                                <div className="shrink-0 opacity-100 transition">
                                    <ClienteRowActions
                                        clienteId={clienteId}
                                        clienteNome={clienteNome}
                                        clienteTelefone={clienteTelefone}
                                        clienteEmail={clienteEmail}
                                        administradoras={administradoras}
                                        parceiros={parceiros}
                                        compact
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    variant="outline"
                                    className={`capitalize ${getCarteiraBadgeClass(
                                        it.cliente?.status_carteira
                                    )}`}
                                >
                                    {it.cliente?.status_carteira ?? "—"}
                                </Badge>

                                <Badge variant="secondary" className="capitalize">
                                    origem: {it.cliente?.origem_entrada ?? "—"}
                                </Badge>

                                {it.resumo.status_contrato_mais_recente ? (
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

                                {it.cliente.etapa ? (
                                    <Badge variant="outline" className="capitalize">
                                        etapa: {it.cliente.etapa}
                                    </Badge>
                                ) : null}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                        <Wallet className="h-3.5 w-3.5" />
                                        Total em cartas
                                    </div>
                                    <div className="mt-2 text-lg font-semibold">
                                        {fmtCurrency(it.resumo.valor_total_cartas)}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        {it.resumo.qtd_cartas} carta(s) vinculada(s)
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        Entrada na carteira
                                    </div>
                                    <div className="mt-2 text-sm font-medium">
                                        {fmtDate(it.cliente.entered_at)}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        Maior carta: {fmtCurrency(it.resumo.maior_carta_valor)}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                        <FileText className="h-3.5 w-3.5" />
                                        Cartas em destaque
                                    </div>

                                    {cartas.length > 0 ? (
                                        <ClienteCartasSheet
                                            clienteNome={clienteNome}
                                            cartas={cartas}
                                        />
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    {cartasPreview.map((c, index) => (
                                        <div
                                            key={c.cota_id || `${clienteId}-carta-${index}`}
                                            className="rounded-xl border border-white/10 bg-black/10 px-3 py-3"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-medium">
                                                        Cota {c.numero_cota ?? "—"}
                                                    </div>
                                                    <div className="truncate text-xs text-muted-foreground">
                                                        {c.administradora ?? "—"} · Grupo {c.grupo_codigo ?? "—"}
                                                    </div>
                                                    <div className="mt-1 truncate text-xs text-muted-foreground">
                                                        {c.prazo ? `${c.prazo} meses` : "Prazo —"}
                                                        {c.assembleia_dia ? ` • dia ${c.assembleia_dia}` : ""}
                                                        {c.valor_parcela != null
                                                            ? ` • parcela ${fmtCurrency(c.valor_parcela)}`
                                                            : ""}
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <div className="text-sm font-medium">
                                                        {fmtCurrency(c.valor_carta)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {c.situacao ? (
                                                    <Badge variant="outline" className="capitalize">
                                                        {c.situacao}
                                                    </Badge>
                                                ) : null}
                                                {c.parcela_reduzida ? (
                                                    <Badge variant="secondary">redutor</Badge>
                                                ) : null}
                                                {c.fgts_permitido ? (
                                                    <Badge variant="secondary">FGTS</Badge>
                                                ) : null}
                                                {c.embutido_permitido ? (
                                                    <Badge variant="secondary">embutido</Badge>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}

                                    {cartasExtras > 0 ? (
                                        <div className="flex items-center justify-between rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-2.5">
                                            <div className="text-sm text-muted-foreground">
                                                +{cartasExtras} cota(s) adicionais
                                            </div>
                                            <ClienteCartasSheet
                                                clienteNome={clienteNome}
                                                cartas={cartas}
                                            />
                                        </div>
                                    ) : null}

                                    {cartas.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-white/10 bg-black/10 px-3 py-3 text-sm text-muted-foreground">
                                            Sem cartas no filtro atual.
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Workflow className="h-4 w-4" />
                                    <span>Etapa: {it.cliente.etapa ?? "—"}</span>
                                </div>

                                {it.cliente.observacoes ? (
                                    <div className="text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">Observações:</span>{" "}
                                        {it.cliente.observacoes}
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex items-center justify-between border-t border-white/10 pt-3">
                                <div className="text-xs text-muted-foreground">
                                    {it.resumo.possui_contrato ? "Com contrato" : "Sem contrato"}
                                </div>

                                <div className="text-xs text-muted-foreground">
                                    {it.resumo.qtd_cartas} carta(s)
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
