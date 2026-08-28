import Link from "next/link";
import {
    FileText,
    MessageCircle,
    Phone,
    Building2,
    Hash,
    Wallet,
    CalendarClock,
    UserRound,
    Target,
    Trophy,
    Ban,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { buildWhatsAppLink } from "@/lib/formatters";
import { contratoBadgeVariant } from "../lib/badges";
import { fmtCurrency, fmtDate, fmtPhone } from "../lib/format";
import type { CarteiraCartaItem } from "../lib/types";
import { EmptyState } from "./empty-state";
import { LancePreferencialSelect } from "./lance-preferencial-select";
import { EstrategiaCartaDialog } from "./estrategia-carta-dialog";
import { AlertasCartaDialog } from "./alertas-carta-dialog";
import { CartaQuickStatus } from "./carta-quick-status";
import { normalizePreferencial } from "@/app/app/lances/lib/operacao";

type CartasListProps = {
    items: CarteiraCartaItem[];
};

const accentByLance: Record<string, string> = {
    fixo: "bg-emerald-400/70",
    livre: "bg-sky-400/70",
    embutido: "bg-violet-400/70",
    sorteio: "bg-slate-400/50",
};

function metaChip(text: string, Icon: typeof Hash) {
    return (
        <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[11px] text-slate-300">
            <Icon className="h-3 w-3 opacity-70" />
            {text}
        </span>
    );
}

export function CartasList({ items }: CartasListProps) {
    if (items.length === 0) {
        return <EmptyState message="Nenhuma carta para o filtro atual." />;
    }

    return (
        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.025] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
            <div className="hidden border-b border-white/10 bg-white/[0.03] px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:grid md:grid-cols-[minmax(0,1.7fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_auto] md:items-center md:gap-4">
                <div>Cliente / carta</div>
                <div>Valor e prazo</div>
                <div>Estratégia e estado</div>
                <div className="text-right">Ações</div>
            </div>

            <div className="divide-y divide-white/[0.07]">
                {items.map((it) => {
                    const lance = normalizePreferencial(it.cota.tipo_lance_preferencial);
                    const contemplada =
                        (it.cota.situacao ?? "").toLowerCase() === "contemplada" ||
                        it.contrato.status === "contemplado" ||
                        Boolean(it.contrato.data_contemplacao);
                    const cancelada =
                        (it.cota.situacao ?? "").toLowerCase() === "cancelada" ||
                        it.contrato.status === "cancelado";
                    const accent = cancelada
                        ? "bg-rose-500/80"
                        : contemplada
                            ? "bg-amber-400/80"
                            : lance
                                ? accentByLance[lance]
                                : "bg-white/10";
                    const temEstrategia =
                        it.cota.estrategia_objetivo ||
                        it.cota.estrategia_prazo_lance ||
                        it.cota.estrategia_valor_lance != null ||
                        it.cota.estrategia_embutido_pct != null;

                    return (
                        <div
                            key={it.cota.cota_id}
                            className={`relative grid gap-4 px-5 py-4 pl-6 transition-colors md:grid-cols-[minmax(0,1.7fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_auto] md:items-center ${
                                cancelada
                                    ? "bg-rose-500/[0.05] opacity-70 hover:opacity-100 hover:bg-rose-500/[0.07]"
                                    : contemplada
                                        ? "bg-amber-400/[0.06] hover:bg-amber-400/[0.09]"
                                        : "hover:bg-white/[0.03]"
                            }`}
                        >
                            <span className={`absolute inset-y-3 left-0 w-[3px] rounded-r-full ${accent}`} aria-hidden />

                            {/* Cliente / carta */}
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-foreground">
                                    {it.cliente.nome ?? "-"}
                                </div>
                                <div className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3 shrink-0 opacity-70" />
                                    <span className="truncate">{fmtPhone(it.cliente.telefone) ?? "Sem telefone"}</span>
                                    <span className="text-white/20">•</span>
                                    <Building2 className="h-3 w-3 shrink-0 opacity-70" />
                                    <span className="truncate">{it.cota.administradora ?? "Sem administradora"}</span>
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {metaChip(`Cota ${it.cota.numero_cota ?? "-"}`, Hash)}
                                    {metaChip(`Grupo ${it.cota.grupo_codigo ?? "-"}`, Hash)}
                                </div>
                            </div>

                            {/* Valor e prazo */}
                            <div className="space-y-1">
                                <div className="text-lg font-semibold leading-none tracking-tight text-foreground tabular-nums">
                                    {fmtCurrency(it.cota.valor_carta)}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Wallet className="h-3 w-3 opacity-70" />
                                    <span className="tabular-nums">{fmtCurrency(it.cota.valor_parcela)}</span>
                                    <span className="text-white/20">•</span>
                                    <span>{it.cota.prazo ? `${it.cota.prazo}m` : "-"}</span>
                                    {it.cota.assembleia_dia ? (
                                        <>
                                            <span className="text-white/20">•</span>
                                            <CalendarClock className="h-3 w-3 opacity-70" />
                                            <span>dia {it.cota.assembleia_dia}</span>
                                        </>
                                    ) : null}
                                </div>
                            </div>

                            {/* Estratégia e estado */}
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <LancePreferencialSelect cotaId={it.cota.cota_id} tipo={it.cota.tipo_lance_preferencial} />
                                    {cancelada ? (
                                        <Badge className="gap-1 border-rose-500/40 bg-rose-500/15 text-rose-300">
                                            <Ban className="h-3 w-3" /> Cancelada
                                        </Badge>
                                    ) : contemplada ? (
                                        <Badge className="gap-1 border-amber-400/40 bg-amber-400/15 text-amber-200">
                                            <Trophy className="h-3 w-3" /> Contemplada
                                        </Badge>
                                    ) : it.contrato.status ? (
                                        <Badge variant={contratoBadgeVariant(it.contrato.status)} className="capitalize">
                                            {it.contrato.status}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-white/15 text-muted-foreground">
                                            Sem contrato
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                                    {!contemplada && it.cota.situacao ? (
                                        <>
                                            <span className="capitalize">{it.cota.situacao}</span>
                                            <span className="text-white/20">•</span>
                                        </>
                                    ) : null}
                                    <span>Adesão {fmtDate(it.cota.data_adesao)}</span>
                                    <span className="text-white/20">•</span>
                                    <span>Entrada {fmtDate(it.carteira.entered_at)}</span>
                                    {it.cota.ultimo_lance?.data ? (
                                        <>
                                            <span className="text-white/20">•</span>
                                            <span>último lance {fmtDate(it.cota.ultimo_lance.data)}</span>
                                        </>
                                    ) : null}
                                </div>

                                {temEstrategia ? (
                                    <div className="flex items-start gap-1.5 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] px-2 py-1.5 text-[11px] text-emerald-200/90">
                                        <Target className="mt-0.5 h-3 w-3 shrink-0" />
                                        <span className="min-w-0">
                                            {[
                                                it.cota.estrategia_objetivo,
                                                it.cota.estrategia_prazo_lance ? `lance: ${it.cota.estrategia_prazo_lance}` : null,
                                                it.cota.estrategia_valor_lance != null
                                                    ? `reserva ${fmtCurrency(it.cota.estrategia_valor_lance)}`
                                                    : null,
                                                it.cota.estrategia_embutido_pct != null
                                                    ? `embutido ${it.cota.estrategia_embutido_pct}%`
                                                    : null,
                                            ]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </span>
                                    </div>
                                ) : null}
                            </div>

                            {/* Ações */}
                            <div className="flex flex-wrap items-center justify-start gap-1.5 md:justify-end">
                                <AlertasCartaDialog
                                    cotaId={it.cota.cota_id}
                                    leadId={it.cliente.lead_id}
                                    pendentes={it.cota.alertas_pendentes}
                                    proximaData={it.cota.alerta_proxima_data}
                                />

                                <EstrategiaCartaDialog
                                    cotaId={it.cota.cota_id}
                                    objetivo={it.cota.estrategia_objetivo}
                                    prazoLance={it.cota.estrategia_prazo_lance}
                                    valorLance={it.cota.estrategia_valor_lance}
                                    embutidoPct={it.cota.estrategia_embutido_pct}
                                    observacao={it.cota.estrategia_observacao}
                                />

                                <Link
                                    href={
                                        it.contrato.contrato_id
                                            ? `/app/contratos/${it.contrato.contrato_id}`
                                            : `/app/cartas/${it.cota.cota_id}`
                                    }
                                >
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 rounded-xl border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                                    >
                                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                                        Ver carta
                                    </Button>
                                </Link>

                                {it.cliente.telefone ? (
                                    <a
                                        href={buildWhatsAppLink(it.cliente.telefone, `Olá ${it.cliente.nome ?? ""}, tudo bem?`)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Chamar no WhatsApp"
                                    >
                                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-xl border-white/10 bg-white/[0.03]">
                                            <MessageCircle className="h-3.5 w-3.5" />
                                        </Button>
                                    </a>
                                ) : null}

                                <Link href={`/app/leads/${it.cliente.lead_id}`} title="Abrir cliente">
                                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-xl border-white/10 bg-white/[0.03]">
                                        <UserRound className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>

                                <CartaQuickStatus cotaId={it.cota.cota_id} situacao={it.cota.situacao} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
