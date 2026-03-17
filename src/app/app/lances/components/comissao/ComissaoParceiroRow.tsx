"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CotaComissaoParceiro, ParceiroSelectOption } from "../../types";

type Props = {
  item: CotaComissaoParceiro;
  parceiros: ParceiroSelectOption[];
  onChange: (patch: Partial<CotaComissaoParceiro>) => void;
  onRemove: () => void;
};

export function ComissaoParceiroRow({ item, parceiros, onChange, onRemove }: Props) {
  return (
    <div className="grid gap-3 rounded-xl border p-3 md:grid-cols-[1.4fr_120px_120px_auto]">
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">Parceiro</label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={item.parceiro_id} onChange={(e) => onChange({ parceiro_id: e.target.value })}>
          <option value="">Selecione</option>
          {parceiros.map((parceiro) => (
            <option key={parceiro.id} value={parceiro.id}>{parceiro.nome}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">% parceiro</label>
        <Input type="number" step="0.0001" min={0} value={item.percentual_parceiro} onChange={(e) => onChange({ percentual_parceiro: Number(e.target.value || 0) })} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">Imposto %</label>
        <Input type="number" step="0.01" min={0} value={item.imposto_retido_pct} onChange={(e) => onChange({ imposto_retido_pct: Number(e.target.value || 0) })} />
      </div>
      <div className="flex items-end justify-end">
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="md:col-span-4 grid gap-3 md:grid-cols-[auto_1fr] items-center">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={item.ativo} onChange={(e) => onChange({ ativo: e.target.checked })} />
          Ativo
        </label>
        <Input value={item.observacoes ?? ""} onChange={(e) => onChange({ observacoes: e.target.value })} placeholder="Observações do parceiro nessa carta" />
      </div>
    </div>
  );
}
