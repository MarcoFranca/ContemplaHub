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

export function ContratoIdentificacaoFields({ control }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Controller
                name="grupoCodigo"
                control={control}
                render={({ field, fieldState }) => (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Grupo</label>
                        <input {...field} className="w-full rounded-xl border px-3 py-2" />
                        {fieldState.error && (
                            <p className="text-sm text-red-600">{fieldState.error.message}</p>
                        )}
                    </div>
                )}
            />

            <Controller
                name="numeroCota"
                control={control}
                render={({ field, fieldState }) => (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Número da cota</label>
                        <input {...field} className="w-full rounded-xl border px-3 py-2" />
                        {fieldState.error && (
                            <p className="text-sm text-red-600">{fieldState.error.message}</p>
                        )}
                    </div>
                )}
            />

            <Controller
                name="numeroContrato"
                control={control}
                render={({ field, fieldState }) => (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Número do contrato</label>
                        <input
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            className="w-full rounded-xl border px-3 py-2"
                        />
                        {fieldState.error && (
                            <p className="text-sm text-red-600">{fieldState.error.message}</p>
                        )}
                    </div>
                )}
            />

            <Controller
                name="dataAssinatura"
                control={control}
                render={({ field, fieldState }) => (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Data de assinatura</label>
                        <input
                            type="date"
                            value={field.value ?? ""}
                            onChange={field.onChange}
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