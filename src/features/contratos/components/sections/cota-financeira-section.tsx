"use client";

import { Controller, Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoneyField } from "../../fields/money-field";
import type { ContratoFormValues } from "../../types/contrato-form.types";
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
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle>Dados da carta / cota</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
                <Controller
                    name="produto"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label>Produto</Label>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o produto" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="imovel">Imóvel</SelectItem>
                                    <SelectItem value="auto">Auto</SelectItem>
                                    <SelectItem value="servico">Serviço</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldState.error && (
                                <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="prazo"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label>Prazo</Label>
                            <Input
                                type="number"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            {fieldState.error && (
                                <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="valorCarta"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label>Valor da carta</Label>
                            <MoneyField value={field.value} onChange={field.onChange} />
                            {fieldState.error && (
                                <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="valorParcela"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label>Valor da parcela</Label>
                            <MoneyField value={field.value} onChange={field.onChange} />
                            {fieldState.error && (
                                <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="dataAdesao"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label>Data de adesão</Label>
                            <Input
                                type="date"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                            />
                            {fieldState.error && (
                                <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="assembleiaDia"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label>Dia da assembleia</Label>
                            <Input
                                type="number"
                                min={1}
                                max={31}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                    field.onChange(e.target.value === "" ? null : Number(e.target.value))
                                }
                            />
                            {fieldState.error && (
                                <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="observacoes"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2 md:col-span-2">
                            <Label>Observações</Label>
                            <Textarea
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                rows={4}
                            />
                            {fieldState.error && (
                                <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />
            </CardContent>
        </Card>
    );
}