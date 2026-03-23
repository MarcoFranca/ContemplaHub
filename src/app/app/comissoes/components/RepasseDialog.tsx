"use client";

import * as React from "react";
import { toast } from "sonner";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {marcarRepassePagoAction, updateRepasseAction} from "../actions";
import type { ComissaoLancamento } from "../types";

export function RepasseDialog({ lancamento, refreshPath }: { lancamento: ComissaoLancamento; refreshPath: string }) {
  const [open, setOpen] = React.useState(false);
  if (lancamento.beneficiario_tipo !== "parceiro") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Landmark className="mr-2 h-4 w-4" />Repasse</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar repasse do parceiro</DialogTitle>
        </DialogHeader>

        <form action={async (formData) => {
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
        }} className="space-y-4">
          <div className="space-y-2">
            <Label>Status do repasse</Label>
            <select name="repasse_status" defaultValue={lancamento.repasse_status} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Previsto para</Label>
              <Input type="date" name="repasse_previsto_em" defaultValue={lancamento.repasse_previsto_em?.slice(0, 10) ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Pago em</Label>
              <Input type="datetime-local" name="repasse_pago_em" defaultValue={toDateTimeLocal(lancamento.repasse_pago_em)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea name="repasse_observacoes" defaultValue={lancamento.repasse_observacoes ?? ""} className="min-h-24" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar repasse</Button>
            <Button
                type="button"
                variant="secondary"
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
              Marcar como pago agora
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
