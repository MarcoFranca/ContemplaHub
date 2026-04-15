"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, type Resolver, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
    BadgeCheck,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    FileText,
    Landmark,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

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

type StepKey = "identificacao" | "financeiro" | "fechamento";

function formatMoneyBR(value?: number | null) {
    if (value == null || Number.isNaN(value)) return "—";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function SummaryItem({
                         label,
                         value,
                     }: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                {label}
            </div>
            <div className="mt-1 text-sm font-medium text-slate-100">{value}</div>
        </div>
    );
}

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
    const [step, setStep] = useState<StepKey>("identificacao");

    const resolver = useMemo<Resolver<ContratoFormValues, any, ContratoFormValues>>(
        () =>
            mode === "fromLead"
                ? (zodResolver(fromLeadSchema) as Resolver<ContratoFormValues, any, ContratoFormValues>)
                : (zodResolver(registerExistingSchema) as Resolver<ContratoFormValues, any, ContratoFormValues>),
        [mode]
    );

    const form = useForm<ContratoFormValues, any, ContratoFormValues>({
        resolver,
        defaultValues: getContratoDefaultValues({ mode, leadId, dealId }),
    });

    const { isPending, serverError, createdContractId, submit } =
        useContratoFormSubmit(mode);

    const contractId = existingContractId ?? createdContractId;
    const watched = useWatch({ control: form.control });

    const administradoraNome =
        administradoras.find((a) => a.id === watched.administradoraId)?.nome ?? "—";

    const parceiroNome =
        parceiros.find((p) => p.id === watched.parceiroId)?.nome ?? "Sem parceiro";

    const steps = [
        {
            key: "identificacao" as const,
            title: "Identificação",
            description: "Administradora, grupo, cota e contrato.",
            icon: Landmark,
            fields: [
                "administradoraId",
                "grupoCodigo",
                "numeroCota",
                "numeroContrato",
                "dataAssinatura",
            ] as const,
        },
        {
            key: "financeiro" as const,
            title: "Carta / cota",
            description: "Produto, valores, prazo e assembleia.",
            icon: FileText,
            fields: [
                "produto",
                "prazo",
                "valorCarta",
                "valorParcela",
                "dataAdesao",
                "assembleiaDia",
                "observacoes",
            ] as const,
        },
        {
            key: "fechamento" as const,
            title: "Fechamento",
            description: "Parceiro, status inicial e documento.",
            icon: ShieldCheck,
            fields: [
                "parceiroId",
                "repassePercentual",
                "repasseValor",
                "parceiroObservacoes",
                "contractStatus",
                "cotaSituacao",
            ] as const,
        },
    ];

    const currentIndex = steps.findIndex((s) => s.key === step);
    const progress = ((currentIndex + 1) / steps.length) * 100;

    async function nextStep() {
        const current = steps[currentIndex];
        const valid = await form.trigger([...current.fields]);
        if (!valid) return;
        if (currentIndex < steps.length - 1) {
            setStep(steps[currentIndex + 1].key);
        }
    }

    function prevStep() {
        if (currentIndex > 0) {
            setStep(steps[currentIndex - 1].key);
        }
    }

    const checklist = [
        { label: "Administradora", ok: !!watched.administradoraId },
        { label: "Grupo", ok: !!watched.grupoCodigo },
        { label: "Cota", ok: !!watched.numeroCota },
        { label: "Valor da carta", ok: !!watched.valorCarta && watched.valorCarta > 0 },
        { label: "Prazo", ok: !!watched.prazo && watched.prazo > 0 },
    ];

    return (
        <div className={insideSheet ? "space-y-6" : "mx-auto max-w-7xl space-y-6"}>
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
                className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
            >
                <div className="space-y-6">
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-200">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Fluxo guiado premium
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-3xl font-semibold tracking-tight text-white">
                                        {mode === "fromLead"
                                            ? "Formalização de venda"
                                            : "Cadastro operacional premium"}
                                    </h2>

                                    <p className="max-w-2xl text-sm leading-6 text-slate-300">
                                        {mode === "fromLead"
                                            ? "Monte a formalização com clareza, ritmo visual e revisão viva da operação."
                                            : "Cadastre a carta existente com leitura fácil, progressão intuitiva e experiência premium integrada à carteira."}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                    Progresso
                                </div>
                                <div className="mt-1 text-sm font-medium text-slate-100">
                                    Etapa {currentIndex + 1} de {steps.length}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <Progress value={progress} className="h-2 bg-white/10" />
                            <div className="grid gap-3 md:grid-cols-3">
                                {steps.map((item, index) => {
                                    const Icon = item.icon;
                                    const isActive = item.key === step;
                                    const isDone = index < currentIndex;

                                    return (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => setStep(item.key)}
                                            className={[
                                                "rounded-2xl border px-4 py-4 text-left transition-all",
                                                isActive
                                                    ? "border-blue-400/35 bg-blue-500/10 shadow-[0_0_0_1px_rgba(96,165,250,0.12)]"
                                                    : "border-white/10 bg-white/[0.025] hover:bg-white/[0.045]",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={[
                                                        "mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl",
                                                        isDone
                                                            ? "bg-emerald-400/15 text-emerald-300"
                                                            : isActive
                                                                ? "bg-blue-400/15 text-blue-300"
                                                                : "bg-white/5 text-slate-300",
                                                    ].join(" ")}
                                                >
                                                    {isDone ? (
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    ) : (
                                                        <Icon className="h-5 w-5" />
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-white">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs leading-5 text-slate-400">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {mode === "fromLead" ? (
                        <Alert className="border-blue-400/20 bg-blue-500/10 text-slate-100">
                            <AlertTitle className="text-white">Modo de venda nova</AlertTitle>
                            <AlertDescription className="text-slate-300">
                                A carta nasce como formalização da venda. Estados avançados ficam para evolução posterior.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert className="border-amber-400/20 bg-amber-500/10 text-slate-100">
                            <AlertTitle className="text-white">Modo carteira / existente</AlertTitle>
                            <AlertDescription className="text-slate-300">
                                Use este fluxo quando o cliente já estiver ativo e a carta já existir no operacional.
                            </AlertDescription>
                        </Alert>
                    )}

                    {step === "identificacao" && (
                        <IdentificacaoSection
                            control={form.control}
                            administradoras={administradoras}
                        />
                    )}

                    {step === "financeiro" && (
                        <CotaFinanceiraSection control={form.control} />
                    )}

                    {step === "fechamento" && (
                        <div className="space-y-6">
                            <ParceiroSection control={form.control} parceiros={parceiros} />
                            {mode === "registerExisting" && (
                                <StatusInicialSection control={form.control} />
                            )}
                            <DocumentoSection contractId={contractId} />

                            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-white">
                                        Revisão antes de salvar
                                    </h3>
                                    <p className="text-sm leading-6 text-slate-400">
                                        Confira os principais dados da operação antes de concluir o cadastro.
                                    </p>
                                </div>

                                <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    <SummaryItem label="Administradora" value={administradoraNome} />
                                    <SummaryItem label="Grupo" value={watched.grupoCodigo || "—"} />
                                    <SummaryItem label="Cota" value={watched.numeroCota || "—"} />
                                    <SummaryItem label="Contrato" value={watched.numeroContrato || "—"} />
                                    <SummaryItem
                                        label="Valor da carta"
                                        value={formatMoneyBR(watched.valorCarta)}
                                    />
                                    <SummaryItem
                                        label="Prazo"
                                        value={watched.prazo ? `${watched.prazo} meses` : "—"}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="sticky bottom-0 z-10 rounded-[28px] border border-white/10 bg-slate-950/80 p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs leading-6 text-slate-400">
                                {step === "identificacao" &&
                                    "Primeiro defina a base da operação com clareza visual e contexto."}
                                {step === "financeiro" &&
                                    "Agora complete os dados da carta com máscara e leitura intuitiva."}
                                {step === "fechamento" &&
                                    "Finalize parceiro, estado inicial e documento antes de salvar."}
                            </p>

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

                                {currentIndex > 0 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        disabled={isPending}
                                    >
                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                        Voltar
                                    </Button>
                                )}

                                {currentIndex < steps.length - 1 ? (
                                    <Button type="button" onClick={nextStep} disabled={isPending}>
                                        Próximo
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? "Salvando..." : "Salvar contrato"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="hidden xl:block">
                    <div className="sticky top-0 space-y-4">
                        <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                            <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                <BadgeCheck className="h-4 w-4 text-emerald-300" />
                                Resumo da operação
                            </div>

                            <div className="mt-5 space-y-4">
                                <SummaryItem label="Administradora" value={administradoraNome} />
                                <SummaryItem label="Grupo" value={watched.grupoCodigo || "—"} />
                                <SummaryItem label="Cota" value={watched.numeroCota || "—"} />
                                <SummaryItem label="Contrato" value={watched.numeroContrato || "—"} />
                                <SummaryItem label="Produto" value={watched.produto || "—"} />
                                <SummaryItem
                                    label="Valor da carta"
                                    value={formatMoneyBR(watched.valorCarta)}
                                />
                                <SummaryItem
                                    label="Prazo"
                                    value={watched.prazo ? `${watched.prazo} meses` : "—"}
                                />
                                <SummaryItem label="Parceiro" value={parceiroNome} />

                                <Separator className="bg-white/10" />

                                <div className="space-y-3">
                                    <div className="text-sm font-medium text-white">
                                        Checklist visual
                                    </div>

                                    <div className="space-y-2">
                                        {checklist.map((item) => (
                                            <div
                                                key={item.label}
                                                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2"
                                            >
                                                <span className="text-sm text-slate-300">{item.label}</span>
                                                <span
                                                    className={[
                                                        "text-xs font-medium",
                                                        item.ok ? "text-emerald-300" : "text-slate-500",
                                                    ].join(" ")}
                                                >
                          {item.ok ? "OK" : "Pendente"}
                        </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </form>
        </div>
    );
}