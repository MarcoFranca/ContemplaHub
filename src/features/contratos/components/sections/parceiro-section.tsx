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
import { HandCoins, Handshake, Percent, Receipt } from "lucide-react";

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
    const parceiroId = useWatch({ control, name: "parceiroId" });
    const percentualComissao = useWatch({
        control,
        name: "percentualComissao",
    });

    const parceiroField = useController({
        control,
        name: "parceiroId",
    });

    const percentualComissaoField = useController({
        control,
        name: "percentualComissao",
    });

    const impostoRetidoPctField = useController({
        control,
        name: "impostoRetidoPct",
    });

    const comissaoObservacoesField = useController({
        control,
        name: "comissaoObservacoes",
    });

    const repassePercentualComissaoField = useController({
        control,
        name: "repassePercentualComissao",
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
            setValue("repassePercentualComissao", undefined, {
                shouldValidate: false,
            });
            setValue("parceiroObservacoes", null, {
                shouldValidate: false,
            });

            clearErrors([
                "parceiroId",
                "repassePercentualComissao",
                "parceiroObservacoes",
            ]);
        }
    }

    return (
        <PremiumFormSection
            badge="Financeiro"
            eyebrow="Comissão"
            title="Comissão e parceiro"
            description="Toda carta deve ter comissão. Quando houver parceiro, informe a parcela da comissão que será repassada."
            icon={<HandCoins className="h-3.5 w-3.5" />}
            headerAside={
                hasPartner ? (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
                        Parceiro: {parceiroSelecionado?.nome ?? "selecionado"}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300">
                        Comissão integral da empresa
                    </div>
                )
            }
            contentClassName="space-y-6"
        >
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-slate-200">
                        <Percent className="h-4 w-4 text-slate-400" />
                        Comissão da carta (%)
                    </Label>
                    <Input
                        value={
                            percentualComissaoField.field.value == null
                                ? ""
                                : String(percentualComissaoField.field.value).replace(".", ",")
                        }
                        onChange={(e) =>
                            percentualComissaoField.field.onChange(
                                parseNumberInput(e.target.value)
                            )
                        }
                        placeholder="Ex.: 4,00"
                        inputMode="decimal"
                        className="h-12 border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                    />
                    {errors.percentualComissao?.message ? (
                        <p className="text-sm text-red-400">
                            {String(errors.percentualComissao.message)}
                        </p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-slate-200">
                        <Receipt className="h-4 w-4 text-slate-400" />
                        Imposto retido do parceiro (%)
                    </Label>
                    <Input
                        value={
                            impostoRetidoPctField.field.value == null
                                ? ""
                                : String(impostoRetidoPctField.field.value).replace(".", ",")
                        }
                        onChange={(e) =>
                            impostoRetidoPctField.field.onChange(
                                parseNumberInput(e.target.value)
                            )
                        }
                        placeholder="Ex.: 10,00"
                        inputMode="decimal"
                        className="h-12 border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                    />
                    {errors.impostoRetidoPct?.message ? (
                        <p className="text-sm text-red-400">
                            {String(errors.impostoRetidoPct.message)}
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-slate-200">Observações da comissão</Label>
                <textarea
                    value={comissaoObservacoesField.field.value ?? ""}
                    onChange={(e) =>
                        comissaoObservacoesField.field.onChange(e.target.value || null)
                    }
                    placeholder="Ex.: comissão padrão da operação, observações internas..."
                    rows={3}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400/30 focus:ring-2 focus:ring-blue-400/10"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-slate-200">
                        <Handshake className="h-4 w-4 text-slate-400" />
                        Parceiro
                    </Label>
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

                {hasPartner ? (
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-slate-200">
                            <Percent className="h-4 w-4 text-slate-400" />
                            Repasse do parceiro (% da comissão)
                        </Label>
                        <Input
                            value={
                                repassePercentualComissaoField.field.value == null
                                    ? ""
                                    : String(
                                        repassePercentualComissaoField.field.value
                                    ).replace(".", ",")
                            }
                            onChange={(e) =>
                                repassePercentualComissaoField.field.onChange(
                                    parseNumberInput(e.target.value)
                                )
                            }
                            placeholder="Ex.: 50,00"
                            inputMode="decimal"
                            className="h-12 border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
                        />
                        {errors.repassePercentualComissao?.message ? (
                            <p className="text-sm text-red-400">
                                {String(errors.repassePercentualComissao.message)}
                            </p>
                        ) : null}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
                        <div className="text-sm font-medium text-white">
                            Operação sem parceiro
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                            A comissão continua existindo normalmente. Neste caso, ela fica
                            integralmente com a empresa.
                        </p>
                    </div>
                )}
            </div>

            {hasPartner ? (
                <div className="space-y-2">
                    <Label className="text-slate-200">Observações do parceiro</Label>
                    <textarea
                        value={parceiroObservacoesField.field.value ?? ""}
                        onChange={(e) =>
                            parceiroObservacoesField.field.onChange(e.target.value || null)
                        }
                        placeholder="Ex.: origem da parceria, regra combinada, observações do fechamento..."
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400/30 focus:ring-2 focus:ring-blue-400/10"
                    />
                </div>
            ) : null}

            {!hasPartner ? (
                <Alert className="border-emerald-400/20 bg-emerald-500/10 text-slate-100">
                    <AlertTitle className="text-white">
                        Comissão integral da empresa
                    </AlertTitle>
                    <AlertDescription className="text-slate-300">
                        Sem parceiro, o sistema cadastra a comissão da carta normalmente e
                        mantém o resultado financeiro integralmente na empresa.
                    </AlertDescription>
                </Alert>
            ) : (
                <Alert className="border-amber-400/20 bg-amber-500/10 text-slate-100">
                    <AlertTitle className="text-white">
                        Repasse calculado sobre a comissão
                    </AlertTitle>
                    <AlertDescription className="text-slate-300">
                        O percentual informado para o parceiro será aplicado sobre a
                        comissão da carta, e não diretamente sobre o valor da carta.
                    </AlertDescription>
                </Alert>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
                <strong className="text-white">Leitura operacional:</strong>{" "}
                comissão da carta: {percentualComissao ?? 0}%.
                {hasPartner
                    ? " Com parceiro, o sistema gerará o repasse sobre essa comissão."
                    : " Sem parceiro, a comissão será integral da empresa."}
            </div>
        </PremiumFormSection>
    );
}