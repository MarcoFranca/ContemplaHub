"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, CheckCircle2, CircleSlash, CornerDownRight, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ComissaoLancamento } from "../types";
import {
  marcarPagoAction,
  marcarCanceladoAction,
  reverterPrevistoAction,
  marcarParaCobrancaAction,
  removerFlagCobrancaAction,
  skipComissaoLancamentoAction,
} from "../actions";

const isInadimplente = (item: ComissaoLancamento) =>
  item.observacoes?.includes("INADIMPLENTE") ?? false;

function ActionBtn({
  onClick,
  disabled,
  children,
  title,
  variant,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
  variant: "green" | "red" | "orange" | "ghost";
}) {
  const cls = {
    green: "text-emerald-400 hover:bg-emerald-500/15 border-emerald-500/20",
    red: "text-rose-400 hover:bg-rose-500/15 border-rose-500/20",
    orange: "text-orange-400 hover:bg-orange-500/15 border-orange-500/20",
    ghost: "text-muted-foreground hover:bg-white/8 border-border/30",
  }[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors disabled:opacity-40 ${cls}`}
    >
      {children}
    </button>
  );
}

function ConfirmCancelModal({
  open,
  onConfirm,
  onClose,
}: {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <CircleSlash className="mx-auto mb-3 h-8 w-8 text-rose-400" />
        <h3 className="text-center text-sm font-semibold text-white">Cancelar este lançamento?</h3>
        <p className="mt-2 text-center text-xs text-slate-400">
          Somente <strong className="text-slate-200">este lançamento</strong> será marcado como não
          recebido. <br />
          A <strong className="text-slate-200">cota e o contrato permanecem ativos</strong>. <br />
          Você pode reverter isso depois se precisar.
        </p>
        <div className="mt-5 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-white/10 text-slate-300 hover:bg-white/10"
            onClick={onClose}
          >
            Voltar
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/20"
            onClick={onConfirm}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConfirmSkipModal({
  open,
  onConfirm,
  onClose,
}: {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <CornerDownRight className="mx-auto mb-3 h-8 w-8 text-sky-400" />
        <h3 className="text-center text-sm font-semibold text-white">Pular esta competência?</h3>
        <p className="mt-2 text-center text-xs text-slate-400">
          Use quando <strong className="text-slate-200">não houve pagamento neste mês</strong> (ex.:
          assembleia ainda não iniciada). <br />
          Este mês e <strong className="text-slate-200">todas as parcelas futuras</strong> serão
          empurrados <strong className="text-slate-200">+1 mês</strong>. <br />
          Você pode reverter depois se precisar.
        </p>
        <div className="mt-5 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-white/10 text-slate-300 hover:bg-white/10"
            onClick={onClose}
          >
            Voltar
          </Button>
          <Button
            size="sm"
            className="flex-1 border border-sky-500/20 bg-sky-500/20 text-sky-300 hover:bg-sky-500/30"
            onClick={onConfirm}
          >
            <CornerDownRight className="mr-1.5 h-3.5 w-3.5" /> Pular competência
          </Button>
        </div>
      </div>
    </div>
  );
}

function CobrancaModal({
  open,
  onConfirm,
  onClose,
}: {
  open: boolean;
  onConfirm: (motivo: string) => void;
  onClose: () => void;
}) {
  const [motivo, setMotivo] = React.useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <Bell className="mx-auto mb-3 h-7 w-7 text-orange-400" />
        <h3 className="text-center text-sm font-semibold text-white">Marcar para cobrança</h3>
        <p className="mt-1.5 text-center text-xs text-slate-400">
          O lançamento ficará visível na lista de cobranças pendentes. A comissão{" "}
          <strong className="text-slate-200">não</strong> será paga até você resolver e dar baixa.
        </p>
        <div className="mt-4 space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Motivo (opcional)
          </label>
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex.: boleto vencido em 15/06"
            className="h-9 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white placeholder:text-slate-600 outline-none"
          />
        </div>
        <div className="mt-5 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-white/10 text-slate-300 hover:bg-white/10"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/20"
            onClick={() => { onConfirm(motivo); setMotivo(""); }}
          >
            <Bell className="mr-1.5 h-3.5 w-3.5" /> Marcar
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Ações rápidas (estilo "Operação Mensal") para lançamentos da empresa:
 * dar baixa, marcar/remover cobrança, cancelar ou reverter — sem abrir diálogo.
 */
export function LancamentoQuickActions({ item }: { item: ComissaoLancamento }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [confirmCobranca, setConfirmCobranca] = React.useState(false);
  const [confirmSkip, setConfirmSkip] = React.useState(false);

  const isPago = item.status === "pago";
  const isCancelado = item.status === "cancelado";
  const isPrevisto = !isPago && !isCancelado;
  const inadimplente = isInadimplente(item);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <ConfirmCancelModal
        open={confirmCancel}
        onConfirm={async () => {
          setConfirmCancel(false);
          await run(() => marcarCanceladoAction(item.id));
        }}
        onClose={() => setConfirmCancel(false)}
      />
      <CobrancaModal
        open={confirmCobranca}
        onConfirm={async (motivo) => {
          setConfirmCobranca(false);
          await run(() => marcarParaCobrancaAction(item.id, motivo));
          toast.success("Lançamento marcado para cobrança.");
        }}
        onClose={() => setConfirmCobranca(false)}
      />
      <ConfirmSkipModal
        open={confirmSkip}
        onConfirm={async () => {
          setConfirmSkip(false);
          await run(async () => {
            const res = await skipComissaoLancamentoAction(item.id);
            toast.success(res?.message || "Competência pulada e parcelas futuras reprogramadas.");
          });
        }}
        onClose={() => setConfirmSkip(false)}
      />

      {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}

      {isPrevisto && !inadimplente && (
        <>
          <ActionBtn onClick={() => run(() => marcarPagoAction(item.id))} disabled={busy} variant="green" title="Confirmar que a empresa recebeu esta comissão">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </ActionBtn>
          <ActionBtn onClick={() => setConfirmCobranca(true)} disabled={busy} variant="orange" title="Marcar para cobrança — cliente em atraso no boleto">
            <Bell className="h-3.5 w-3.5" />
          </ActionBtn>
          <ActionBtn onClick={() => setConfirmCancel(true)} disabled={busy} variant="red" title="Não vai receber — cancela apenas este lançamento, não a cota">
            <CircleSlash className="h-3.5 w-3.5" />
          </ActionBtn>
          <ActionBtn
            onClick={() => setConfirmSkip(true)}
            disabled={busy}
            variant="ghost"
            title="Pular competência — não houve pagamento neste mês (ex.: assembleia não iniciada). Empurra as parcelas futuras +1 mês."
          >
            <CornerDownRight className="h-3.5 w-3.5" />
          </ActionBtn>
        </>
      )}

      {isPrevisto && inadimplente && (
        <>
          <ActionBtn onClick={() => run(() => marcarPagoAction(item.id))} disabled={busy} variant="green" title="Regularizou — confirmar recebimento da comissão pela empresa">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </ActionBtn>
          <ActionBtn onClick={() => run(() => removerFlagCobrancaAction(item.id))} disabled={busy} variant="ghost" title="Remover alerta de cobrança">
            <BellOff className="h-3.5 w-3.5" />
          </ActionBtn>
        </>
      )}

      {(isPago || isCancelado) && (
        <ActionBtn onClick={() => run(() => reverterPrevistoAction(item.id))} disabled={busy} variant="ghost" title="Desfazer — reverter para Previsto">
          <RotateCcw className="h-3.5 w-3.5" />
        </ActionBtn>
      )}
    </div>
  );
}
