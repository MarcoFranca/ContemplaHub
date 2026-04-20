"use client";

import type { ReactNode } from "react";
import { Controller, type Control } from "react-hook-form";
import { FileBadge2, FileSignature, ShieldCheck } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DateField } from "../../fields/date-field";
import type { ContratoFormMode, ContratoFormValues } from "../../types/contrato-form.types";
import { PremiumFormSection } from "../section-base/premium-form-section";

interface Props {
  control: Control<ContratoFormValues>;
  mode: ContratoFormMode;
}

function FieldLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <Label className="flex items-center gap-2 text-[13px] font-medium text-slate-200">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10 text-emerald-100">
        {icon}
      </span>
      {children}
    </Label>
  );
}

export function FormalizacaoSection({ control, mode }: Props) {
  return (
    <PremiumFormSection
      title="Formalização do contrato"
      description={
        mode === "fromLead"
          ? "Preencha os dados de formalização da nova venda sem antecipar estados operacionais da cota."
          : "Registre os dados formais do contrato já existente mantendo separado o que é contrato e o que é situação da cota."
      }
      eyebrow="Contrato"
      icon={<ShieldCheck className="h-3.5 w-3.5" />}
      contentClassName="grid gap-4 md:grid-cols-2"
    >
      <Controller
        name="numeroContrato"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <FieldLabel icon={<FileBadge2 className="h-3.5 w-3.5" />}>Número do contrato</FieldLabel>
            <Input
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder="Ex.: CTR-2026-001"
              className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-emerald-400/35 focus-visible:ring-emerald-400/15"
            />
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />

      <Controller
        name="dataAssinatura"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <FieldLabel icon={<FileSignature className="h-3.5 w-3.5" />}>Data de assinatura</FieldLabel>
            <DateField value={field.value} onChange={field.onChange} />
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />

      <div className="rounded-2xl border border-emerald-400/12 bg-emerald-400/[0.05] px-4 py-3 md:col-span-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
          Leitura do domínio
        </div>
        <p className="mt-1.5 text-sm leading-6 text-slate-300">
          O contrato formaliza a operação. Ele não substitui a cota, e a contemplação continua sendo um evento da
          cota, não do contrato.
        </p>
      </div>
    </PremiumFormSection>
  );
}
