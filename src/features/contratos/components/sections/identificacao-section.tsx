"use client";

import { Controller, Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdministradoraSelectField } from "../../fields/administradora-select-field";
import type {
    AdministradoraOption,
    ContratoFormValues,
} from "../../types/contrato-form.types";

interface Props {
    control: Control<ContratoFormValues>;
    administradoras: AdministradoraOption[];
}

export function IdentificacaoSection({ control, administradoras }: Props) {
    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle>Identificação</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
                <Controller
                    name="administradoraId"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2 md:col-span-2">
                            <Label>Administradora</Label>
                            <AdministradoraSelectField
                                value={field.value}
                                onChange={field.onChange}
                                options={administradoras}
                            />
                            {fieldState.error && (
                                <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="grupoCodigo"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label>Grupo</Label>
                            <Input {...field} />
                            {fieldState.error && (
                                <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="numeroCota"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label>Número da cota</Label>
                            <Input {...field} />
                            {fieldState.error && (
                                <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="numeroContrato"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label>Número do contrato</Label>
                            <Input value={field.value ?? ""} onChange={field.onChange} />
                            {fieldState.error && (
                                <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="dataAssinatura"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label>Data de assinatura</Label>
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
            </CardContent>
        </Card>
    );
}