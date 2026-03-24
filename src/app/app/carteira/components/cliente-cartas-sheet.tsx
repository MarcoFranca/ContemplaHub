"use client";

import {
    Building2,
    CalendarDays,
    CreditCard,
    Layers3,
    ReceiptText,
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
    prazo_meses?: number | null;
    parcela_atual?: number | null;
    status?: string | null;
    situacao?: string | null;
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
                                        Prazo
                                    </div>
                                    <div className="text-sm font-medium text-foreground">
                                        {carta.prazo_meses ? `${carta.prazo_meses} meses` : "—"}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                    <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                        <ReceiptText className="h-3.5 w-3.5" />
                                        Parcela atual
                                    </div>
                                    <div className="text-sm font-medium text-foreground">
                                        {fmtCurrency(carta.parcela_atual ?? 0)}
                                    </div>
                                </div>
                            </div>
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