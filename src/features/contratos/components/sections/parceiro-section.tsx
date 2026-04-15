"use client";

import { useMemo, useState } from "react";
import { Controller, type Control, useWatch } from "react-hook-form";
import { ChevronDown, Handshake } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { MoneyField } from "../../fields/money-field";
import { ParceiroSelectField } from "../../fields/parceiro-select-field";
import type {
    ContratoFormValues,
    ParceiroOption,
} from "../../types/contrato-form.types";

interface Props {
    control: Control<ContratoFormValues>;
    parceiros: ParceiroOption[];
}

export function ParceiroSection({ control, parceiros }: Props) {
    const [expanded, setExpanded] = useState(false);

    const parceiroId = useWatch({
        control,
        name: "parceiroId",
    });

    const showBody = expanded || !!parceiroId;

    const parceiroSelecionado = useMemo(
        () => parceiros.find((item) => item.id === parceiroId)?.nome ?? null,
        [parceiroId, parceiros]
    );

    return (
        <Card className="rounded-[28px] border border-white/10 bg-white/[0.035] text-white shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <CardHeader className="space-y-3">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                            <Handshake className="h-3.5 w-3.5" />
                            Opcional
                        </div>

                        <div className="space-y-2">
                            <CardTitle className="text-2xl text-white">
                                Parceiro comercial
                            </CardTitle>

                            <CardDescription className="max-w-2xl text-sm leading-6 text-slate-400">
                                Use esta seção apenas quando a operação tiver origem compartilhada.
                                Sem parceiro, o cadastro segue normalmente.
                            </CardDescription>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setExpanded((v) => !v)}
                        className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.06]"
                    >
                        {showBody ? "Ocultar parceiro" : "Vincular parceiro"}
                        <ChevronDown
                            className={`ml-2 h-4 w-4 transition-transform ${showBody ? "rotate-180" : ""}`}
                        />
                    </Button>
                </div>
            </CardHeader>

            {showBody && (
                <CardContent className="space-y-5">
                    <Controller
                        name="parceiroId"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="space-y-2">
                                <Label className="text-slate-200">Parceiro</Label>
                                <ParceiroSelectField
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={parceiros}
                                />
                                {fieldState.error && (
                                    <p className="text-sm text-red-400">{fieldState.error.message}</p>
                                )}
                            </div>
                        )}
                    />

                    {parceiroId ? (
                        <>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                    Parceiro vinculado
                                </div>
                                <div className="mt-1 text-sm font-medium text-slate-100">
                                    {parceiroSelecionado}
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <Controller
                                    name="repassePercentual"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <div className="space-y-2">
                                            <Label className="text-slate-200">Repasse percentual</Label>
                                            <Input
                                                type="number"
                                                step="0.001"
                                                min="0"
                                                max="100"
                                                value={field.value ?? ""}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value === "" ? null : Number(e.target.value)
                                                    )
                                                }
                                                placeholder="Ex.: 1,500"
                                                className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                            />
                                            <p className="text-xs text-slate-500">
                                                Use percentual quando o repasse for proporcional à operação.
                                            </p>
                                            {fieldState.error && (
                                                <p className="text-sm text-red-400">{fieldState.error.message}</p>
                                            )}
                                        </div>
                                    )}
                                />

                                <Controller
                                    name="repasseValor"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <div className="space-y-2">
                                            <Label className="text-slate-200">Repasse valor fixo</Label>
                                            <MoneyField value={field.value} onChange={field.onChange} />
                                            <p className="text-xs text-slate-500">
                                                Use valor fixo quando o repasse já estiver fechado em R$.
                                            </p>
                                            {fieldState.error && (
                                                <p className="text-sm text-red-400">{fieldState.error.message}</p>
                                            )}
                                        </div>
                                    )}
                                />

                                <Controller
                                    name="parceiroObservacoes"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-slate-200">Observações do parceiro</Label>
                                            <Textarea
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                                rows={3}
                                                placeholder="Contexto comercial, regra de repasse, observações operacionais..."
                                                className="rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                                            />
                                            {fieldState.error && (
                                                <p className="text-sm text-red-400">{fieldState.error.message}</p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                        </>
                    ) : (
                        <Alert className="border-white/10 bg-white/[0.03] text-slate-100">
                            <AlertTitle className="text-white">Operação sem parceiro</AlertTitle>
                            <AlertDescription className="text-slate-400">
                                Perfeito. Esta venda pode ser salva normalmente sem parceiro vinculado.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            )}
        </Card>
    );
}