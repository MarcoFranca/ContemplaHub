"use client";

import {
    Banknote,
    Building2,
    CalendarDays,
    CreditCard,
    Layers3,
    ReceiptText,
    UserRoundPlus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import { fmtCurrency } from "../lib/format";

type CartaItem = {
    cota_id?: string | null;
    numero_cota?: string | number | null;
    grupo_codigo?: string | null;
    administradora?: string | null;
    valor_carta?: number | null;
    valor_parcela?: number | null;
    prazo_meses?: number | null;
    prazo?: number | null;
    parcela_atual?: number | null;
    assembleia_dia?: number | null;
    status?: string | null;
    situacao?: string | null;
    fgts_permitido?: boolean | null;
    embutido_permitido?: boolean | null;
    embutido_max_percent?: number | null;
    parcela_reduzida?: boolean | null;
    parceiro_nome?: string | null;
    ultimo_lance?: {
        data?: string | null;
        tipo?: string | null;
        percentual?: number | null;
        valor?: number | null;
    } | null;
};

type ClienteCartasSheetProps = {
    clienteNome: string;
    cartas: CartaItem[];
};

function statusLabel(carta: CartaItem) {
    return carta.situacao || carta.status || "Sem status";
}

export function ClienteCartasSheet({
                                       clienteNome,
                                       cartas,
                                   }: ClienteCartasSheetProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full border-white/10 bg-white/[0.03] text-xs hover:bg-white/[0.06]"
                >
                    Ver todas as cotas ({cartas.length})
                </Button>
            </SheetTrigger>

            <SheetContent className="w-full border-white/10 bg-slate-950/95 sm:max-w-2xl">
                <SheetHeader className="border-b border-white/10 pb-4">
                    <SheetTitle className="text-left">
                        Cotas de {clienteNome}
                    </SheetTitle>
                    <SheetDescription className="text-left">
                        Visualização completa das cartas vinculadas ao cliente.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-3 overflow-y-auto pr-1">
                    {cartas.map((carta, index) => (
                        <div
                            key={carta.cota_id || `carta-sheet-${index}`}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                                            <CreditCard className="h-4 w-4 text-emerald-300" />
                                        </div>

                                        <div>
                                            <div className="text-sm font-semibold text-foreground">
                                                Cota {carta.numero_cota ?? "—"}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                ID: {carta.cota_id ?? "—"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-base font-semibold text-foreground">
                                        {fmtCurrency(carta.valor_carta ?? 0)}
                                    </div>
                                    <Badge variant="outline" className="mt-2 capitalize">
                                        {statusLabel(carta)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                    <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                        <Layers3 className="h-3.5 w-3.5" />
                                        Grupo
                                    </div>
                                    <div className="text-sm font-medium text-foreground">
                                        {carta.grupo_codigo ?? "—"}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                    <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                        <Building2 className="h-3.5 w-3.5" />
                                        Administradora
                                    </div>
                                    <div className="text-sm font-medium text-foreground">
                                        {carta.administradora ?? "—"}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                    <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        Prazo / assembleia
                                    </div>
                                    <div className="text-sm font-medium text-foreground">
                                        {carta.prazo_meses || carta.prazo
                                            ? `${carta.prazo_meses ?? carta.prazo} meses`
                                            : "—"}
                                        {carta.assembleia_dia
                                            ? ` • dia ${carta.assembleia_dia}`
                                            : ""}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                    <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                        <ReceiptText className="h-3.5 w-3.5" />
                                        Parcela atual
                                    </div>
                                    <div className="text-sm font-medium text-foreground">
                                        {fmtCurrency(carta.parcela_atual ?? carta.valor_parcela ?? 0)}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {carta.situacao ? (
                                    <Badge variant="outline" className="capitalize">
                                        cota: {carta.situacao}
                                    </Badge>
                                ) : null}
                                {carta.parcela_reduzida ? (
                                    <Badge variant="secondary">redutor</Badge>
                                ) : null}
                                {carta.fgts_permitido ? (
                                    <Badge variant="secondary">FGTS</Badge>
                                ) : null}
                                {carta.embutido_permitido ? (
                                    <Badge variant="secondary">
                                        embutido
                                        {typeof carta.embutido_max_percent === "number"
                                            ? ` ${carta.embutido_max_percent}%`
                                            : ""}
                                    </Badge>
                                ) : null}
                            </div>

                            {carta.parceiro_nome ? (
                                <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-3">
                                    <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                        <UserRoundPlus className="h-3.5 w-3.5" />
                                        Parceiro vinculado
                                    </div>
                                    <div className="text-sm font-medium text-foreground">
                                        {carta.parceiro_nome}
                                    </div>
                                </div>
                            ) : null}

                            {carta.ultimo_lance ? (
                                <div className="mt-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06] p-3">
                                    <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-emerald-200">
                                        <Banknote className="h-3.5 w-3.5" />
                                        Último lance
                                    </div>
                                    <div className="text-sm font-medium text-foreground">
                                        {carta.ultimo_lance.tipo ?? "—"}
                                        {typeof carta.ultimo_lance.percentual === "number"
                                            ? ` • ${carta.ultimo_lance.percentual}%`
                                            : ""}
                                        {carta.ultimo_lance.valor != null
                                            ? ` • ${fmtCurrency(carta.ultimo_lance.valor)}`
                                            : ""}
                                    </div>
                                    {carta.ultimo_lance.data ? (
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            Assembleia vinculada: {new Date(carta.ultimo_lance.data).toLocaleDateString("pt-BR")}
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    ))}

                    {cartas.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-muted-foreground">
                            Nenhuma cota vinculada para este cliente.
                        </div>
                    ) : null}
                </div>
            </SheetContent>
        </Sheet>
    );
}
