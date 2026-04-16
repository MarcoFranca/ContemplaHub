"use client";

import { Controller, type Control, useWatch } from "react-hook-form";
import { BadgeCheck, CircleOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContratoFormValues } from "../../types/contrato-form.types";
import { PremiumFormSection } from "../section-base/premium-form-section";

interface Props {
  control: Control<ContratoFormValues>;
}

export function StatusInicialSection({ control }: Props) {
  const contractStatus = useWatch({ control, name: "contractStatus" });
  const cotaSituacao = useWatch({ control, name: "cotaSituacao" });

  return (
    <PremiumFormSection
      title="Estado inicial"
      description="Defina como esta carta entra no sistema para manter o histórico operacional coerente com a carteira."
      eyebrow="Cadastro existente"
      icon={<BadgeCheck className="h-3.5 w-3.5" />}
      contentClassName="space-y-5"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Controller
          name="contractStatus"
          control={control}
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <Label className="text-slate-200">Status do contrato</Label>
              <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value || null)}>
                <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente_assinatura">Pendente de assinatura</SelectItem>
                  <SelectItem value="pendente_pagamento">Pendente de pagamento</SelectItem>
                  <SelectItem value="alocado">Alocado</SelectItem>
                  <SelectItem value="contemplado">Contemplado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
            </div>
          )}
        />

        <Controller
          name="cotaSituacao"
          control={control}
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <Label className="text-slate-200">Situação da cota</Label>
              <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value || null)}>
                <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="Selecione a situação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="contemplada">Contemplada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
            </div>
          )}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <BadgeCheck className="h-4 w-4 text-emerald-300" />
            Contrato
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Define a etapa operacional da formalização. Hoje: <span className="text-slate-200">{contractStatus || "não definido"}</span>.
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <CircleOff className="h-4 w-4 text-amber-300" />
            Cota
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Define a situação estrutural da carta. Hoje: <span className="text-slate-200">{cotaSituacao || "não definida"}</span>.
          </p>
        </div>
      </div>
    </PremiumFormSection>
  );
}
