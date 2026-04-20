"use client";

import type { ReactNode } from "react";
import { Controller, type Control } from "react-hook-form";
import { Building2, FolderKanban, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdministradoraSelectField } from "../../fields/administradora-select-field";
import type { AdministradoraOption, ContratoFormValues } from "../../types/contrato-form.types";
import { PremiumFormSection } from "../section-base/premium-form-section";

interface Props {
  control: Control<ContratoFormValues>;
  administradoras: AdministradoraOption[];
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

export function IdentificacaoSection({ control, administradoras }: Props) {
  return (
    <PremiumFormSection
      title="Base da operação"
      description="Selecione a administradora e preencha os identificadores principais da carta e do contrato."
      eyebrow="Identificação"
      icon={<Building2 className="h-3.5 w-3.5" />}
      contentClassName="grid gap-4 md:grid-cols-2"
    >
      <Controller
        name="administradoraId"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2 md:col-span-2">
            <FieldLabel icon={<Building2 className="h-3.5 w-3.5" />}>Administradora</FieldLabel>
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
            <FieldLabel icon={<FolderKanban className="h-3.5 w-3.5" />}>Grupo</FieldLabel>
            <Input
              value={field.value}
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              placeholder="Ex.: IM-2030"
              className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-emerald-400/35 focus-visible:ring-emerald-400/15"
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
            <FieldLabel icon={<Hash className="h-3.5 w-3.5" />}>Número da cota</FieldLabel>
            <Input
              {...field}
              placeholder="Ex.: 1302-004"
              className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-emerald-400/35 focus-visible:ring-emerald-400/15"
            />
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />
      <div className="rounded-2xl border border-emerald-400/12 bg-emerald-400/[0.05] px-4 py-3 md:col-span-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/80">Leitura do corretor</div>
        <p className="mt-1.5 text-sm leading-6 text-slate-300">
          Aqui fica a base da carta. Quanto mais clara essa etapa, mais rápido o restante do fluxo anda.
        </p>
      </div>
    </PremiumFormSection>
  );
}
