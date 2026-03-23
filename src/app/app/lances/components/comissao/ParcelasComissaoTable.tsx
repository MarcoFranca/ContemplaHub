"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ComissaoRegra } from "../../types";
import { calcularValorEstimado } from "./comissao-calculator";

type Props = {
    regras: ComissaoRegra[];
    valorBase: number;
    onPercentualChange: (index: number, percentual: number) => void;
    onLiberarAuto: (index: number) => void;
};

export function ParcelasComissaoTable({
                                          regras,
                                          valorBase,
                                          onPercentualChange,
                                          onLiberarAuto,
                                      }: Props) {
    return (
        <div className="space-y-3 rounded-xl border p-3">
            <div>
                <h4 className="font-medium">Parcelas da comissão</h4>
                <p className="text-xs text-muted-foreground">
                    Ao editar uma parcela, ela fica manual. O restante é redistribuído apenas nas automáticas.
                </p>
            </div>

            <div className="space-y-3">
                {regras.map((regra, index) => {
                    const valorEstimado = calcularValorEstimado(
                        valorBase,
                        Number(regra.percentual_comissao || 0)
                    );

                    return (
                        <div
                            key={`${regra.ordem}-${index}`}
                            className="grid gap-3 rounded-lg border p-3 md:grid-cols-6"
                        >
                            <div>
                                <label className="mb-1 block text-xs text-muted-foreground">
                                    Parcela
                                </label>
                                <div className="flex h-10 items-center rounded-md border px-3 text-sm">
                                    {regra.ordem}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-muted-foreground">
                                    Evento
                                </label>
                                <div className="flex h-10 items-center rounded-md border px-3 text-sm capitalize">
                                    {labelEvento(regra.tipo_evento)}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-muted-foreground">
                                    Offset
                                </label>
                                <div className="flex h-10 items-center rounded-md border px-3 text-sm">
                                    {regra.offset_meses}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-muted-foreground">
                                    Percentual %
                                </label>
                                <Input
                                    type="number"
                                    step="0.0001"
                                    min={0}
                                    value={regra.percentual_comissao}
                                    onChange={(e) =>
                                        onPercentualChange(index, Number(e.target.value || 0))
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-muted-foreground">
                                    Valor estimado
                                </label>
                                <div className="flex h-10 items-center rounded-md border px-3 text-sm">
                                    {formatMoney(valorEstimado)}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-muted-foreground">
                                    Origem
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-10 flex-1 items-center rounded-md border px-3 text-sm">
                                        {regra.is_manual ? "Manual" : "Automática"}
                                    </div>

                                    {regra.is_manual ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => onLiberarAuto(index)}
                                            title="Voltar para automático"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {!regras.length ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                        Nenhuma parcela gerada ainda.
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function labelEvento(value: string) {
    const map: Record<string, string> = {
        adesao: "Adesão",
        primeira_cobranca_valida: "Primeira cobrança",
        proxima_cobranca: "Próxima cobrança",
        contemplacao: "Contemplação",
        manual: "Manual",
    };
    return map[value] ?? value;
}

function formatMoney(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value || 0);
}