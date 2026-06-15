"use client";

import * as React from "react";
import { CalendarClock, CircleDollarSign, PencilLine, Save, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { editFinanceiroPagamentoAction } from "@/app/app/financeiro/pagamentos/actions";
import type { PagamentoItem, PagamentoStatus } from "@/app/app/financeiro/pagamentos/types";
import type { CotaPagamentoCompetencia } from "../types";

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fmtMonth(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

export function CompetenciaPagamentoDialog({ item }: { item: CotaPagamentoCompetencia }) {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  if (!item.pagamento_id) {
    return (
      <Button variant="outline" size="sm" disabled title="Gere o cronograma de pagamentos para habilitar a edição.">
        <PencilLine className="mr-2 h-4 w-4" />
        Pagamento
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-emerald-500/20 hover:bg-emerald-500/5">
          <PencilLine className="mr-2 h-4 w-4 text-emerald-300" />
          Pagamento
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden border-border/70 bg-background p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border/60 bg-emerald-500/5 px-6 py-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">
            <Wallet className="h-3.5 w-3.5" />
            Competência {fmtMonth(item.competencia)}
          </div>
          <DialogTitle className="pt-2 text-left text-base">Atualizar pagamento da competência</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Ajuste status, valor, vencimento e data de pagamento desta parcela.
          </p>
        </DialogHeader>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const status = formData.get("status") as PagamentoStatus;
            const valor = String(formData.get("valor") ?? "");
            const vencimento = String(formData.get("vencimento") ?? "");
            const pagoEm = String(formData.get("pago_em") ?? "");
            const observacoes = String(formData.get("observacoes") ?? "");

            const base: PagamentoItem = {
              id: item.pagamento_id!,
              contrato_id: item.contrato_id,
              competencia: item.competencia,
              valor: String(item.boleto_valor ?? item.valor_pago ?? 0),
              vencimento: item.vencimento,
              status: item.pago ? "pago" : "previsto",
              pago_em: item.pago_em,
              observacoes: item.motivo_nao_participacao ?? null,
              tipo: "parcela_mensal",
              origem: "manual",
            };

            try {
              setSaving(true);
              toast.loading("Atualizando pagamento...");
              const result = await editFinanceiroPagamentoAction(
                item.pagamento_id!,
                {
                  status,
                  valor: valor ? Number(valor) : undefined,
                  vencimento: vencimento || undefined,
                  pago_em: pagoEm || undefined,
                  observacoes: observacoes || undefined,
                },
                base,
              );
              toast.dismiss();
              if (!result.ok) {
                toast.error(result.error ?? "Erro ao atualizar pagamento.");
                return;
              }
              toast.success(result.message ?? "Pagamento atualizado.");
              setOpen(false);
            } catch (error) {
              toast.dismiss();
              toast.error(error instanceof Error ? error.message : "Erro ao atualizar pagamento.");
            } finally {
              setSaving(false);
            }
          }}
          className="space-y-5 px-6 py-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <Wallet className="h-3.5 w-3.5 text-emerald-300" />
                Status
              </Label>
              <select
                name="status"
                defaultValue={item.pago ? "pago" : "previsto"}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/15"
              >
                <option value="previsto">Previsto</option>
                <option value="emitido">Emitido</option>
                <option value="pago">Pago</option>
                <option value="atrasado">Atrasado</option>
                <option value="inadimplente">Inadimplente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <CircleDollarSign className="h-3.5 w-3.5 text-emerald-300" />
                Valor (R$)
              </Label>
              <Input
                type="number"
                step="0.01"
                name="valor"
                defaultValue={String(item.boleto_valor ?? item.valor_pago ?? "")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5 text-emerald-300" />
                Vencimento
              </Label>
              <Input type="date" name="vencimento" defaultValue={item.vencimento?.slice(0, 10) ?? ""} />
            </div>

            <div className="space-y-1.5">
              <Label className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5 text-emerald-300" />
                Pago em
              </Label>
              <Input type="datetime-local" name="pago_em" defaultValue={toDateTimeLocal(item.pago_em)} />
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Observações
            </div>
            <Textarea
              name="observacoes"
              defaultValue={item.motivo_nao_participacao ?? ""}
              className="mt-2 min-h-24 rounded-xl"
              placeholder="Registre contexto do pagamento, divergência ou qualquer detalhe relevante."
            />
          </div>

          <DialogFooter className="border-t border-border/60 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-500" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando..." : "Salvar pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
