"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, type Resolver, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
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

import { ContratoFormStepper } from "./form-shell/contrato-form-stepper";
import { ContratoFormReviewCard } from "./form-shell/contrato-form-review-card";
import { ContratoFormSummaryItem } from "./form-shell/contrato-form-summary-item";

type StepKey = "identificacao" | "financeiro" | "fechamento";

function formatMoneyBR(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatPercentBR(value?: number | null, suffix = "%") {
  if (value == null || Number.isNaN(value)) return "—";
  return `${String(value).replace(".", ",")}${suffix}`;
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
      description: "Comissão, parceiro, status inicial e documento.",
      icon: ShieldCheck,
      fields: [
        "percentualComissao",
        "impostoRetidoPct",
        "comissaoObservacoes",
        "parceiroId",
        "repassePercentualComissao",
        "parceiroObservacoes",
        "contractStatus",
        "cotaSituacao",
      ] as const,
    },
  ];

  const currentIndex = steps.findIndex((s) => s.key === step);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const shellCardClassName = insideSheet
      ? "rounded-[24px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6"
      : "rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl";

  const showAside = !insideSheet;
  const formId = `contrato-form-${leadId}`;

  async function nextStep(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();

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

  async function handleValidSubmit(values: ContratoFormValues) {
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
  }

  const checklist = [
    { label: "Administradora", ok: !!watched.administradoraId },
    { label: "Grupo", ok: !!watched.grupoCodigo },
    { label: "Cota", ok: !!watched.numeroCota },
    { label: "Valor da carta", ok: !!watched.valorCarta && watched.valorCarta > 0 },
    { label: "Prazo", ok: !!watched.prazo && watched.prazo > 0 },
  ];

  return (
      <div
          className={
            insideSheet
                ? "flex h-full min-h-0 flex-col"
                : "mx-auto max-w-7xl space-y-6"
          }
      >
        {serverError && (
            <Alert variant="destructive">
              <AlertTitle>Erro ao salvar</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
        )}

        <div className={insideSheet ? "min-h-0 flex-1 overflow-y-auto pr-1" : ""}>
          <form
              id={formId}
              onSubmit={form.handleSubmit(handleValidSubmit)}
              className={
                showAside
                    ? "grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
                    : "space-y-5"
              }
          >
            <div className="space-y-5">
              <div className={shellCardClassName}>
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

                  <ContratoFormStepper
                      steps={steps}
                      currentIndex={currentIndex}
                      currentStep={step}
                      onChange={(nextStep) => setStep(nextStep as StepKey)}
                  />
                </div>
              </div>

              {mode === "fromLead" ? (
                  <Alert className="border-blue-400/20 bg-blue-500/10 text-slate-100">
                    <AlertTitle className="text-white">Modo de venda nova</AlertTitle>
                    <AlertDescription className="text-slate-300">
                      A carta nasce como formalização da venda. Estados avançados
                      ficam para evolução posterior.
                    </AlertDescription>
                  </Alert>
              ) : (
                  <Alert className="border-amber-400/20 bg-amber-500/10 text-slate-100">
                    <AlertTitle className="text-white">
                      Modo carteira / contrato já existente
                    </AlertTitle>
                    <AlertDescription className="text-slate-300">
                      Use quando o cliente já estiver ativo e a carta já fizer parte
                      do operacional. Aqui você pode definir parceiro, situação
                      inicial e documento.
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
                  <div className="space-y-5">
                    <ParceiroSection
                        control={form.control}
                        parceiros={parceiros}
                        setValue={form.setValue}
                        clearErrors={form.clearErrors}
                        errors={form.formState.errors}
                    />

                    {mode === "registerExisting" && (
                        <StatusInicialSection control={form.control} />
                    )}

                    <DocumentoSection contractId={contractId} />

                    <ContratoFormReviewCard
                        className={shellCardClassName}
                        values={watched}
                        administradoraNome={administradoraNome}
                        parceiroNome={parceiroNome}
                    />
                  </div>
              )}
            </div>

            {showAside ? (
                <aside className="hidden xl:block">
                  <div className="sticky top-0 space-y-4">
                    <div className={shellCardClassName}>
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <BadgeCheck className="h-4 w-4 text-emerald-300" />
                        Resumo da operação
                      </div>

                      <div className="mt-5 space-y-4">
                        <ContratoFormSummaryItem
                            label="Administradora"
                            value={administradoraNome}
                        />
                        <ContratoFormSummaryItem
                            label="Grupo"
                            value={watched.grupoCodigo || "—"}
                        />
                        <ContratoFormSummaryItem
                            label="Cota"
                            value={watched.numeroCota || "—"}
                        />
                        <ContratoFormSummaryItem
                            label="Contrato"
                            value={watched.numeroContrato || "—"}
                        />
                        <ContratoFormSummaryItem
                            label="Produto"
                            value={watched.produto || "—"}
                        />
                        <ContratoFormSummaryItem
                            label="Valor da carta"
                            value={formatMoneyBR(watched.valorCarta)}
                        />
                        <ContratoFormSummaryItem
                            label="Prazo"
                            value={watched.prazo ? `${watched.prazo} meses` : "—"}
                        />
                        <ContratoFormSummaryItem
                            label="Comissão"
                            value={formatPercentBR(watched.percentualComissao)}
                        />
                        <ContratoFormSummaryItem
                            label="Parceiro"
                            value={parceiroNome}
                        />
                        <ContratoFormSummaryItem
                            label="Repasse"
                            value={
                              watched.parceiroId
                                  ? formatPercentBR(
                                      watched.repassePercentualComissao,
                                      "% da comissão"
                                  )
                                  : "Sem parceiro"
                            }
                        />

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
                            <span className="text-sm text-slate-300">
                              {item.label}
                            </span>
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
            ) : null}
          </form>
        </div>

        <div
            className={
              insideSheet
                  ? "mt-5 border-t border-white/10 bg-slate-950/85 px-1 py-4 backdrop-blur-xl"
                  : "border border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl rounded-[24px]"
            }
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-6 text-slate-400">
              {step === "identificacao" &&
                  "Defina a base da operação com clareza antes de avançar."}
              {step === "financeiro" &&
                  "Complete as condições da carta com foco em conferência rápida."}
              {step === "fechamento" &&
                  "Revise os dados finais e conclua o cadastro da carta."}
            </p>

            <div className="flex flex-wrap items-center justify-end gap-3">
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
                      key={`back-${step}`}
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
                  <Button
                      key={`next-${step}`}
                      type="button"
                      onClick={(e) => void nextStep(e)}
                      disabled={isPending}
                  >
                    Próximo
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
              ) : (
                  <Button
                      key={`submit-${step}`}
                      type="submit"
                      form={formId}
                      disabled={isPending}
                  >
                    {isPending ? "Salvando..." : "Cadastrar carta"}
                  </Button>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}