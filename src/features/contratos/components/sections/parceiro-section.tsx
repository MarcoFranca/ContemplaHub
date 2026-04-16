"use client";

import { useMemo } from "react";
import {
    type Control,
    type FieldErrors,
    type UseFormClearErrors,
    type UseFormSetValue,
    useController,
    useWatch,
} from "react-hook-form";
import { Handshake, Info, Percent, Wallet } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import type {
    ContratoFormValues,
    ParceiroOption,
} from "../../types/contrato-form.types";
import { PremiumFormSection } from "../section-base/premium-form-section";

type Props = {
    control: Control<ContratoFormValues>;
    parceiros?: ParceiroOption[];
    setValue: UseFormSetValue<ContratoFormValues>;
    clearErrors: UseFormClearErrors<ContratoFormValues>;
    errors: FieldErrors<ContratoFormValues>;
};

function parseNumberInput(value: string): number | undefined {
    if (!value) return undefined;

    const normalized = value.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);

    if (Number.isNaN(parsed)) return undefined;
    return parsed;
}

export function ParceiroSection({
                                    control,
                                    parceiros = [],
                                    setValue,
                                    clearErrors,
                                    errors,
                                }: Props) {
    const parceiroId = useWatch({
        control,
        name: "parceiroId",
    });

    const parceiroField = useController({
        control,
        name: "parceiroId",
    });

    const repassePercentualField = useController({
        control,
        name: "repassePercentual",
    });

    const repasseValorField = useController({
        control,
        name: "repasseValor",
    });

    const parceiroObservacoesField = useController({
        control,
        name: "parceiroObservacoes",
    });

    const hasPartner = !!parceiroId;

    const parceiroSelecionado = useMemo(
        () => parceiros.find((item) => item.id === parceiroId),
        [parceiros, parceiroId]
    );

    function handleParceiroChange(value: string) {
        const semParceiro = value === "none";

        parceiroField.field.onChange(semParceiro ? null : value);

        if (semParceiro) {
            setValue("repassePercentual", undefined, { shouldValidate: false });
            setValue("repasseValor", undefined, { shouldValidate: false });
            setValue("parceiroObservacoes", null, { shouldValidate: false });

            clearErrors([
                "parceiroId",
                "repassePercentual",
                "repasseValor",
                "parceiroObservacoes",
            ]);
        }
    }

    return (
        <PremiumFormSection
            badge="Opcional"
            eyebrow="Parceria"
            title="Parceiro comercial"
            description="Use esta seção apenas quando a operação tiver origem compartilhada. Sem parceiro, o cadastro segue normalmente."
            icon={<Handshake className="h-3.5 w-3.5" />}
            headerAside={
                hasPartner ? (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
                        Parceiro selecionado
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300">
                        Sem parceiro
                    </div>
                )
            }
        >
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label className="text-slate-200">Parceiro</Label>
                    <Select
                        value={parceiroId ?? "none"}
                        onValueChange={handleParceiroChange}
                    >
                        <SelectTrigger className="h-12 border-white/10 bg-white/[0.03] text-white">
                            <SelectValue placeholder="Selecione um parceiro" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sem parceiro</SelectItem>
                            {parceiros.map((parceiro) => (
                                <SelectItem key={parceiro.id} value={parceiro.id}>
                                    {parceiro.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {errors.parceiroId?.message ? (
                        <p className="text-sm text-red-400">
                            {String(errors.parceiroId.message)}
                        </p>
                    ) : null}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl bg-white/5 p-2 text-slate-300">
                            <Info className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-white">
                                Regra operacional
                            </p>
                            <p className="text-sm leading-6 text-slate-400">
                                O repasse só deve ser informado quando houver parceiro
                                vinculado. Sem parceiro, a operação segue sem comissão.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {!hasPartner ? (
                <Alert className="border-blue-400/20 bg-blue-500/10 text-slate-100">
                    <AlertTitle className="text-white">Operação sem parceiro</AlertTitle>
                    <AlertDescription className="text-slate-300">
                        Perfeito. Esta venda pode ser salva normalmente sem parceiro
                        vinculado.
                    </AlertDescription>
                </Alert>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-slate-200">
                                <Percent className="h-4 w-4 text-slate-400" />
                                Repasse percentual
                            </Label>
                            <Input
                                value={
                                    repassePercentualField.field.value == null
                                        ? ""
                                        : String(repassePercentualField.field.value).replace(
                                            ".",
                                            ","
                                        )
                                }
                                onChange={(e) => {
                                    repassePercentualField.field.onChange(
                                        parseNumberInput(e.target.value)
                                    );
                                }}
                                placeholder="Ex.: 5,00"
                                inputMode="decimal"
                                className="h-12 border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                            />
                            {errors.repassePercentual?.message ? (
                                <p className="text-sm text-red-400">
                                    {String(errors.repassePercentual.message)}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-slate-200">
                                <Wallet className="h-4 w-4 text-slate-400" />
                                Repasse em valor
                            </Label>
                            <Input
                                value={
                                    repasseValorField.field.value == null
                                        ? ""
                                        : String(repasseValorField.field.value).replace(
                                            ".",
                                            ","
                                        )
                                }
                                onChange={(e) => {
                                    repasseValorField.field.onChange(
                                        parseNumberInput(e.target.value)
                                    );
                                }}
                                placeholder="Ex.: 2.500,00"
                                inputMode="decimal"
                                className="h-12 border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                            />
                            {errors.repasseValor?.message ? (
                                <p className="text-sm text-red-400">
                                    {String(errors.repasseValor.message)}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-200">Observações do parceiro</Label>
                        <textarea
                            value={parceiroObservacoesField.field.value ?? ""}
                            onChange={(e) =>
                                parceiroObservacoesField.field.onChange(
                                    e.target.value || null
                                )
                            }
                            placeholder="Ex.: origem da parceria, regra combinada, observações do fechamento..."
                            rows={4}
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400/30 focus:ring-2 focus:ring-blue-400/10"
                        />
                        {errors.parceiroObservacoes?.message ? (
                            <p className="text-sm text-red-400">
                                {String(errors.parceiroObservacoes.message)}
                            </p>
                        ) : null}
                    </div>

                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                        <div className="text-sm font-medium text-emerald-100">
                            Parceiro vinculado
                        </div>
                        <div className="mt-1 text-sm text-emerald-200/90">
                            {parceiroSelecionado?.nome ?? "Parceiro selecionado"} será
                            considerado no fechamento e no histórico comercial.
                        </div>
                    </div>
                </>
            )}
        </PremiumFormSection>
    );
}