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
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import { useContratoFormSubmit } from "../hooks/use-contrato-form-submit";
import {
  fromLeadSchema,
  registerExistingSchema,
} from "../schemas/contrato-base.schema";
import type {
  ContratoFormShellV2Props,
  ContratoFormValues,
} from "../types/contrato-form.types";
import { getContratoDefaultValues } from "../utils/contrato-default-values";
import { calculateCartaFinancialSnapshot } from "../utils/financial-calculations";
import { ContratoFormReviewCard } from "./form-shell/contrato-form-review-card";
import { ContratoFormSummaryItem } from "./form-shell/contrato-form-summary-item";
import { ContratoFormStepper } from "./form-shell/contrato-form-stepper";
import { ComponentesFinanceirosSection } from "./sections/componentes-financeiros-section";
import { CondicoesOperacionaisSection } from "./sections/condicoes-operacionais-section";
import { CotaFinanceiraSection } from "./sections/cota-financeira-section";
import { DocumentoSection } from "./sections/documento-section";
import { FormalizacaoSection } from "./sections/formalizacao-section";
import { IdentificacaoSection } from "./sections/identificacao-section";
import { ParceiroSection } from "./sections/parceiro-section";
import { StatusInicialSection } from "./sections/status-inicial-section";

type StepKey =
  | "identificacao"
  | "cota"
  | "formalizacao"
  | "estadoInicial"
  | "revisao";

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

  const resolver = useMemo<Resolver<ContratoFormValues, unknown, ContratoFormValues>>(
    () =>
      mode === "fromLead"
        ? (zodResolver(fromLeadSchema) as Resolver<
            ContratoFormValues,
            unknown,
            ContratoFormValues
          >)
        : (zodResolver(registerExistingSchema) as Resolver<
            ContratoFormValues,
            unknown,
            ContratoFormValues
          >),
    [mode],
  );

  const form = useForm<ContratoFormValues, unknown, ContratoFormValues>({
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

  const financialSnapshot = calculateCartaFinancialSnapshot(watched);

  const baseSteps = [
    {
      key: "identificacao" as const,
      title: "Identificação",
      description: "Administradora, grupo e número da cota.",
      icon: Landmark,
      fields: ["administradoraId", "grupoCodigo", "numeroCota"] as const,
    },
    {
      key: "cota" as const,
      title: "Carta / cota",
      description: "Produto, valores, taxas e modalidades operacionais.",
      icon: FileText,
      fields: [
        "produto",
        "prazo",
        "valorCarta",
        "valorParcela",
        "dataAdesao",
        "assembleiaDia",
        "observacoes",
        "taxaAdminPercentual",
        "taxaAdminValorMensal",
        "fundoReservaPercentual",
        "fundoReservaValorMensal",
        "seguroPrestamistaAtivo",
        "seguroPrestamistaPercentual",
        "seguroPrestamistaValorMensal",
        "taxaAdminAntecipadaAtivo",
        "taxaAdminAntecipadaPercentual",
        "taxaAdminAntecipadaFormaPagamento",
        "taxaAdminAntecipadaParcelas",
        "taxaAdminAntecipadaValorTotal",
        "taxaAdminAntecipadaValorParcela",
        "parcelaReduzida",
        "percentualReducao",
        "valorParcelaSemRedutor",
        "embutidoPermitido",
        "embutidoMaxPercent",
        "fgtsPermitido",
        "autorizacaoGestao",
        "opcoesLanceFixo",
      ] as const,
    },
    {
      key: "formalizacao" as const,
      title: "Formalização",
      description: "Contrato, assinatura, comissão e parceiro.",
      icon: ShieldCheck,
      fields: [
        "numeroContrato",
        "dataAssinatura",
        "percentualComissao",
        "impostoRetidoPct",
        "comissaoObservacoes",
        "parceiroId",
        "repassePercentualComissao",
        "parceiroObservacoes",
      ] as const,
    },
  ] as const;

  const stateSteps =
    mode === "registerExisting"
      ? [
          {
            key: "estadoInicial" as const,
            title: "Estado inicial",
            description: "Status do contrato e situação da cota.",
            icon: Settings2,
            fields: ["contractStatus", "cotaSituacao"] as const,
          },
        ]
      : [];

  const reviewSteps = [
    {
      key: "revisao" as const,
      title: "Revisão final",
      description: "Documento, modo atual e conferência antes de salvar.",
      icon: BadgeCheck,
      fields: [] as const,
    },
  ] as const;

  const steps = [...baseSteps, ...stateSteps, ...reviewSteps];

  const currentIndex = steps.findIndex((s) => s.key === step);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const shellCardClassName = insideSheet
    ? "rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:p-5"
    : "rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl";

  const showAside = !insideSheet;
  const formId = `contrato-form-${leadId}`;

  async function nextStep(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();

    const current = steps[currentIndex];
    const valid = current.fields.length
      ? await form.trigger([...current.fields])
      : true;

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

    onSuccess?.({
      contractId: result.contractId,
      cotaId: result.cotaId ?? null,
    });

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
    {
      label: "Componentes financeiros",
      ok:
        !watched.seguroPrestamistaAtivo ||
        watched.seguroPrestamistaPercentual != null ||
        watched.seguroPrestamistaValorMensal != null,
    },
    {
      label: "Modalidades revisadas",
      ok: !watched.parcelaReduzida || watched.percentualReducao != null,
    },
    { label: "Formalização", ok: !!watched.numeroContrato && !!watched.dataAssinatura },
    {
      label: "Estados separados",
      ok:
        mode === "fromLead" ||
        (!!watched.contractStatus && !!watched.cotaSituacao),
    },
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
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    Fluxo guiado premium
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-[1.7rem] font-semibold tracking-tight text-white sm:text-[1.95rem]">
                      {mode === "fromLead"
                        ? "Formalização de venda"
                        : "Cadastro operacional premium"}
                    </h2>

                    <p className="max-w-2xl text-sm leading-6 text-slate-300">
                      {mode === "fromLead"
                        ? "Formalize a nova venda em blocos claros, sem antecipar estados operacionais que pertencem à cota."
                        : "Cadastre contrato e carta já existentes com leitura operacional, estados separados e experiência premium integrada à carteira."}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Progresso
                  </div>
                  <div className="mt-1 text-sm font-medium text-slate-100">
                    Etapa {currentIndex + 1} de {steps.length}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Progress value={progress} className="h-1.5 bg-white/10" />

                <ContratoFormStepper
                  steps={steps}
                  currentIndex={currentIndex}
                  currentStep={step}
                  onChange={(nextStep) => setStep(nextStep as StepKey)}
                />
              </div>
            </div>

            {mode === "fromLead" ? (
              <Alert className="border-emerald-400/20 bg-emerald-500/10 text-slate-100">
                <AlertTitle className="text-white">Fluxo de venda nova</AlertTitle>
                <AlertDescription className="text-slate-300">
                  A carta nasce como formalização da venda. Estados avançados ficam para evolução posterior.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-amber-400/20 bg-amber-500/10 text-slate-100">
                <AlertTitle className="text-white">
                  Modo carteira / contrato já existente
                </AlertTitle>
                <AlertDescription className="text-slate-300">
                  Use quando o cliente já estiver ativo e a carta já fizer parte do operacional. Aqui você pode definir
                  parceiro, situação inicial, documento e revisão final sem misturar contrato e cota.
                </AlertDescription>
              </Alert>
            )}

            {step === "identificacao" && (
              <IdentificacaoSection
                control={form.control}
                administradoras={administradoras}
              />
            )}

            {step === "cota" && (
              <div className="space-y-5">
                <CotaFinanceiraSection control={form.control} />
                <ComponentesFinanceirosSection
                  control={form.control}
                  setValue={form.setValue}
                />
                <CondicoesOperacionaisSection
                  control={form.control}
                  setValue={form.setValue}
                />
              </div>
            )}

            {step === "formalizacao" && (
              <div className="space-y-5">
                <FormalizacaoSection control={form.control} mode={mode} />
                <ParceiroSection
                  control={form.control}
                  parceiros={parceiros}
                  setValue={form.setValue}
                  clearErrors={form.clearErrors}
                  errors={form.formState.errors}
                />
              </div>
            )}

            {step === "estadoInicial" && mode === "registerExisting" && (
              <StatusInicialSection control={form.control} />
            )}

            {step === "revisao" && (
              <div className="space-y-5">
                <DocumentoSection contractId={contractId} />

                <ContratoFormReviewCard
                  className={shellCardClassName}
                  mode={mode}
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
                      label="Modo"
                      value={mode === "fromLead" ? "Nova venda" : "Cadastro existente"}
                    />
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
                      label="Assinatura"
                      value={watched.dataAssinatura || "—"}
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
                      label="Assembleia"
                      value={watched.assembleiaDia ? `Dia ${watched.assembleiaDia}` : "—"}
                    />
                    <ContratoFormSummaryItem
                      label="Taxa administrativa"
                      value={
                        watched.taxaAdminValorMensal != null
                          ? formatMoneyBR(watched.taxaAdminValorMensal)
                          : formatPercentBR(watched.taxaAdminPercentual)
                      }
                    />
                    <ContratoFormSummaryItem
                      label="Taxa administrativa total"
                      value={formatMoneyBR(financialSnapshot.taxaAdministrativaTotal)}
                    />
                    <ContratoFormSummaryItem
                      label="Fundo de reserva"
                      value={
                        watched.fundoReservaValorMensal != null
                          ? formatMoneyBR(watched.fundoReservaValorMensal)
                          : formatPercentBR(watched.fundoReservaPercentual)
                      }
                    />
                    <ContratoFormSummaryItem
                      label="Fundo de reserva total"
                      value={formatMoneyBR(financialSnapshot.fundoReservaTotal)}
                    />
                    <ContratoFormSummaryItem
                      label="Base total da carta"
                      value={formatMoneyBR(financialSnapshot.baseTotalCarta)}
                    />
                    <ContratoFormSummaryItem
                      label="Parcela cheia sem redutor"
                      value={formatMoneyBR(financialSnapshot.parcelaCheiaSemRedutor)}
                    />
                    <ContratoFormSummaryItem
                      label="Parcela com redutor (estimada)"
                      value={
                        watched.parcelaReduzida
                          ? formatMoneyBR(financialSnapshot.parcelaComRedutorEstimada)
                          : "—"
                      }
                    />
                    <ContratoFormSummaryItem
                      label="Custo total estimado"
                      value={formatMoneyBR(financialSnapshot.custoTotalEstimado)}
                    />
                    <ContratoFormSummaryItem
                      label="Seguro prestamista"
                      value={
                        watched.seguroPrestamistaAtivo
                          ? watched.seguroPrestamistaValorMensal != null
                            ? formatMoneyBR(watched.seguroPrestamistaValorMensal)
                            : formatPercentBR(watched.seguroPrestamistaPercentual)
                          : "Inativo"
                      }
                    />
                    <ContratoFormSummaryItem
                      label="Redutor"
                      value={watched.parcelaReduzida ? formatPercentBR(watched.percentualReducao) : "Sem redutor"}
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
                      label="Taxa adm. antecipada"
                      value={
                        watched.taxaAdminAntecipadaAtivo
                          ? watched.taxaAdminAntecipadaFormaPagamento === "parcelado"
                            ? `${watched.taxaAdminAntecipadaParcelas ?? "—"}x de ${formatMoneyBR(
                                watched.taxaAdminAntecipadaValorParcela,
                              )}`
                            : formatMoneyBR(watched.taxaAdminAntecipadaValorTotal)
                          : "Não configurada"
                      }
                    />
                    <ContratoFormSummaryItem
                      label="Repasse"
                      value={
                        watched.parceiroId
                          ? formatPercentBR(
                              watched.repassePercentualComissao,
                              "% da comissão",
                            )
                          : "Sem parceiro"
                      }
                    />
                    <ContratoFormSummaryItem
                      label="Status do contrato"
                      value={
                        mode === "registerExisting"
                          ? watched.contractStatus || "—"
                          : "Fluxo comercial padrão"
                      }
                    />
                    <ContratoFormSummaryItem
                      label="Situação da cota"
                      value={
                        mode === "registerExisting"
                          ? watched.cotaSituacao || "—"
                          : "Ativa"
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
            : "rounded-[24px] border border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl"
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-6 text-slate-400">
            {step === "identificacao" &&
              "Defina a base da operação com clareza antes de avançar."}
            {step === "cota" &&
              "Complete os dados da carta e da cota com leitura operacional clara."}
            {step === "formalizacao" &&
              "Registre a formalização do contrato e a configuração comercial da operação."}
            {step === "estadoInicial" &&
              "Mantenha separados o status do contrato e a situação da cota."}
            {step === "revisao" &&
              "Revise o modo atual, os dados da carta, os dados do contrato e conclua o cadastro."}
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
                className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              >
                {isPending
                  ? "Salvando..."
                  : mode === "fromLead"
                    ? "Criar venda / contrato"
                    : "Cadastrar contrato / cota"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
