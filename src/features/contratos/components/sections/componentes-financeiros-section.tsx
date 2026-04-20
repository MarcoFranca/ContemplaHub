"use client";

import * as React from "react";
import {
  Controller,
  type Control,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";
import {
  BadgePercent,
  Calculator,
  CheckCircle2,
  Landmark,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { MoneyField } from "../../fields/money-field";
import type { ContratoFormValues } from "../../types/contrato-form.types";
import { calculateCartaFinancialSnapshot } from "../../utils/financial-calculations";
import { PremiumFormSection } from "../section-base/premium-form-section";

interface Props {
  control: Control<ContratoFormValues>;
  setValue: UseFormSetValue<ContratoFormValues>;
}

function parseNumberInput(value: string) {
  const raw = value.trim();
  if (!raw) return null;

  const sanitized = raw.replace(/[^\d,.-]/g, "");
  const lastComma = sanitized.lastIndexOf(",");
  const lastDot = sanitized.lastIndexOf(".");

  let normalized = sanitized;

  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) {
      normalized = sanitized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = sanitized.replace(/,/g, "");
    }
  } else if (lastComma >= 0) {
    normalized = sanitized.replace(",", ".");
  }

  normalized = normalized.trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPercentInput(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "";
  return String(value).replace(".", ",");
}

function formatMoney(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatPercent(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${String(value).replace(".", ",")}%`;
}

function ToggleCard({
  checked,
  onCheckedChange,
  title,
  description,
  icon,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <label
      className={[
        "group flex cursor-pointer items-start gap-3 rounded-[22px] border px-4 py-3.5 transition-all",
        checked
          ? "border-emerald-400/28 bg-emerald-500/[0.08] shadow-[0_0_0_1px_rgba(16,185,129,0.1)]"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
      ].join(" ")}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(Boolean(v))}
        className="mt-1 border-emerald-400/35 data-[state=checked]:border-emerald-400 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-slate-950"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <span
            className={[
              "inline-flex h-8 w-8 items-center justify-center rounded-2xl border transition-colors",
              checked
                ? "border-emerald-400/20 bg-emerald-400/15 text-emerald-100"
                : "border-white/10 bg-white/[0.04] text-slate-200 group-hover:text-white",
            ].join(" ")}
          >
            {icon}
          </span>
          {title}
        </div>
        <p className="mt-1.5 text-xs leading-5 text-slate-400">{description}</p>
      </div>
    </label>
  );
}

function MetricCard({
  title,
  value,
  helper,
  tone = "default",
}: {
  title: string;
  value: string;
  helper: string;
  tone?: "default" | "success";
}) {
  return (
    <div
      className={[
        "rounded-[20px] border px-4 py-3.5",
        tone === "success"
          ? "border-emerald-400/22 bg-emerald-500/[0.07]"
          : "border-white/10 bg-white/[0.03]",
      ].join(" ")}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs leading-5 text-slate-400">{helper}</div>
    </div>
  );
}

function PercentInputCard({
  label,
  helper,
  value,
  onChange,
  error,
  disabled,
  placeholder,
}: {
  label: string;
  helper: string;
  value?: number | null;
  onChange: (value: number | null) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [display, setDisplay] = React.useState(formatPercentInput(value));

  React.useEffect(() => {
    setDisplay(formatPercentInput(value));
  }, [value]);

  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
      <Label className="text-slate-200">{label}</Label>
      <p className="mt-1 text-xs leading-5 text-slate-400">{helper}</p>
      <Input
        value={display}
        onChange={(e) => {
          const nextDisplay = e.target.value.replace(/[^\d,.-]/g, "");
          setDisplay(nextDisplay);
          onChange(parseNumberInput(nextDisplay));
        }}
        inputMode="decimal"
        disabled={disabled}
        placeholder={placeholder ?? "Ex.: 12,50"}
        className="mt-3 h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 disabled:opacity-50"
      />
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

export function ComponentesFinanceirosSection({ control, setValue }: Props) {
  const valorCarta = useWatch({ control, name: "valorCarta" });
  const prazo = useWatch({ control, name: "prazo" });
  const taxaAdminPercentual = useWatch({ control, name: "taxaAdminPercentual" });
  const taxaAdminValorMensal = useWatch({ control, name: "taxaAdminValorMensal" });
  const fundoReservaPercentual = useWatch({ control, name: "fundoReservaPercentual" });
  const fundoReservaValorMensal = useWatch({ control, name: "fundoReservaValorMensal" });
  const seguroPrestamistaAtivo = useWatch({ control, name: "seguroPrestamistaAtivo" });
  const seguroPrestamistaPercentual = useWatch({
    control,
    name: "seguroPrestamistaPercentual",
  });
  const seguroPrestamistaValorMensal = useWatch({
    control,
    name: "seguroPrestamistaValorMensal",
  });
  const taxaAdminAntecipadaAtivo = useWatch({
    control,
    name: "taxaAdminAntecipadaAtivo",
  });
  const taxaAdminAntecipadaPercentual = useWatch({
    control,
    name: "taxaAdminAntecipadaPercentual",
  });
  const taxaAdminAntecipadaFormaPagamento = useWatch({
    control,
    name: "taxaAdminAntecipadaFormaPagamento",
  });
  const taxaAdminAntecipadaParcelas = useWatch({
    control,
    name: "taxaAdminAntecipadaParcelas",
  });
  const taxaAdminAntecipadaValorTotal = useWatch({
    control,
    name: "taxaAdminAntecipadaValorTotal",
  });
  const taxaAdminAntecipadaValorParcela = useWatch({
    control,
    name: "taxaAdminAntecipadaValorParcela",
  });

  React.useEffect(() => {
    if (seguroPrestamistaAtivo) return;
    setValue("seguroPrestamistaPercentual", null);
    setValue("seguroPrestamistaValorMensal", null);
  }, [seguroPrestamistaAtivo, setValue]);

  React.useEffect(() => {
    if (taxaAdminAntecipadaAtivo) return;
    setValue("taxaAdminAntecipadaPercentual", null);
    setValue("taxaAdminAntecipadaFormaPagamento", null);
    setValue("taxaAdminAntecipadaParcelas", null);
    setValue("taxaAdminAntecipadaValorTotal", null);
    setValue("taxaAdminAntecipadaValorParcela", null);
  }, [taxaAdminAntecipadaAtivo, setValue]);

  React.useEffect(() => {
    if (!taxaAdminAntecipadaAtivo) return;

    if (taxaAdminAntecipadaFormaPagamento === "avista") {
      setValue("taxaAdminAntecipadaParcelas", 1);
      return;
    }

    if (
      taxaAdminAntecipadaFormaPagamento === "parcelado" &&
      (taxaAdminAntecipadaParcelas == null || taxaAdminAntecipadaParcelas <= 1)
    ) {
      setValue("taxaAdminAntecipadaParcelas", 2);
    }
  }, [
    taxaAdminAntecipadaAtivo,
    taxaAdminAntecipadaFormaPagamento,
    taxaAdminAntecipadaParcelas,
    setValue,
  ]);

  const sugestaoTaxaAntecipadaValorTotal = React.useMemo(() => {
    if (
      valorCarta == null ||
      Number.isNaN(valorCarta) ||
      taxaAdminAntecipadaPercentual == null ||
      Number.isNaN(taxaAdminAntecipadaPercentual)
    ) {
      return null;
    }

    return Number(((valorCarta * taxaAdminAntecipadaPercentual) / 100).toFixed(2));
  }, [valorCarta, taxaAdminAntecipadaPercentual]);

  const sugestaoTaxaAntecipadaValorParcela = React.useMemo(() => {
    if (sugestaoTaxaAntecipadaValorTotal == null) return null;

    const parcelas =
      taxaAdminAntecipadaFormaPagamento === "parcelado"
        ? taxaAdminAntecipadaParcelas ?? null
        : 1;

    if (parcelas == null || parcelas <= 0) return null;

    return Number((sugestaoTaxaAntecipadaValorTotal / parcelas).toFixed(2));
  }, [
    sugestaoTaxaAntecipadaValorTotal,
    taxaAdminAntecipadaFormaPagamento,
    taxaAdminAntecipadaParcelas,
  ]);

  const taxaAnualResumo =
    taxaAdminValorMensal != null
      ? formatMoney(taxaAdminValorMensal)
      : formatPercent(taxaAdminPercentual);

  const fundoReservaResumo =
    fundoReservaValorMensal != null
      ? formatMoney(fundoReservaValorMensal)
      : formatPercent(fundoReservaPercentual);

  const seguroResumo = !seguroPrestamistaAtivo
    ? "Inativo"
    : seguroPrestamistaValorMensal != null
      ? formatMoney(seguroPrestamistaValorMensal)
      : formatPercent(seguroPrestamistaPercentual);

  const taxaAntecipadaResumo = !taxaAdminAntecipadaAtivo
    ? "Não configurada"
    : taxaAdminAntecipadaFormaPagamento === "parcelado"
      ? `${taxaAdminAntecipadaParcelas ?? "—"}x de ${formatMoney(
          taxaAdminAntecipadaValorParcela,
        )}`
      : formatMoney(taxaAdminAntecipadaValorTotal);

  const financialSnapshot = calculateCartaFinancialSnapshot({
    valorCarta,
    prazo,
    taxaAdminPercentual,
    taxaAdminValorMensal,
    fundoReservaPercentual,
    fundoReservaValorMensal,
    seguroPrestamistaAtivo,
    seguroPrestamistaPercentual,
    seguroPrestamistaValorMensal,
    taxaAdminAntecipadaValorTotal,
    parcelaReduzida: false,
    percentualReducao: null,
    valorParcelaSemRedutor: null,
  });

  return (
    <PremiumFormSection
      title="Taxas e seguros"
      description="Registre os componentes financeiros que impactam a leitura operacional da carta, a composição da parcela e o entendimento comercial da proposta."
      eyebrow="Componentes financeiros"
      icon={<Calculator className="h-3.5 w-3.5" />}
      contentClassName="space-y-5"
    >
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Leitura executiva dos encargos</div>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Centralize os componentes da carta em um bloco fácil de revisar antes do fechamento.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/18 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
              visão rápida
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <MetricCard
              title="Taxa administrativa"
              value={taxaAnualResumo}
              helper="Mostre a taxa principal da operação em percentual total ou, se a leitura vier distribuída, em valor mensal."
              tone={taxaAdminPercentual != null || taxaAdminValorMensal != null ? "success" : "default"}
            />
            <MetricCard
              title="Base total da carta"
              value={formatMoney(financialSnapshot.baseTotalCarta)}
              helper="Base financeira da carta: valor do crédito + taxa administrativa total + fundo de reserva."
              tone={financialSnapshot.baseTotalCarta != null ? "success" : "default"}
            />
            <MetricCard
              title="Fundo de reserva"
              value={fundoReservaResumo}
              helper="Mantém o custo recorrente da carta explícito para conferência comercial."
              tone={fundoReservaPercentual != null || fundoReservaValorMensal != null ? "success" : "default"}
            />
            <MetricCard
              title="Parcela cheia sem redutor"
              value={formatMoney(financialSnapshot.parcelaCheiaSemRedutor)}
              helper="Valor-base calculado pela divisão da base total da carta pelo prazo informado."
              tone={financialSnapshot.parcelaCheiaSemRedutor != null ? "success" : "default"}
            />
            <MetricCard
              title="Custo total estimado"
              value={formatMoney(financialSnapshot.custoTotalEstimado)}
              helper="Leitura aproximada com base no valor da carta e nos componentes financeiros preenchidos."
              tone={financialSnapshot.custoTotalEstimado != null ? "success" : "default"}
            />
            <MetricCard
              title="Seguro prestamista"
              value={seguroResumo}
              helper={
                seguroPrestamistaAtivo
                  ? "Quando a regra exata da administradora não estiver modelada, trate esse valor como leitura informada/estimada."
                  : "Sem cobrança adicional de seguro prestamista."
              }
              tone={seguroPrestamistaAtivo ? "success" : "default"}
            />
            <MetricCard
              title="Taxa adm. antecipada"
              value={taxaAntecipadaResumo}
              helper={taxaAdminAntecipadaAtivo ? "Leitura pronta para explicar condição à vista ou parcelada." : "Sem taxa administrativa antecipada configurada."}
              tone={taxaAdminAntecipadaAtivo ? "success" : "default"}
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-emerald-400/14 bg-emerald-500/[0.05] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-50">
            <CheckCircle2 className="h-4 w-4" />
            Como manter esse bloco elegante
          </div>
          <div className="mt-3 space-y-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2.5">
              Use percentual para a taxa administrativa total da operação; use valor mensal quando a leitura precisar refletir a distribuição mensal da cobrança.
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2.5">
              A base total da carta e a parcela cheia sem redutor ajudam a explicar a operação sem prometer o valor final reduzido.
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2.5">
              Seguro e taxa antecipada só aparecem em detalhe quando ativados, preservando leitura limpa para o time.
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2.5">
              Com valor da carta e percentual, o formulário sugere totais automaticamente sem tirar o controle manual.
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Controller
          name="taxaAdminPercentual"
          control={control}
          render={({ field, fieldState }) => (
            <PercentInputCard
              label="Taxa administrativa total (%)"
              helper="Preencha com a taxa principal da operação sobre o valor da carta."
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="taxaAdminValorMensal"
          control={control}
          render={({ field, fieldState }) => (
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <Label className="text-slate-200">Distribuição mensal da taxa adm. (R$)</Label>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Use quando quiser registrar como a taxa administrativa aparece mensalmente na operação.
              </p>
              <div className="mt-3">
                <MoneyField value={field.value} onChange={field.onChange} />
              </div>
              {fieldState.error ? <p className="mt-2 text-sm text-red-400">{fieldState.error.message}</p> : null}
            </div>
          )}
        />

        <Controller
          name="fundoReservaPercentual"
          control={control}
          render={({ field, fieldState }) => (
            <PercentInputCard
              label="Fundo de reserva (%)"
              helper="Registre a composição percentual recorrente do fundo de reserva."
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="fundoReservaValorMensal"
          control={control}
          render={({ field, fieldState }) => (
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <Label className="text-slate-200">Fundo de reserva (R$)</Label>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Alternativa em valor mensal para leitura direta do custo da cota.
              </p>
              <div className="mt-3">
                <MoneyField value={field.value} onChange={field.onChange} />
              </div>
              {fieldState.error ? <p className="mt-2 text-sm text-red-400">{fieldState.error.message}</p> : null}
            </div>
          )}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Controller
          name="seguroPrestamistaAtivo"
          control={control}
          render={({ field }) => (
            <ToggleCard
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              title="Seguro prestamista ativo"
              description="Mostra os encargos do seguro apenas quando ele fizer parte da carta."
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
            />
          )}
        />

        <Controller
          name="taxaAdminAntecipadaAtivo"
          control={control}
          render={({ field }) => (
            <ToggleCard
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              title="Taxa adm. antecipada ativa"
              description="Habilita a condição de cobrança antecipada com leitura à vista ou parcelada."
              icon={<Sparkles className="h-3.5 w-3.5" />}
            />
          )}
        />
      </div>

      {seguroPrestamistaAtivo ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Controller
            name="seguroPrestamistaPercentual"
            control={control}
            render={({ field, fieldState }) => (
              <PercentInputCard
                label="Seguro prestamista (%)"
                helper="Aceita percentual com casas decimais, como 0,03 ou 0.03, conforme a regra da administradora."
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ex.: 0,03"
              />
            )}
          />

          <Controller
            name="seguroPrestamistaValorMensal"
            control={control}
            render={({ field, fieldState }) => (
              <div className="rounded-[22px] border border-emerald-400/14 bg-emerald-500/[0.05] p-4">
                <Label className="text-slate-200">Seguro prestamista (R$)</Label>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Se a cobrança vier em valor mensal fechado, registre aqui para leitura rápida.
                </p>
                <div className="mt-3">
                  <MoneyField value={field.value} onChange={field.onChange} />
                </div>
                {fieldState.error ? <p className="mt-2 text-sm text-red-400">{fieldState.error.message}</p> : null}
              </div>
            )}
          />
        </div>
      ) : null}

      {taxaAdminAntecipadaAtivo ? (
        <div className="space-y-4 rounded-[24px] border border-emerald-400/14 bg-emerald-500/[0.05] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Taxa administrativa antecipada</div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-300">
                Configure percentual, forma de pagamento e valores totais com apoio de cálculo sem perder edição manual.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2 text-xs text-slate-300">
              Base da simulação: <span className="font-medium text-white">{formatMoney(valorCarta)}</span>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <Controller
              name="taxaAdminAntecipadaPercentual"
              control={control}
              render={({ field, fieldState }) => (
                <PercentInputCard
                  label="Percentual (%)"
                  helper="Usado para sugerir automaticamente o valor total da cobrança."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Ex.: 18,00"
                />
              )}
            />

            <Controller
              name="taxaAdminAntecipadaFormaPagamento"
              control={control}
              render={({ field, fieldState }) => (
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <Label className="text-slate-200">Forma de pagamento</Label>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Define se a cobrança é liquidada à vista ou em parcelas.
                  </p>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) =>
                      field.onChange(value ? value : null)
                    }
                  >
                    <SelectTrigger className="mt-3 h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avista">À vista</SelectItem>
                      <SelectItem value="parcelado">Parcelado</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.error ? <p className="mt-2 text-sm text-red-400">{fieldState.error.message}</p> : null}
                </div>
              )}
            />

            <Controller
              name="taxaAdminAntecipadaParcelas"
              control={control}
              render={({ field, fieldState }) => (
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <Label className="text-slate-200">Parcelas</Label>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    À vista trava em 1. No parcelado, informe uma quantidade maior.
                  </p>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={field.value ?? ""}
                    disabled={taxaAdminAntecipadaFormaPagamento === "avista"}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : Math.trunc(Number(e.target.value)),
                      )
                    }
                    className="mt-3 h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 disabled:opacity-50"
                    placeholder="Ex.: 6"
                  />
                  {fieldState.error ? <p className="mt-2 text-sm text-red-400">{fieldState.error.message}</p> : null}
                </div>
              )}
            />

            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <Label className="text-slate-200">Cálculo assistido</Label>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Sugestões baseadas em valor da carta, percentual e número de parcelas.
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-200">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
                  <span>Total sugerido</span>
                  <span className="font-medium text-white">{formatMoney(sugestaoTaxaAntecipadaValorTotal)}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
                  <span>Parcela sugerida</span>
                  <span className="font-medium text-white">{formatMoney(sugestaoTaxaAntecipadaValorParcela)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Controller
              name="taxaAdminAntecipadaValorTotal"
              control={control}
              render={({ field, fieldState }) => (
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label className="text-slate-200">Valor total (R$)</Label>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Edite manualmente ou use o cálculo sugerido.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={sugestaoTaxaAntecipadaValorTotal == null}
                      onClick={() =>
                        setValue(
                          "taxaAdminAntecipadaValorTotal",
                          sugestaoTaxaAntecipadaValorTotal,
                          { shouldDirty: true },
                        )
                      }
                      className="border-emerald-400/20 text-emerald-100 hover:bg-emerald-400/10"
                    >
                      <Landmark className="mr-2 h-4 w-4" />
                      Usar cálculo
                    </Button>
                  </div>
                  <div className="mt-3">
                    <MoneyField value={field.value} onChange={field.onChange} />
                  </div>
                  {fieldState.error ? <p className="mt-2 text-sm text-red-400">{fieldState.error.message}</p> : null}
                </div>
              )}
            />

            <Controller
              name="taxaAdminAntecipadaValorParcela"
              control={control}
              render={({ field, fieldState }) => (
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label className="text-slate-200">Valor da parcela (R$)</Label>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Para condição à vista, tende a replicar o valor total. No parcelado, distribui o total pelas parcelas.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={sugestaoTaxaAntecipadaValorParcela == null}
                      onClick={() =>
                        setValue(
                          "taxaAdminAntecipadaValorParcela",
                          sugestaoTaxaAntecipadaValorParcela,
                          { shouldDirty: true },
                        )
                      }
                      className="border-emerald-400/20 text-emerald-100 hover:bg-emerald-400/10"
                    >
                      <WalletCards className="mr-2 h-4 w-4" />
                      Usar cálculo
                    </Button>
                  </div>
                  <div className="mt-3">
                    <MoneyField value={field.value} onChange={field.onChange} />
                  </div>
                  {fieldState.error ? <p className="mt-2 text-sm text-red-400">{fieldState.error.message}</p> : null}
                </div>
              )}
            />
          </div>

          <div className="rounded-[22px] border border-emerald-400/12 bg-black/10 px-4 py-3 text-xs leading-5 text-slate-300">
            <div className="flex items-center gap-2 font-medium text-emerald-100">
              <BadgePercent className="h-4 w-4" />
              Leitura comercial pronta
            </div>
            <p className="mt-1">
              Com esse bloco, a equipe entende de imediato o que compõe a parcela e como a taxa antecipada entra na operação, sem depender de cálculo externo.
            </p>
          </div>
        </div>
      ) : null}
    </PremiumFormSection>
  );
}
