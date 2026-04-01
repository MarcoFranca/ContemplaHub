"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
    fromLeadSchema,
    registerExistingSchema,
} from "../schemas/contrato-base.schema";
import type {
    ContratoFormShellV2Props,
    ContratoFormValues,
} from "../types/contrato-form.types";
import { getContratoDefaultValues } from "../utils/contrato-default-values";
import { IdentificacaoSection } from "./sections/identificacao-section";
import { CotaFinanceiraSection } from "./sections/cota-financeira-section";
import { ParceiroSection } from "./sections/parceiro-section";
import { StatusInicialSection } from "./sections/status-inicial-section";
import { DocumentoSection } from "./sections/documento-section";
import { useContratoFormSubmit } from "../hooks/use-contrato-form-submit";

export function ContratoFormShellV2({
                                        mode,
                                        leadId,
                                        dealId,
                                        administradoras,
                                        parceiros = [],
                                        existingContractId,
                                        onSuccess,
                                        insideSheet = false,
                                    }: ContratoFormShellV2Props) {
    const router = useRouter();

    const resolver = useMemo<Resolver<ContratoFormValues, any, ContratoFormValues>>(
        () =>
            mode === "fromLead"
                ? (zodResolver(fromLeadSchema) as Resolver<
                    ContratoFormValues,
                    any,
                    ContratoFormValues
                >)
                : (zodResolver(registerExistingSchema) as Resolver<
                    ContratoFormValues,
                    any,
                    ContratoFormValues
                >),
        [mode]
    );

    const form = useForm<ContratoFormValues, any, ContratoFormValues>({
        resolver,
        defaultValues: getContratoDefaultValues({ mode, leadId, dealId }),
    });

    const { isPending, serverError, createdContractId, submit } =
        useContratoFormSubmit(mode);

    const contractId = existingContractId ?? createdContractId;

    return (
        <div className={insideSheet ? "space-y-6" : "mx-auto max-w-5xl space-y-6"}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {mode === "fromLead" ? "Novo contrato" : "Registrar contrato existente"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {mode === "fromLead"
                            ? "Fluxo comercial vindo do lead e da negociação."
                            : "Fluxo direto para cliente já ativo na carteira."}
                    </p>
                </div>

                <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
                    {mode === "fromLead" ? "Venda nova" : "Carteira / existente"}
                </Badge>
            </div>

            {mode === "fromLead" ? (
                <Alert>
                    <AlertTitle>Regra do fluxo</AlertTitle>
                    <AlertDescription>
                        Neste modo, o contrato nasce como formalização da venda e a cota deve
                        iniciar ativa; estados avançados ficam para evolução posterior.
                    </AlertDescription>
                </Alert>
            ) : (
                <Alert>
                    <AlertTitle>Cadastro operacional</AlertTitle>
                    <AlertDescription>
                        Use este modo quando o cliente já estiver na carteira e já possuir
                        carta/contrato em andamento.
                    </AlertDescription>
                </Alert>
            )}

            {serverError && (
                <Alert variant="destructive">
                    <AlertTitle>Erro ao salvar</AlertTitle>
                    <AlertDescription>{serverError}</AlertDescription>
                </Alert>
            )}

            <form
                onSubmit={form.handleSubmit(async (values) => {
                    const result = await submit(values);

                    if (!result.ok) return;

                    onSuccess?.({ contractId: result.contractId });

                    if (insideSheet) return;

                    if (result.contractId) {
                        router.push(`/app/contratos/${result.contractId}`);
                        router.refresh();
                        return;
                    }

                    router.push(`/app/carteira/${leadId}`);
                    router.refresh();
                })}
                className="space-y-6"
            >
                <IdentificacaoSection
                    control={form.control}
                    administradoras={administradoras}
                />

                <CotaFinanceiraSection control={form.control} />

                <ParceiroSection control={form.control} parceiros={parceiros} />

                {mode === "registerExisting" && (
                    <StatusInicialSection control={form.control} />
                )}

                <DocumentoSection contractId={contractId} />

                <Separator />

                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            form.reset(getContratoDefaultValues({ mode, leadId, dealId }))
                        }
                        disabled={isPending}
                    >
                        Limpar
                    </Button>

                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Salvando..." : "Salvar contrato"}
                    </Button>
                </div>
            </form>
        </div>
    );
}