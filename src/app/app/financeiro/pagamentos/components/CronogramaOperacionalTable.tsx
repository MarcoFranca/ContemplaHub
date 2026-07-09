"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  CircleSlash,
  CornerDownRight,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { editFinanceiroPagamentoAction } from "../actions";
import type { PagamentoItem, PagamentoStatus } from "../types";

type Props = {
  pagamentos: PagamentoItem[];
  busyPagamentoId?: string | null;
  onStatusChange: (item: PagamentoItem, status: PagamentoStatus) => void;
  onSkip: (item: PagamentoItem) => void;
  onCancelFuture: (item: PagamentoItem) => void;
  onRefresh?: () => void;
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  pago: {
    label: "Pago",
    cls: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  emitido: {
    label: "Emitido",
    cls: "border-sky-500/25 bg-sky-500/10 text-sky-300",
    dot: "bg-sky-400",
  },
  inadimplente: {
    label: "Inadimplente",
    cls: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
  },
  atrasado: {
    label: "Atrasado",
    cls: "border-orange-500/25 bg-orange-500/10 text-orange-300",
    dot: "bg-orange-400",
  },
  cancelado: {
    label: "Cancelado",
    cls: "border-rose-500/25 bg-rose-500/10 text-rose-300",
    dot: "bg-rose-400",
  },
  previsto: {
    label: "Previsto",
    cls: "border-slate-500/25 bg-slate-500/10 text-slate-400",
    dot: "bg-slate-500",
  },
};

const fmt = (v?: string | number | null) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

const fmtMonth = (v?: string | null) => {
  if (!v) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(
      new Date(v.includes("T") ? v : `${v}T12:00:00`),
    );
  } catch {
    return v;
  }
};

const fmtDate = (v?: string | null) => {
  if (!v) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(v.includes("T") ? v : `${v}T12:00:00`));
  } catch {
    return v;
  }
};

const fmtDateTimeLocal = (v?: string | null) => {
  if (!v) return "";
  try {
    return new Date(v).toISOString().slice(0, 16);
  } catch {
    return "";
  }
};

