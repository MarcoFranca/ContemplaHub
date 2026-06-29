"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, History, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { RepasseLote } from "../types";
import { getRepasseComprovanteUrlAction, listRepasseLotesAction } from "../actions";

const money = (v: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));
const dataHora = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

export function HistoricoLotesDialog({
  parceiroId,
  nome,
  trigger,
}: {
  parceiroId: string;
  nome: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [lotes, setLotes] = React.useState<RepasseLote[]>([]);
  const [busyComp, setBusyComp] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    listRepasseLotesAction(parceiroId)
      .then((items) => active && setLotes(items))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [open, parceiroId]);

  const abrirComprovante = (loteId: string) => {
    setBusyComp(loteId);
    getRepasseComprovanteUrlAction(loteId)
      .then((res) => {
        if (res.ok && res.url) window.open(res.url, "_blank", "noopener,noreferrer");
        else toast.error(res.error || "Comprovante indisponível.");
      })
      .finally(() => setBusyComp(null));
  };

  const totalPago = lotes.reduce((s, l) => s + Number(l.total || 0), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-400" />
            Histórico de repasses · {nome}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando…
          </div>
        ) : lotes.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhum lote de repasse registrado para este parceiro.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              {lotes.length} lote(s) · total {money(totalPago)}
            </div>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {lotes.map((l) => (
                <div key={l.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold tabular-nums text-emerald-300">{money(l.total)}</div>
                      <div className="text-xs text-muted-foreground">
                        {dataHora(l.pago_em || l.created_at)} · {l.quantidade} parcela(s)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {l.forma_pagamento && (
                        <Badge variant="outline" className="border-white/10">{l.forma_pagamento}</Badge>
                      )}
                      {l.comprovante_path ? (
                        <button
                          type="button"
                          onClick={() => abrirComprovante(l.id)}
                          disabled={busyComp === l.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-2.5 py-1 text-xs text-emerald-300 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
                        >
                          {busyComp === l.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <FileText className="h-3.5 w-3.5" />
                          )}
                          Comprovante
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">sem comprovante</span>
                      )}
                    </div>
                  </div>
                  {l.observacoes && (
                    <p className="mt-1.5 text-xs text-muted-foreground">{l.observacoes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
