"use client";

import { Controller, Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContratoFormValues } from "../../types/contrato-form.types";
import { MoneyField } from "../../fields/money-field";
import { DateField } from "../../fields/date-field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Props {
    control: Control<ContratoFormValues>;
}

export function CotaFinanceiraSection({ control }: Props) {
    return (
        <Card className="rounded-3xl border-white/10 bg-white/[0.03] text-white shadow-none">
            <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Dados da carta / cota</CardTitle>
                <CardDescription className="text-slate-400">
                    Preencha os dados financeiros com máscara e contexto operacional.
                </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5 md:grid-cols-2">
                <Controller
                    name="produto"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label className="text-slate-200">Produto</Label>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                                    <SelectValue placeholder="Selecione o produto" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="imobiliario">Imóvel</SelectItem>
                                    <SelectItem value="auto">Auto</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldState.error && (
                                <p className="text-sm text-red-400">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="prazo"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label className="text-slate-200">Prazo</Label>
                            <Input
                                type="number"
                                min={1}
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                placeholder="Ex.: 200"
                                className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                            />
                            {fieldState.error && (
                                <p className="text-sm text-red-400">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="valorCarta"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label className="text-slate-200">Valor da carta</Label>
                            <MoneyField value={field.value} onChange={field.onChange} />
                            {fieldState.error && (
                                <p className="text-sm text-red-400">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="valorParcela"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label className="text-slate-200">Valor da parcela</Label>
                            <MoneyField value={field.value} onChange={field.onChange} />
                            {fieldState.error && (
                                <p className="text-sm text-red-400">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="dataAdesao"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label className="text-slate-200">Data de adesão</Label>
                            <DateField value={field.value} onChange={field.onChange} />
                            {fieldState.error && (
                                <p className="text-sm text-red-400">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="assembleiaDia"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label className="text-slate-200">Dia da assembleia</Label>
                            <Input
                                type="number"
                                min={1}
                                max={31}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                    field.onChange(e.target.value === "" ? null : Number(e.target.value))
                                }
                                placeholder="Ex.: 15"
                                className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                            />
                            {fieldState.error && (
                                <p className="text-sm text-red-400">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="observacoes"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-slate-200">Observações</Label>
                            <Textarea
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                rows={4}
                                placeholder="Observações operacionais, histórico, pontos relevantes da carta..."
                                className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                            />
                            {fieldState.error && (
                                <p className="text-sm text-red-400">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />
            </CardContent>
        </Card>
    );
}