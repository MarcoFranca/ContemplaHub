"use client";

import { CalendarRange, CircleDollarSign, Percent, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ComissaoRegra } from "../../types";
import { calcularValorEstimado } from "./comissao-calculator";

type Props = {
  regras: ComissaoRegra[];
  valorBase: number;
  onPercentualChange: (index: number, percentual: number) => void;
  onLiberarAuto: (index: number) => void;
};

export function ParcelasComissaoTable({
  regras,
  valorBase,
  onPercentualChange,
  onLiberarAuto,
}: Props) {
  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300">
          <CalendarRange className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Parcelas da comissão</h4>
          <p className="text-sm text-muted-foreground">
            Ao editar uma parcela ela fica manual; o restante é redistribuído apenas nas automáticas.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {regras.map((regra, index) => {
          const valorEstimado = calcularValorEstimado(
            valorBase,
            Number(regra.percentual_comissao || 0)
          );

          return (
            <div
              key={`${regra.ordem}-${index}`}
              className="rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm"
            >
              <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Parcela {regra.ordem}
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs text-muted-foreground">
                  {regra.is_manual ? "Origem manual" : "Origem automática"}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.9fr_0.7fr_1fr_1fr_auto]">
                <InfoBox label="Evento" value={labelEvento(regra.tipo_evento)} icon={CalendarRange} />
                <InfoBox label="Offset" value={`${regra.offset_meses}`} icon={CalendarRange} />

                <div className="space-y-1.5">
                  <label className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    <Percent className="h-3.5 w-3.5 text-emerald-300" />
                    Percentual %
                  </label>
                  <Input
                    type="number"
                    step="0.0001"
                    min={0}
                    value={regra.percentual_comissao}
                    onChange={(e) =>
                      onPercentualChange(index, Number(e.target.value || 0))
                    }
                  />
                </div>

                <InfoBox label="Valor estimado" value={formatMoney(valorEstimado)} icon={CircleDollarSign} />

                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Ajuste
                  </label>
                  {regra.is_manual ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-emerald-500/20 hover:bg-emerald-500/5"
                      onClick={() => onLiberarAuto(index)}
                      title="Voltar para automático"
                    >
                      <RotateCcw className="mr-2 h-4 w-4 text-emerald-300" />
                      Voltar para automático
                    </Button>
                  ) : (
                    <div className="flex h-10 items-center rounded-xl border border-border/70 bg-card/70 px-3 text-sm text-muted-foreground">
                      Distribuição automática ativa
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!regras.length ? (
          <div className="rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 p-6 text-center text-sm text-muted-foreground">
            Nenhuma parcela gerada ainda.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="space-y-1.5">
      <label className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-emerald-300" />
        {label}
      </label>
      <div className="flex h-10 items-center rounded-xl border border-border/70 bg-card/70 px-3 text-sm text-foreground">
        {value}
      </div>
    </div>
  );
}

function labelEvento(value: string) {
  const map: Record<string, string> = {
    adesao: "Adesão",
    primeira_cobranca_valida: "Primeira cobrança",
    proxima_cobranca: "Próxima cobrança",
    contemplacao: "Contemplação",
    manual: "Manual",
  };
  return map[value] ?? value;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}
