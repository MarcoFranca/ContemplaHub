"use client";

import { RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ComissaoRegra } from "../../types";
import { calcularValorEstimado } from "./comissao-calculator";

type Props = {
  regras: ComissaoRegra[];
  valorBase: number;
  onPercentualChange: (index: number, percentual: number) => void;
  onLiberarAuto: (index: number) => void;
};

const EVENTO_LABELS: Record<string, string> = {
  adesao: "Adesão",
  primeira_cobranca_valida: "1ª Cobrança",
  proxima_cobranca: "Próx. Cobrança",
  contemplacao: "Contemplação",
  manual: "Manual",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export function ParcelasComissaoTable({
  regras,
  valorBase,
  onPercentualChange,
  onLiberarAuto,
}: Props) {
  if (!regras.length) {
    return (
      <div className="rounded-xl border border-dashed border-border/35 bg-card/15 p-5 text-center text-sm text-muted-foreground">
        Nenhuma parcela gerada ainda. Use "Gerar automaticamente" acima ou ajuste o número de parcelas.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/35">
      {/* Header */}
      <div className="border-b border-border/25 bg-card/35 px-3 py-2.5">
        <div className="grid grid-cols-[2rem_1fr_3.5rem_6rem_6rem_3.5rem] gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>#</span>
          <span>Evento</span>
          <span>Offset</span>
          <span>Percentual</span>
          <span>Valor est.</span>
          <span>Modo</span>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/15">
        {regras.map((regra, index) => {
          const valorEstimado = calcularValorEstimado(
            valorBase,
            Number(regra.percentual_comissao || 0)
          );
          const isManual = Boolean(regra.is_manual);

          return (
            <div
              key={`${regra.ordem}-${index}`}
              className={`
                grid grid-cols-[2rem_1fr_3.5rem_6rem_6rem_3.5rem] items-center gap-2 px-3 py-2 transition-colors
                hover:bg-white/2
                ${isManual ? "bg-amber-500/4" : ""}
              `}
            >
              {/* # */}
              <span className="text-xs font-medium text-muted-foreground/80">{regra.ordem}</span>

              {/* Evento */}
              <span className="truncate text-xs text-foreground">
                {EVENTO_LABELS[regra.tipo_evento] ?? regra.tipo_evento}
              </span>

              {/* Offset */}
              <span className="text-xs text-muted-foreground">
                {regra.offset_meses === 0 ? "—" : `+${regra.offset_meses}m`}
              </span>

              {/* Percentual (editável) */}
              <Input
                type="number"
                step="0.0001"
                min={0}
                value={regra.percentual_comissao}
                onChange={(e) => onPercentualChange(index, Number(e.target.value || 0))}
                className="h-7 rounded-lg px-2 text-xs"
              />

              {/* Valor estimado */}
              <span className="text-xs font-medium text-foreground">
                {valorBase > 0 ? fmt(valorEstimado) : "—"}
              </span>

              {/* Modo toggle */}
              {isManual ? (
                <button
                  type="button"
                  onClick={() => onLiberarAuto(index)}
                  title="Clique para voltar para distribuição automática"
                  className="inline-flex items-center gap-1 rounded-md border border-amber-500/25 bg-amber-500/12 px-1.5 py-1 text-[10px] font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  M
                </button>
              ) : (
                <span className="inline-flex items-center justify-center rounded-md border border-border/25 bg-card/25 px-1.5 py-1 text-[10px] text-muted-foreground">
                  Auto
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer: legend */}
      <div className="border-t border-border/20 bg-card/20 px-3 py-2 text-[10px] text-muted-foreground/60">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-amber-500/30" />
          M = editado manualmente · clique para redistribuir automaticamente
        </span>
      </div>
    </div>
  );
}
