"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Banknote, Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ComissaoLancamento } from "../types";
import { createRepasseLoteAction, uploadRepasseComprovanteAction } from "../actions";

const money = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const FORMAS = ["Pix", "TED", "Transferência", "Dinheiro", "Outro"];

export function PagarParceiroDialog({
  parceiroId,
  nome,
  items,
  refreshPath,
  trigger,
}: {
  parceiroId: string;
  nome: string;
  items: ComissaoLancamento[];
  refreshPath: string;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [forma, setForma] = React.useState("Pix");
  const [obs, setObs] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [pending, startTransition] = React.useTransition();

  const ids = items.map((i) => i.id);
  const total = items.reduce((s, i) => s + Number(i.valor_liquido || 0), 0);

  const confirmar = () => {
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await createRepasseLoteAction(parceiroId, ids, forma, obs.trim() || null, refreshPath);
      if (!res.ok || !res.loteId) {
        toast.error(res.error || "Não foi possível registrar o pagamento.");
        return;
      }
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await uploadRepasseComprovanteAction(res.loteId, fd);
        if (!up.ok) toast.warning(up.error || "Pagamento registrado, mas o comprovante falhou.");
      }
      toast.success(`Repasse de ${money(total)} pago a ${nome} (${res.repasses_pagos} parcela(s)).`);
      setOpen(false);
      setFile(null);
      setObs("");
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-emerald-400" />
            Pagar repasse · {nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="text-xs text-muted-foreground">Total a repassar</div>
            <div className="text-2xl font-bold tabular-nums text-emerald-300">{money(total)}</div>
            <div className="text-xs text-muted-foreground">{ids.length} parcela(s) serão marcadas como pagas</div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Forma de pagamento</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {FORMAS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setForma(f)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    forma === f
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Observações (opcional)</label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex.: pago via Pix chave CNPJ, ref. junho"
              rows={2}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Comprovante (PDF ou imagem, opcional)</label>
            <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/5 px-3 py-2 text-sm text-muted-foreground hover:bg-white/10">
              <Upload className="h-4 w-4" />
              {file ? <span className="truncate text-foreground">{file.name}</span> : "Anexar comprovante"}
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button
              onClick={confirmar}
              disabled={pending || ids.length === 0}
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              {pending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Confirmar pagamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
