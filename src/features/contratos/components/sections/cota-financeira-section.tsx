"use client";

import type { ReactNode } from "react";
import { Controller, type Control } from "react-hook-form";
import { CalendarDays, FileText, Landmark, NotebookPen, WalletCards } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoneyField } from "../../fields/money-field";
import { DateField } from "../../fields/date-field";
import type { ContratoFormValues } from "../../types/contrato-form.types";
import { PremiumFormSection } from "../section-base/premium-form-section";

interface Props {
  control: Control<ContratoFormValues>;
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

export function CotaFinanceiraSection({ control }: Props) {
  return (
    <PremiumFormSection
      title="Condições da carta"
      description="Preencha produto, prazo, valores e observações com foco em conferência rápida e leitura operacional."
      eyebrow="Carta / cota"
      icon={<WalletCards className="h-3.5 w-3.5" />}
      contentClassName="grid gap-4 md:grid-cols-2"
    >
      <Controller
        name="produto"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <FieldLabel icon={<FileText className="h-3.5 w-3.5" />}>Produto</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white">
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imobiliario">Imóvel</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />

      <Controller
        name="prazo"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <FieldLabel icon={<CalendarDays className="h-3.5 w-3.5" />}>Prazo</FieldLabel>
            <Input
              type="number"
              min={1}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(Number(e.target.value))}
              placeholder="Ex.: 200 meses"
              className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-emerald-400/35 focus-visible:ring-emerald-400/15"
            />
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />

      <Controller
        name="valorCarta"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <FieldLabel icon={<Landmark className="h-3.5 w-3.5" />}>Valor da carta</FieldLabel>
            <MoneyField value={field.value} onChange={field.onChange} />
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />

      <Controller
        name="valorParcela"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <FieldLabel icon={<WalletCards className="h-3.5 w-3.5" />}>Valor da parcela</FieldLabel>
            <MoneyField value={field.value} onChange={field.onChange} />
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />

      <Controller
        name="dataAdesao"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <FieldLabel icon={<NotebookPen className="h-3.5 w-3.5" />}>Data de adesão</FieldLabel>
            <DateField value={field.value} onChange={field.onChange} />
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />

      <Controller
        name="assembleiaDia"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <FieldLabel icon={<CalendarDays className="h-3.5 w-3.5" />}>Dia da assembleia</FieldLabel>
            <Input
              type="number"
              min={1}
              max={31}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
              placeholder="Ex.: 15"
              className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-emerald-400/35 focus-visible:ring-emerald-400/15"
            />
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />

      <Controller
        name="observacoes"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2 md:col-span-2">
            <FieldLabel icon={<NotebookPen className="h-3.5 w-3.5" />}>Observações</FieldLabel>
            <Textarea
              value={field.value ?? ""}
              onChange={field.onChange}
              rows={4}
              placeholder="Observações operacionais, histórico, pontos relevantes da carta..."
              className="min-h-[112px] rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-emerald-400/35 focus-visible:ring-emerald-400/15"
            />
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />
    </PremiumFormSection>
  );
}
