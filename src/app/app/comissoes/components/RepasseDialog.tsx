"use client";

import * as React from "react";
import { CalendarClock, Landmark, Save, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { marcarRepassePagoAction, updateRepasseAction } from "../actions";
import type { ComissaoLancamento } from "../types";

export function RepasseDialog({ lancamento, refreshPath }: { lancamento: ComissaoLancamento; refreshPath: string }) {
  const [open, setOpen] = React.useState(false);
  if (lancamento.beneficiario_tipo !== "parceiro") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-emerald-500/20 hover:bg-emerald-500/5">
          <Landmark className="mr-2 h-4 w-4 text-emerald-300" />
          Repasse
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden border-border/70 bg-background p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/60 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">
            <Wallet className="h-3.5 w-3.5" />
            Repasse do parceiro
          </div>
          <DialogTitle className="pt-2 text-left text-base">Atualizar repasse do parceiro</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Ajuste status, previsão e observações do repasse com uma visão operacional mais clara.
          </p>
        </DialogHeader>

        <form
          action={async (formData) => {
            try {
              toast.loading("Atualizando repasse...");
              formData.set("lancamento_id", lancamento.id);
              formData.set("refresh_path", refreshPath);
              await updateRepasseAction(formData);
              toast.dismiss();
              toast.success("Repasse atualizado.");
              setOpen(false);
            } catch (error) {
              toast.dismiss();
              toast.error(error instanceof Error ? error.message : "Erro ao atualizar repasse.");
            }
          }}
          className="space-y-5 px-6 py-5"
        >
          <div className="grid gap-4 md:grid-cols-[1fr_0.9fr_0.9fr]">
            <FieldShell label="Status do repasse" icon={Landmark}>
              <select
                name="repasse_status"
                defaultValue={lancamento.repasse_status}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/15"
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </FieldShell>

            <FieldShell label="Previsto para" icon={CalendarClock}>
              <Input type="date" name="repasse_previsto_em" defaultValue={lancamento.repasse_previsto_em?.slice(0, 10) ?? ""} />
            </FieldShell>

            <FieldShell label="Pago em" icon={CalendarClock}>
              <Input type="datetime-local" name="repasse_pago_em" defaultValue={toDateTimeLocal(lancamento.repasse_pago_em)} />
            </FieldShell>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Observações
            </div>
            <Textarea
              name="repasse_observacoes"
              defaultValue={lancamento.repasse_observacoes ?? ""}
              className="mt-2 min-h-28 rounded-xl"
              placeholder="Registre contexto do repasse, confirmação, divergência ou qualquer detalhe relevante."
            />
          </div>

          <DialogFooter className="flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-emerald-500/20 hover:bg-emerald-500/5"
                onClick={async () => {
                  try {
                    toast.loading("Marcando repasse como pago...");
                    const fd = new FormData();
                    fd.set("lancamento_id", lancamento.id);
                    fd.set("refresh_path", refreshPath);
                    fd.set("pago_em", new Date().toISOString());
                    await marcarRepassePagoAction(fd);
                    toast.dismiss();
                    toast.success("Repasse marcado como pago.");
                    setOpen(false);
                  } catch (error) {
                    toast.dismiss();
                    toast.error(error instanceof Error ? error.message : "Erro ao marcar repasse.");
                  }
                }}
              >
                <Wallet className="mr-2 h-4 w-4 text-emerald-300" />
                Marcar como pago agora
              </Button>
            </div>

            <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-500">
              <Save className="mr-2 h-4 w-4" />
              Salvar repasse
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
      <Label className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-emerald-300" />
        {label}
      </Label>
      {children}
    </div>
  );
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
