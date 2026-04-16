"use client";

import { Controller, type Control } from "react-hook-form";
import { WalletCards } from "lucide-react";
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

export function CotaFinanceiraSection({ control }: Props) {
  return (
    <PremiumFormSection
      title="Condições da carta"
      description="Preencha produto, prazo, valores e observações com foco em conferência rápida e leitura operacional."
      eyebrow="Carta / cota"
      icon={<WalletCards className="h-3.5 w-3.5" />}
      contentClassName="grid gap-5 md:grid-cols-2"
    >
      <Controller
        name="produto"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <Label className="text-slate-200">Produto</Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
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
            <Label className="text-slate-200">Prazo</Label>
            <Input
              type="number"
              min={1}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(Number(e.target.value))}
              placeholder="Ex.: 200"
              className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
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
            <Label className="text-slate-200">Valor da carta</Label>
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
            <Label className="text-slate-200">Valor da parcela</Label>
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
            <Label className="text-slate-200">Data de adesão</Label>
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
            <Label className="text-slate-200">Dia da assembleia</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
              placeholder="Ex.: 15"
              className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
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
            <Label className="text-slate-200">Observações</Label>
            <Textarea
              value={field.value ?? ""}
              onChange={field.onChange}
              rows={4}
              placeholder="Observações operacionais, histórico, pontos relevantes da carta..."
              className="rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            />
            {fieldState.error ? <p className="text-sm text-red-400">{fieldState.error.message}</p> : null}
          </div>
        )}
      />
    </PremiumFormSection>
  );
}
