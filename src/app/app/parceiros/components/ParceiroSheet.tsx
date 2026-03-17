"use client";

import * as React from "react";
import { toast } from "sonner";
import { Handshake, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { createParceiroAction, updateParceiroAction } from "../actions";
import type { Parceiro, PixTipo } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parceiro?: Parceiro | null;
  onSuccess?: () => void;
};

const PIX_OPTIONS: Array<{ value: PixTipo; label: string }> = [
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "email", label: "E-mail" },
  { value: "telefone", label: "Telefone" },
  { value: "aleatoria", label: "Chave aleatória" },
];

export function ParceiroSheet({ open, onOpenChange, parceiro, onSuccess }: Props) {
  const [ativo, setAtivo] = React.useState(true);

  React.useEffect(() => {
    setAtivo(parceiro?.ativo ?? true);
  }, [parceiro, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-emerald-400" />
            {parceiro ? "Editar parceiro" : "Novo parceiro"}
          </SheetTitle>
        </SheetHeader>

        <form
          action={async (formData: FormData) => {
            try {
              toast.dismiss();
              toast.loading(parceiro ? "Atualizando parceiro..." : "Criando parceiro...");
              if (parceiro?.id) {
                formData.set("parceiro_id", parceiro.id);
                await updateParceiroAction(formData);
              } else {
                await createParceiroAction(formData);
              }
              toast.dismiss();
              toast.success(parceiro ? "Parceiro atualizado com sucesso." : "Parceiro criado com sucesso.");
              onOpenChange(false);
              onSuccess?.();
            } catch (error) {
              console.error(error);
              toast.dismiss();
              toast.error(error instanceof Error ? error.message : "Erro ao salvar parceiro.");
            }
          }}
          className="mt-6 space-y-5"
        >
          {parceiro?.id ? <input type="hidden" name="parceiro_id" value={parceiro.id} /> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" name="nome" defaultValue={parceiro?.nome ?? ""} required placeholder="Ex.: Leandro Silva" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
              <Input id="cpf_cnpj" name="cpf_cnpj" defaultValue={parceiro?.cpf_cnpj ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" name="telefone" defaultValue={parceiro?.telefone ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" defaultValue={parceiro?.email ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pix_tipo">Tipo de chave PIX</Label>
              <select id="pix_tipo" name="pix_tipo" defaultValue={parceiro?.pix_tipo ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Selecione</option>
                {PIX_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pix_chave">Chave PIX</Label>
              <Input id="pix_chave" name="pix_chave" defaultValue={parceiro?.pix_chave ?? ""} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" name="observacoes" defaultValue={parceiro?.observacoes ?? ""} className="min-h-24" />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
            <input type="checkbox" name="ativo" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
            Parceiro ativo para novas cartas e repasses
          </label>

          <SheetFooter>
            <div className="flex w-full items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Salvar parceiro
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
