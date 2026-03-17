"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ComissaoEvento, ComissaoRegra } from "../../types";

const EVENTOS: Array<{ value: ComissaoEvento; label: string }> = [
  { value: "adesao", label: "Mês da adesão" },
  { value: "primeira_cobranca_valida", label: "Primeira cobrança válida" },
  { value: "proxima_cobranca", label: "Próxima cobrança" },
  { value: "contemplacao", label: "Contemplação" },
  { value: "manual", label: "Manual" },
];

type Props = {
  regra: ComissaoRegra;
  onChange: (patch: Partial<ComissaoRegra>) => void;
  onRemove: () => void;
};

export function ComissaoRegraRow({ regra, onChange, onRemove }: Props) {
  return (
    <div className="grid gap-3 rounded-xl border p-3 md:grid-cols-[80px_1.5fr_120px_120px_auto]">
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">Ordem</label>
        <Input type="number" min={1} value={regra.ordem} onChange={(e) => onChange({ ordem: Number(e.target.value || 1) })} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">Evento</label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={regra.tipo_evento} onChange={(e) => onChange({ tipo_evento: e.target.value as ComissaoEvento })}>
          {EVENTOS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">Offset</label>
        <Input type="number" min={0} value={regra.offset_meses} onChange={(e) => onChange({ offset_meses: Number(e.target.value || 0) })} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">% comissão</label>
        <Input type="number" step="0.0001" min={0} value={regra.percentual_comissao} onChange={(e) => onChange({ percentual_comissao: Number(e.target.value || 0) })} />
      </div>
      <div className="flex items-end justify-end">
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="md:col-span-5">
        <label className="mb-1 block text-xs text-muted-foreground">Descrição</label>
        <Input value={regra.descricao ?? ""} onChange={(e) => onChange({ descricao: e.target.value })} placeholder="Ex.: última parcela vinculada à contemplação" />
      </div>
    </div>
  );
}
