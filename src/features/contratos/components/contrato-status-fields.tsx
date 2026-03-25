"use client";

import { Controller, type Control } from "react-hook-form";
import type { ContratoFormInput } from "../schemas/contrato-base.schema";

interface Props {
    control: Control<ContratoFormInput>;
}

export function ContratoStatusFields({ control }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Controller
                name="contractStatus"
                control={control}
                render={({ field, fieldState }) => (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Status do contrato</label>
                        <select
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            className="w-full rounded-xl border px-3 py-2"
                        >
                            <option value="">Selecione</option>
                            <option value="pendente_assinatura">Pendente de assinatura</option>
                            <option value="pendente_pagamento">Pendente de pagamento</option>
                            <option value="alocado">Alocado</option>
                            <option value="contemplado">Contemplado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                        {fieldState.error && (
                            <p className="text-sm text-red-600">{fieldState.error.message}</p>
                        )}
                    </div>
                )}
            />

            <Controller
                name="cotaSituacao"
                control={control}
                render={({ field, fieldState }) => (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Situação da cota</label>
                        <select
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            className="w-full rounded-xl border px-3 py-2"
                        >
                            <option value="">Selecione</option>
                            <option value="ativa">Ativa</option>
                            <option value="contemplada">Contemplada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                        {fieldState.error && (
                            <p className="text-sm text-red-600">{fieldState.error.message}</p>
                        )}
                    </div>
                )}
            />
        </div>
    );
}