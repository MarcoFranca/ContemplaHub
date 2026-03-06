"use client";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { fmtCurrency } from "../lib/format";
import type { CarteiraClienteCartaResumo } from "../lib/types";

type CartasSummaryPopoverProps = {
    cartas: CarteiraClienteCartaResumo[];
};

export function CartasSummaryPopover({ cartas }: CartasSummaryPopoverProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="sm" variant="outline" type="button">
                    Detalhes
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[360px] space-y-2">
                <div className="text-sm font-medium">Cartas do cliente</div>

                {cartas.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sem cartas.</p>
                ) : (
                    <div className="space-y-2 max-h-80 overflow-auto">
                        {cartas.map((c) => (
                            <div
                                key={c.cota_id}
                                className="rounded-md border border-border p-2 text-sm"
                            >
                                <div className="font-medium">
                                    Cota {c.numero_cota ?? "—"}{" "}
                                    <span className="text-xs text-muted-foreground">
                    ({c.grupo_codigo ?? "—"})
                  </span>
                                </div>

                                <div className="text-muted-foreground text-xs mt-1">
                                    Produto: {c.produto ?? "—"}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    Administradora: {c.administradora ?? "—"}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    Valor: {fmtCurrency(c.valor_carta)}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    Contrato: {c.status_contrato ?? "sem contrato"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}