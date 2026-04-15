"use client";

import { Controller, type Control } from "react-hook-form";
import { z } from "zod";
import {
    fromLeadSchema,
    registerExistingSchema,
} from "../schemas/contrato-base.schema";

type ContratoFormInput =
    | z.input<typeof fromLeadSchema>
    | z.input<typeof registerExistingSchema>;

interface Props {
    control: Control<ContratoFormInput>;
}

function getInputValue(value: unknown): string | number {
    if (typeof value === "number" || typeof value === "string") return value;
    return "";
}

function parseNullableNumber(value: string): number | null {
    if (!value.trim()) return null;
    return Number(value);
}

export function CotaFields({ control }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Controller
                name="valorCarta"
                control={control}
                render={({ field, fieldState }) => (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Valor da carta</label>
                        <input
                            type="number"
                            step="0.01"
                            value={getInputValue(field.value)}
                            onChange={(e) => field.onChange(parseNullableNumber(e.target.value))}
                            className="w-full rounded-xl border px-3 py-2"
                        />
                        {fieldState.error && (
                            <p className="text-sm text-red-600">{fieldState.error.message}</p>
                        )}
                    </div>
                )}
            />

            <Controller
                name="prazo"
                control={control}
                render={({ field, fieldState }) => (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Prazo</label>
                        <input
                            type="number"
                            value={getInputValue(field.value)}
                            onChange={(e) => field.onChange(parseNullableNumber(e.target.value))}
                            className="w-full rounded-xl border px-3 py-2"
                        />
                        {fieldState.error && (
                            <p className="text-sm text-red-600">{fieldState.error.message}</p>
                        )}
                    </div>
                )}
            />

            <Controller
                name="valorParcela"
                control={control}
                render={({ field, fieldState }) => (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Valor da parcela</label>
                        <input
                            type="number"
                            step="0.01"
                            value={getInputValue(field.value)}
                            onChange={(e) => field.onChange(parseNullableNumber(e.target.value))}
                            className="w-full rounded-xl border px-3 py-2"
                        />
                        {fieldState.error && (
                            <p className="text-sm text-red-600">{fieldState.error.message}</p>
                        )}
                    </div>
                )}
            />

            <Controller
                name="dataAdesao"
                control={control}
                render={({ field, fieldState }) => (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Data de adesão</label>
                        <input
                            type="date"
                            value={typeof field.value === "string" ? field.value : ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                            className="w-full rounded-xl border px-3 py-2"
                        />
                        {fieldState.error && (
                            <p className="text-sm text-red-600">{fieldState.error.message}</p>
                        )}
                    </div>
                )}
            />
        </div>
    );
}