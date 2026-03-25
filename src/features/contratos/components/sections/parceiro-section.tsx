"use client";

import { Controller, type Control, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    const parceiroId = useWatch({
        control,
        name: "parceiroId",
    });

    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle>Parceiro e repasse</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <Controller
                    name="parceiroId"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label>Parceiro</Label>
                            <ParceiroSelectField
                                value={field.value}
                                onChange={field.onChange}
                                options={parceiros}
                            />
                            {fieldState.error && (
                                <p className="text-sm text-destructive">
                                    {fieldState.error.message}
                                </p>
                            )}
                        </div>
                    )}
                />

                {parceiroId ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Controller
                            name="repassePercentual"
                            control={control}
                            render={({ field, fieldState }) => (
                                <div className="space-y-2">
                                    <Label>Repasse percentual</Label>
                                    <MoneyField value={field.value} onChange={field.onChange} />
                                    {fieldState.error && (
                                        <p className="text-sm text-destructive">
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        <Controller
                            name="repasseValor"
                            control={control}
                            render={({ field, fieldState }) => (
                                <div className="space-y-2">
                                    <Label>Repasse valor fixo</Label>
                                    <MoneyField value={field.value} onChange={field.onChange} />
                                    {fieldState.error && (
                                        <p className="text-sm text-destructive">
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        <Controller
                            name="parceiroObservacoes"
                            control={control}
                            render={({ field, fieldState }) => (
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Observações do parceiro</Label>
                                    <Textarea
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        rows={3}
                                    />
                                    {fieldState.error && (
                                        <p className="text-sm text-destructive">
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                ) : (
                    <Alert>
                        <AlertTitle>Sem parceiro vinculado</AlertTitle>
                        <AlertDescription>
                            Se houver parceiro, informe também o repasse percentual ou valor.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}