"use client";

import { Controller, type Control } from "react-hook-form";
import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateField } from "../../fields/date-field";
import { AdministradoraSelectField } from "../../fields/administradora-select-field";
import type { AdministradoraOption, ContratoFormValues } from "../../types/contrato-form.types";
import { PremiumFormSection } from "../section-base/premium-form-section";

interface Props {
  control: Control<ContratoFormValues>;
  administradoras: AdministradoraOption[];
}

export function IdentificacaoSection({ control, administradoras }: Props) {
  return (
    <PremiumFormSection
      title="Base da operação"
      description="Selecione a administradora e preencha os identificadores principais da carta e do contrato."
      eyebrow="Identificação"
      icon={<Building2 className="h-3.5 w-3.5" />}
      contentClassName="grid gap-5 md:grid-cols-2"
    >
      <Controller
        name="administradoraId"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2 md:col-span-2">
            <Label className="text-slate-200">Administradora</Label>
            <AdministradoraSelectField value={field.value} onChange={field.onChange} options={administradoras} />
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />

      <Controller
        name="grupoCodigo"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <Label className="text-slate-200">Grupo</Label>
            <Input
              value={field.value}
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              placeholder="Ex.: IM-2030"
              className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            />
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />

      <Controller
        name="numeroCota"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <Label className="text-slate-200">Número da cota</Label>
            <Input
              {...field}
              placeholder="Ex.: 1302-004"
              className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            />
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />

      <Controller
        name="numeroContrato"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <Label className="text-slate-200">Número do contrato</Label>
            <Input
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder="Ex.: CTR-2026-001"
              className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
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
            <Label className="text-slate-200">Data de assinatura</Label>
            <DateField value={field.value} onChange={field.onChange} />
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Leitura do corretor</div>
        <p className="mt-1 text-sm leading-6 text-slate-300">
          Aqui fica a base da carta. Quanto mais clara essa etapa, mais rápido o restante do fluxo anda.
        </p>
      </div>
    </PremiumFormSection>
  );
}
