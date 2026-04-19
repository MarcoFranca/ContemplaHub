"use client";

import { BadgePercent, Receipt, Trash2, UserRoundCheck } from "lucide-react";
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
  const parceiroNome = parceiros.find((parceiro) => parceiro.id === item.parceiro_id)?.nome;

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300">
            <UserRoundCheck className="h-3.5 w-3.5" />
            {parceiroNome ? parceiroNome : "Novo parceiro"}
          </div>
        </div>

        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:bg-red-500/10 hover:text-red-300" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.6fr_0.8fr_0.8fr]">
        <FieldShell label="Parceiro" icon={UserRoundCheck}>
          <select
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/15"
            value={item.parceiro_id}
            onChange={(e) => onChange({ parceiro_id: e.target.value })}
          >
            <option value="">Selecione</option>
            {parceiros.map((parceiro) => (
              <option key={parceiro.id} value={parceiro.id}>
                {parceiro.nome}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell label="% do parceiro" icon={BadgePercent}>
          <Input
            type="number"
            step="0.0001"
            min={0}
            value={item.percentual_parceiro}
            onChange={(e) => onChange({ percentual_parceiro: Number(e.target.value || 0) })}
          />
        </FieldShell>

        <FieldShell label="Imposto %" icon={Receipt}>
          <Input
            type="number"
            step="0.01"
            min={0}
            value={item.imposto_retido_pct}
            onChange={(e) => onChange({ imposto_retido_pct: Number(e.target.value || 0) })}
          />
        </FieldShell>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
        <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/70 bg-card/70 px-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={item.ativo}
            onChange={(e) => onChange({ ativo: e.target.checked })}
            className="accent-emerald-500"
          />
          Parceiro ativo
        </label>

        <Input
          value={item.observacoes ?? ""}
          onChange={(e) => onChange({ observacoes: e.target.value })}
          placeholder="Observações do repasse nesta carta"
        />
      </div>
    </div>
  );
}

function FieldShell({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-emerald-300" />
        {label}
      </label>
      {children}
    </div>
  );
}
