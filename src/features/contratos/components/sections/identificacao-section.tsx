"use client";

import { Controller, Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdministradoraSelectField } from "../../fields/administradora-select-field";
import { DateField } from "../../fields/date-field";
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
        <Card className="rounded-[28px] border border-white/10 bg-white/[0.035] text-white shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Identificação</CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-400">
                    Selecione a administradora e preencha os dados de identificação da carta e do contrato.
                </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5 md:grid-cols-2">
                <Controller
                    name="administradoraId"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-slate-200">Administradora</Label>
                            <AdministradoraSelectField
                                value={field.value}
                                onChange={field.onChange}
                                options={administradoras}
                            />
                            {fieldState.error && (
                                <p className="text-sm text-red-400">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="grupoCodigo"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label className="text-slate-200">Grupo</Label>
                            <Input
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                placeholder="Ex.: IM-2030"
                                className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                            />
                            {fieldState.error && (
                                <p className="text-sm text-red-400">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="numeroCota"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label className="text-slate-200">Número da cota</Label>
                            <Input
                                {...field}
                                placeholder="Ex.: 1302-004"
                                className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                            />
                            {fieldState.error && (
                                <p className="text-sm text-red-400">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="numeroContrato"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label className="text-slate-200">Número do contrato</Label>
                            <Input
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                placeholder="Ex.: 2026-000321"
                                className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                            />
                            {fieldState.error && (
                                <p className="text-sm text-red-400">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="dataAssinatura"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label className="text-slate-200">Data de assinatura</Label>
                            <DateField value={field.value} onChange={field.onChange} />
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