function StatusBadge({ status }: { status?: string | null }) {
  const cfg = STATUS_CONFIG[status ?? "previsto"] ?? STATUS_CONFIG.previsto;
  return (
    <Badge variant="outline" className={`inline-flex items-center gap-1.5 text-xs ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </Badge>
  );
}

type EditState = {
  status: PagamentoStatus;
  valor: string;
  vencimento: string;
  pago_em: string;
  observacoes: string;
};

function EditDialog({
  open,
  item,
  onClose,
  onSaved,
}: {
  open: boolean;
  item: PagamentoItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<EditState>({
    status: "previsto",
    valor: "",
    vencimento: "",
    pago_em: "",
    observacoes: "",
  });

  React.useEffect(() => {
    if (!item) return;
    setForm({
      status: item.status,
      valor: String(item.valor ?? ""),
      vencimento: item.vencimento?.slice(0, 10) ?? "",
      pago_em: fmtDateTimeLocal(item.pago_em),
      observacoes: item.observacoes ?? "",
    });
  }, [item]);

  const patch = (k: keyof EditState, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  async function handleSave() {
    if (!item) return;
    setSaving(true);
    const result = await editFinanceiroPagamentoAction(
      item.id,
      {
        status: form.status,
        valor: form.valor ? Number(form.valor) : undefined,
        vencimento: form.vencimento || undefined,
        pago_em: form.pago_em || undefined,
        observacoes: form.observacoes || undefined,
      },
      item,
    );
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error ?? "Erro ao salvar pagamento.");
      return;
    }
    toast.success(result.message ?? "Pagamento atualizado.");
    onSaved();
    onClose();
  }

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-white/10 bg-slate-900 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Editar pagamento — {fmtMonth(item.competencia)}</DialogTitle>
          <p className="text-xs text-slate-400">
            Contrato {item.contrato_numero ?? "—"} · Cota {item.numero_cota ?? "—"}
          </p>
        </DialogHeader>

        <div className="mt-2 grid gap-4">
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</label>
            <select
              value={form.status}
              onChange={(e) => patch("status", e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
            >
              <option value="previsto">Previsto</option>
              <option value="emitido">Emitido</option>
              <option value="pago">Pago</option>
              <option value="atrasado">Atrasado</option>
              <option value="inadimplente">Inadimplente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Valor (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={form.valor}
                onChange={(e) => patch("valor", e.target.value)}
                className="border-white/10 bg-slate-950 text-white"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Vencimento</label>
              <Input
                type="date"
                value={form.vencimento}
                onChange={(e) => patch("vencimento", e.target.value)}
                className="border-white/10 bg-slate-950 text-white"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Data/hora do pagamento</label>
            <Input
              type="datetime-local"
              value={form.pago_em}
              onChange={(e) => patch("pago_em", e.target.value)}
              className="border-white/10 bg-slate-950 text-white"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Observacoes</label>
            <Textarea
              rows={2}
              value={form.observacoes}
              onChange={(e) => patch("observacoes", e.target.value)}
              placeholder="Contexto operacional desta parcela"
              className="rounded-xl border-white/10 bg-slate-950 text-sm text-white placeholder:text-slate-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-300 hover:bg-white/10"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CronogramaOperacionalTable({
  pagamentos,
  busyPagamentoId,
  onStatusChange,
  onSkip,
  onCancelFuture,
  onRefresh,
}: Props) {
  const [editingItem, setEditingItem] = React.useState<PagamentoItem | null>(null);

  if (!pagamentos.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
        Nenhuma parcela operacional persistida ainda. Confirme o cronograma para gerar a visao mensal.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[1.1fr_0.95fr_0.8fr_0.9fr_1.7fr_2.5rem] gap-3 border-b border-white/10 bg-slate-950/60 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Competencia</span>
            <span>Vencimento</span>
            <span>Valor</span>
            <span>Status</span>
            <span>Comissao</span>
            <span />
          </div>

          <div className="divide-y divide-white/5">
            {pagamentos.map((item) => {
              const busy = busyPagamentoId === item.id;
              const locked = item.status === "cancelado";
              const paid = item.status === "pago";

              const comissaoInfo = item.lancamentos_pagos
                ? `${item.lancamentos_pagos} pago${item.lancamentos_pagos > 1 ? "s" : ""}`
                : item.lancamentos_disponiveis
                  ? `${item.lancamentos_disponiveis} disponivel`
                  : `${item.lancamentos_previstos ?? 0} previsto${(item.lancamentos_previstos ?? 0) !== 1 ? "s" : ""}`;

              const repasseInfo = item.repasses_pendentes
                ? `${item.repasses_pendentes} repasse${item.repasses_pendentes > 1 ? "s" : ""} pendente${item.repasses_pendentes > 1 ? "s" : ""}`
                : "";

              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-[1.1fr_0.95fr_0.8fr_0.9fr_1.7fr_2.5rem] items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-white/2 ${
                    busy ? "opacity-60" : ""
                  }`}
                >
                  <div>
                    <div className="font-medium text-white">{fmtMonth(item.competencia)}</div>
                    {item.referencia && <div className="text-xs text-slate-500">{item.referencia}</div>}
                    {item.pago_em && <div className="text-xs text-emerald-400/80">Pago {fmtDate(item.pago_em)}</div>}
                  </div>

                  <div className="text-sm text-slate-300">{fmtDate(item.vencimento)}</div>
                  <div className="font-medium text-white">{fmt(item.valor)}</div>
                  <StatusBadge status={item.status} />

                  <div className="min-w-0">
                    <div className="text-xs text-slate-300">{comissaoInfo}</div>
                    {repasseInfo && <div className="text-xs text-amber-400/80">{repasseInfo}</div>}
                    {item.lancamentos_total != null && (
                      <div className="text-xs text-slate-500">
                        {item.lancamentos_total} lancamento{item.lancamentos_total !== 1 ? "s" : ""} total
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={busy}
                        className="h-7 w-7 text-slate-400 hover:bg-white/10 hover:text-white"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48 border-white/10 bg-slate-900 text-white">
                      <DropdownMenuItem onClick={() => setEditingItem(item)} className="gap-2 text-sm">
                        <Pencil className="h-3.5 w-3.5 text-slate-400" />
                        Editar detalhes
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-white/10" />

                      {!paid && !locked && (
                        <DropdownMenuItem onClick={() => onStatusChange(item, "pago")} className="gap-2 text-sm text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Marcar como pago
                        </DropdownMenuItem>
                      )}

                      {!locked && !paid && (
                        <DropdownMenuItem onClick={() => onStatusChange(item, "inadimplente")} className="gap-2 text-sm text-amber-300">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Marcar inadimplente
                        </DropdownMenuItem>
                      )}

                      {(item.status === "inadimplente" || item.status === "atrasado" || item.status === "emitido") && (
                        <DropdownMenuItem onClick={() => onStatusChange(item, "previsto")} className="gap-2 text-sm text-slate-300">
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reverter para previsto
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator className="bg-white/10" />

                      {!locked && !paid && (
                        <DropdownMenuItem onClick={() => onSkip(item)} className="gap-2 text-sm text-slate-300">
                          <CornerDownRight className="h-3.5 w-3.5" />
                          Pular competencia
                        </DropdownMenuItem>
                      )}

                      {!locked && (
                        <DropdownMenuItem onClick={() => onCancelFuture(item)} className="gap-2 text-sm text-rose-300">
                          <CircleSlash className="h-3.5 w-3.5" />
                          Cancelar futuros
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <EditDialog
        open={Boolean(editingItem)}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSaved={() => {
          setEditingItem(null);
          onRefresh?.();
        }}
      />
    </>
  );
}
