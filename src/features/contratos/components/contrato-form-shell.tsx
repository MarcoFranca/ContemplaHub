"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { createContratoFromLeadAction } from "../actions/create-from-lead";
import { registerExistingContratoAction } from "../actions/register-existing";
import {
    fromLeadSchema,
    registerExistingSchema,
    type ContratoFormInput,
    type ContratoFormOutput,
} from "../schemas/contrato-base.schema";
import type { ContratoFormMode } from "../types/contrato-form.types";
import { getContratoDefaultValues } from "../utils/contrato-default-values";
import { ContratoIdentificacaoFields } from "./contrato-identificacao-fields";
import { CotaFields } from "./cota-fields";
import { ContratoStatusFields } from "./contrato-status-fields";

interface Props {
    mode: ContratoFormMode;
    leadId: string;
    dealId?: string | null;
}

export function ContratoFormShell({ mode, leadId, dealId }: Props) {
    const [serverError, setServerError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const resolver =
        mode === "fromLead"
            ? zodResolver(fromLeadSchema)
            : zodResolver(registerExistingSchema);

    const form = useForm<ContratoFormInput, unknown, ContratoFormOutput>({
        resolver,
        defaultValues: getContratoDefaultValues({ mode, leadId, dealId }),
    });

    const onSubmit: SubmitHandler<ContratoFormOutput> = async (values) => {
        setServerError(null);

        startTransition(async () => {
            const result =
                mode === "fromLead"
                    ? await createContratoFromLeadAction(values)
                    : await registerExistingContratoAction(values);

            if (!result.ok) {
                setServerError(
                    typeof result.error === "string"
                        ? result.error
                        : "Não foi possível salvar o contrato."
                );
                return;
            }

            alert("Contrato/cota cadastrados com sucesso.");
        });
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm"
        >
            <div>
                <h1 className="text-xl font-semibold">
                    {mode === "fromLead" ? "Novo contrato" : "Registrar contrato existente"}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {mode === "fromLead"
                        ? "Fluxo vindo do funil de vendas."
                        : "Fluxo direto para cliente já ativo na carteira."}
                </p>
            </div>

            {serverError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {serverError}
                </div>
            )}

            <section className="space-y-3">
                <h2 className="text-base font-semibold">Identificação</h2>
                <ContratoIdentificacaoFields control={form.control} />
            </section>

            <section className="space-y-3">
                <h2 className="text-base font-semibold">Dados da cota</h2>
                <CotaFields control={form.control} />
            </section>

            {mode === "registerExisting" && (
                <section className="space-y-3">
                    <h2 className="text-base font-semibold">Estado inicial</h2>
                    <ContratoStatusFields control={form.control} />
                </section>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                    {isPending ? "Salvando..." : "Salvar"}
                </button>
            </div>
        </form>
    );
}