"use client";

import { Controller, Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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

export function StatusInicialSection({ control }: Props) {
    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle>Estado inicial</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
                <Controller
                    name="contractStatus"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label>Status do contrato</Label>
                            <Select
                                value={field.value ?? ""}
                                onValueChange={(value) => field.onChange(value || null)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pendente_assinatura">
                                        Pendente de assinatura
                                    </SelectItem>
                                    <SelectItem value="pendente_pagamento">
                                        Pendente de pagamento
                                    </SelectItem>
                                    <SelectItem value="alocado">Alocado</SelectItem>
                                    <SelectItem value="contemplado">Contemplado</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldState.error && (
                                <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="cotaSituacao"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label>Situação da cota</Label>
                            <Select
                                value={field.value ?? ""}
                                onValueChange={(value) => field.onChange(value || null)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a situação" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ativa">Ativa</SelectItem>
                                    <SelectItem value="contemplada">Contemplada</SelectItem>
                                    <SelectItem value="cancelada">Cancelada</SelectItem>
                                </SelectContent>
                            </Select>
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