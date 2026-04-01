"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { fireSuccessConfetti } from "@/lib/ui/confetti";

import type {
    ContratoFormMode,
    ContratoFormValues,
} from "../types/contrato-form.types";
import { createContratoFromLeadAction } from "../actions/create-from-lead";
import { registerExistingContratoAction } from "../actions/register-existing";

export function useContratoFormSubmit(mode: ContratoFormMode) {
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);
    const [createdContractId, setCreatedContractId] = useState<string | null>(null);

    async function submit(values: ContratoFormValues) {
        return new Promise<{ ok: boolean; contractId: string | null }>((resolve) => {
            setServerError(null);

            startTransition(async () => {
                const result =
                    mode === "fromLead"
                        ? await createContratoFromLeadAction(values)
                        : await registerExistingContratoAction(values);

                if (!result.ok) {
                    const message =
                        typeof result.error === "string"
                            ? result.error
                            : "Não foi possível salvar o contrato.";

                    setServerError(message);
                    toast.error(message);
                    resolve({ ok: false, contractId: null });
                    return;
                }

                const contractId =
                    result?.data?.contract_id ??
                    result?.data?.contrato_id ??
                    result?.data?.id ??
                    null;

                setCreatedContractId(contractId);

                toast.success(
                    mode === "fromLead"
                        ? "Contrato criado com sucesso."
                        : "Carta e contrato cadastrados com sucesso."
                );

                void fireSuccessConfetti();

                resolve({ ok: true, contractId });
            });
        });
    }

    return {
        isPending,
        serverError,
        createdContractId,
        submit,
    };
}