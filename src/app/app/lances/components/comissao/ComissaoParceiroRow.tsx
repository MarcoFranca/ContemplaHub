"use client";

import { Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CotaComissaoParceiro, ParceiroSelectOption } from "../../types";

type Props = {
  item: CotaComissaoParceiro;
  parceiros: ParceiroSelectOption[];
  valorBase?: number;
  onChange: (patch: Partial<CotaComissaoParceiro>) => void;
  onRemove: () => void;
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export function ComissaoParceiroRow({ item, parceiros, valorBase = 0, onChange, onRemove }: Props) {
  const parceiroNome = parceiros.find((p) => p.id === item.parceiro_id)?.nome;

  const pct = Number(item.percentual_parceiro || 0);
  const impostoPct = Number(item.imposto_retido_pct || 0);
  const bruto = valorBase > 0 ? valorBase * (pct / 100) : 0;
  const impostoValor = bruto * (impostoPct / 100);
  const liquido = bruto - impostoValor;
  const showMoney = valorBase > 0 && pct > 0;

  return (
    <div
      className={`rounded-xl border bg-card/25 p-4 transition-colors ${
        item.ativo ? "border-border/40" : "border-border/20 opacity-55"
      }`}
    >
      {/* ── Header: avatar + nome + valores derivados + remover ── */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <User className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">
              {parceiroNome ?? (item.parceiro_id ? "Parceiro" : "Novo parceiro")}
            </div>
            {showMoney && (
              <div className="mt-0.5 text-xs text-muted-foreground">
                <span className="text-foreground font-medium">{fmt(bruto)}</span>
                {" bruto"}
                {impostoValor > 0 && (
                  <>
                    {" − "}{fmt(impostoValor)}{" imp."}
                    {" = "}
                    <span className="text-emerald-300 font-semibold">{fmt(liquido)} líquido</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-300"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* ── Campos ── */}
      <div className="grid gap-3 sm:grid-cols-[1.6fr_0.7fr_0.7fr]">
        <div className="space-y-1">
          <FieldLabel>Parceiro</FieldLabel>
          <select
            value={item.parceiro_id}
            onChange={(e) => onChange({ parceiro_id: e.target.value })}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
          >
            <option value="">Selecione o parceiro</option>
            {parceiros.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <FieldLabel>
            % da comissão
            {showMoney && (
              <span className="ml-1 text-emerald-300 normal-case font-normal">
                = {fmt(bruto)}
              </span>
            )}
          </FieldLabel>
          <Input
            type="number"
            step="0.0001"
            min={0}
            value={item.percentual_parceiro}
            onChange={(e) => onChange({ percentual_parceiro: Number(e.target.value || 0) })}
            className="h-9 rounded-lg"
          />
        </div>

        <div className="space-y-1">
          <FieldLabel>
            Imposto %
            {showMoney && impostoValor > 0 && (
              <span className="ml-1 text-rose-300/70 normal-case font-normal">
                = {fmt(impostoValor)}
              </span>
            )}
          </FieldLabel>
          <Input
            type="number"
            step="0.01"
            min={0}
            value={item.imposto_retido_pct}
            onChange={(e) => onChange({ imposto_retido_pct: Number(e.target.value || 0) })}
            className="h-9 rounded-lg"
          />
        </div>
      </div>

      {/* ── Rodapé: ativo + observações ── */}
      <div className="mt-3 flex items-center gap-3">
        <label className="flex flex-shrink-0 cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={item.ativo}
            onChange={(e) => onChange({ ativo: e.target.checked })}
            className="accent-emerald-500"
          />
          Ativo
        </label>
        <Input
          value={item.observacoes ?? ""}
          onChange={(e) => onChange({ observacoes: e.target.value })}
          placeholder="Observações do repasse"
          className="h-8 flex-1 text-xs"
        />
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  );
}
