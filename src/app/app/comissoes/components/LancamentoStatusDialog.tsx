"use client";

import * as React from "react";
import { toast } from "sonner";
import { PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateLancamentoStatusAction } from "../actions";
import type { ComissaoLancamento } from "../types";

export function LancamentoStatusDialog({ lancamento, refreshPath }: { lancamento: ComissaoLancamento; refreshPath: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><PencilLine className="mr-2 h-4 w-4" />Status</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar lançamento</DialogTitle>
        </DialogHeader>

        <form action={async (formData) => {
          try {
            toast.loading("Atualizando lançamento...");
            formData.set("lancamento_id", lancamento.id);
            formData.set("refresh_path", refreshPath);
            await updateLancamentoStatusAction(formData);
            toast.dismiss();
            toast.success("Lançamento atualizado.");
            setOpen(false);
          } catch (error) {
            toast.dismiss();
            toast.error(error instanceof Error ? error.message : "Erro ao atualizar lançamento.");
          }
        }} className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <select name="status" defaultValue={lancamento.status} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="disponivel">Disponível</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Competência real</Label>
            <Input type="date" name="competencia_real" defaultValue={lancamento.competencia_real?.slice(0, 10) ?? ""} />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea name="observacoes" defaultValue={lancamento.observacoes ?? ""} className="min-h-24" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar status</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
