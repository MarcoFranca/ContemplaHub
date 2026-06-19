"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CircleSlash,
  Clock,
  CornerDownRight,
  ExternalLink,
  Loader2,
  RotateCcw,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ComissaoLancamento } from "../types";
import {
  marcarLotePagoAction,
  marcarPagoAction,
  marcarCanceladoAction,
  reverterPrevistoAction,
  marcarParaCobrancaAction,
  removerFlagCobrancaAction,
  skipComissaoLancamentoAction,
} from "../actions";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (v: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

const fmtMes = (iso?: string | null) => {
  if (!iso) return "—";
  const [year, month] = iso.split("-");
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(
    new Date(Number(year), Number(month) - 1, 1)
  );
};

const mesAtualKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const compKey = (iso?: string | null) => (iso ?? "").slice(0, 7);

const isInadimplente = (item: ComissaoLancamento) =>
  item.observacoes?.includes("INADIMPLENTE") ?? false;

const EVENTO_LABELS: Record<string, string> = {
  adesao: "Adesão",
  primeira_cobranca_valida: "1ª Cobrança",
  proxima_cobranca: "Próx. Cobrança",
  contemplacao: "Contemplação",
  manual: "Manual",
};

// ── Agrupamento por mês ───────────────────────────────────────────────────────

type Grupo = {
  mes: string;
  label: string;
  items: ComissaoLancamento[];
  totalBruto: number;
  pendentes: ComissaoLancamento[];
  isFuturo: boolean;
};

function agrupar(items: ComissaoLancamento[]): Grupo[] {
  const mesAtual = mesAtualKey();
  const map = new Map<string, ComissaoLancamento[]>();
  for (const item of items) {
    const key = compKey(item.competencia_prevista);
    if (!key) continue;
    (map.get(key) ?? (map.set(key, []), map.get(key)!)).push(item);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([mes, grpItems]) => ({
      mes,
      label: fmtMes(mes + "-01"),
      items: grpItems,
      totalBruto: grpItems.reduce((s, i) => s + Number(i.valor_bruto || 0), 0),
      pendentes: grpItems.filter((i) => i.status !== "pago" && i.status !== "cancelado"),
      isFuturo: mes > mesAtual,
    }));
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

function StatusBadge({ item }: { item: ComissaoLancamento }) {
  const inadimplente = isInadimplente(item);
  if (inadimplente) {
    return (
      <Badge variant="outline" className="text-[10px] border-orange-500/30 bg-orange-500/10 text-orange-300">
        Em cobrança
      </Badge>
    );
  }
  const cfg: Record<string, { label: string; cls: string }> = {
    previsto: { label: "Previsto", cls: "border-slate-500/25 bg-slate-500/10 text-slate-400" },
    disponivel: { label: "Disponível", cls: "border-amber-500/25 bg-amber-500/10 text-amber-300" },
    pago: { label: "Pago ✓", cls: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" },
    cancelado: { label: "Cancelado", cls: "border-rose-500/25 bg-rose-500/10 text-rose-300" },
  };
  const c = cfg[item.status] ?? cfg.previsto;
  return <Badge variant="outline" className={`text-[10px] ${c.cls}`}>{c.label}</Badge>;
}

// ── Diálogo de confirmação de cancelamento ────────────────────────────────────

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
          A <strong className="text-slate-200">cota e o contrato permanecem ativos</strong>.{" "}
          <br />
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

// ── Diálogo de confirmação de pular competência ───────────────────────────────

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

// ── Modal de flagging de inadimplência ────────────────────────────────────────

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

// ── Linha de lançamento ────────────────────────────────────────────────────────

function LancamentoRow({
  item,
  busy,
  onPago,
  onCancelado,
  onReverter,
  onCobranca,
  onRemoverCobranca,
  onSkip,
}: {
  item: ComissaoLancamento;
  busy: boolean;
  onPago: () => void;
  onCancelado: () => void;
  onReverter: () => void;
  onCobranca: () => void;
  onRemoverCobranca: () => void;
  onSkip: () => void;
}) {
  const isPago = item.status === "pago";
  const isCancelado = item.status === "cancelado";
  const isPrevisto = !isPago && !isCancelado;
  const inadimplente = isInadimplente(item);

  const repasseParceiros = item.repasse_parceiros ?? [];
  const repasseTotal = repasseParceiros.reduce((s, p) => s + Number(p.valor_bruto || 0), 0);
  const valorTotal = Number(item.valor_bruto || 0) + repasseTotal;
  const repasseNomes = repasseParceiros
    .map((p) => p.nome)
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className={`grid grid-cols-[1fr_5.5rem_5.5rem_7rem_6.5rem] items-center gap-3 border-b border-white/5 px-4 py-2.5 text-sm last:border-0 transition-colors hover:bg-white/2 ${
        isCancelado ? "opacity-40" : ""
      } ${inadimplente ? "bg-orange-500/4" : ""}`}
    >
      {/* Beneficiário / Info */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {inadimplente && <Bell className="h-3 w-3 flex-shrink-0 text-orange-400" />}
          <span className="truncate font-medium text-foreground">
            {item.beneficiario_tipo === "empresa"
              ? "Empresa"
              : (item.parceiros_corretores?.nome ?? "Parceiro")}
          </span>
        </div>
        <Link
          href={`/app/contratos/${item.contrato_id}`}
          className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-emerald-300 hover:underline"
          title="Ver detalhes da carta/contrato"
        >
          <span className="truncate">
            {item.cliente_nome ?? "Cliente sem nome"}
            {item.grupo_codigo && <> · Grupo {item.grupo_codigo}</>}
            {item.numero_cota && <> · Cota {item.numero_cota}</>}
          </span>
          <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50" />
        </Link>
        <div className="mt-0.5 text-xs text-muted-foreground/70">
          {EVENTO_LABELS[item.tipo_evento] ?? item.tipo_evento}
          {inadimplente && item.observacoes && (
            <span className="ml-2 text-orange-400/80">
              {item.observacoes.replace("⚠ INADIMPLENTE: ", "").replace("⚠ INADIMPLENTE", "em atraso")}
            </span>
          )}
        </div>
        {repasseTotal > 0 && (
          <div className="mt-0.5 text-xs text-sky-400/80">
            Repassa {fmt(repasseTotal)}
            {repasseNomes && <> p/ {repasseNomes}</>}
          </div>
        )}
      </div>

      {/* Total recebido da operadora */}
      <div className="text-right font-semibold tabular-nums text-foreground">
        {fmt(repasseTotal > 0 ? valorTotal : item.valor_bruto)}
      </div>

      {/* Valor que fica para a empresa */}
      <div className="text-right text-xs tabular-nums text-muted-foreground">
        {fmt(repasseTotal > 0 ? item.valor_bruto : item.valor_liquido)}
      </div>

      {/* Status */}
      <div className="flex justify-center">
        <StatusBadge item={item} />
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end gap-1">
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}

        {isPrevisto && !inadimplente && (
          <>
            <ActionBtn onClick={onPago} disabled={busy} variant="green" title="Confirmar que a empresa recebeu esta comissão (o pagamento do cliente já é registrado em Financeiro)">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </ActionBtn>
            <ActionBtn onClick={onCobranca} disabled={busy} variant="orange" title="Marcar para cobrança — cliente em atraso no boleto">
              <Bell className="h-3.5 w-3.5" />
            </ActionBtn>
            <ActionBtn onClick={onCancelado} disabled={busy} variant="red" title="Não vai receber — cancela apenas este lançamento, não a cota">
              <CircleSlash className="h-3.5 w-3.5" />
            </ActionBtn>
            <ActionBtn onClick={onSkip} disabled={busy} variant="ghost" title="Pular competência — não houve pagamento neste mês (ex.: assembleia não iniciada). Empurra as parcelas futuras +1 mês.">
              <CornerDownRight className="h-3.5 w-3.5" />
            </ActionBtn>
          </>
        )}

        {isPrevisto && inadimplente && (
          <>
            <ActionBtn onClick={onPago} disabled={busy} variant="green" title="Regularizou — confirmar recebimento da comissão pela empresa">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </ActionBtn>
            <ActionBtn onClick={onRemoverCobranca} disabled={busy} variant="ghost" title="Remover alerta de cobrança">
              <BellOff className="h-3.5 w-3.5" />
            </ActionBtn>
          </>
        )}

        {(isPago || isCancelado) && (
          <ActionBtn onClick={onReverter} disabled={busy} variant="ghost" title="Desfazer — reverter para Previsto">
            <RotateCcw className="h-3.5 w-3.5" />
          </ActionBtn>
        )}
      </div>
    </div>
  );
}

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

// ── Grupo de mês ──────────────────────────────────────────────────────────────

function GrupoMes({
  grupo,
  isAtual,
  onRefresh,
}: {
  grupo: Grupo;
  isAtual: boolean;
  onRefresh: () => void;
}) {
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [busyLote, setBusyLote] = React.useState(false);
  const [confirmCancel, setConfirmCancel] = React.useState<string | null>(null);
  const [confirmCobranca, setConfirmCobranca] = React.useState<string | null>(null);
  const [confirmSkip, setConfirmSkip] = React.useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState(grupo.isFuturo);

  const run = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    try { await fn(); onRefresh(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro."); }
    finally { setBusyId(null); }
  };

  const handleLote = async () => {
    const ids = grupo.pendentes
      .filter((i) => !isInadimplente(i))
      .map((i) => i.id);
    if (!ids.length) return;
    setBusyLote(true);
    try {
      await marcarLotePagoAction(ids);
      toast.success(`${ids.length} lançamento${ids.length !== 1 ? "s" : ""} marcado${ids.length !== 1 ? "s" : ""} como pago.`);
      onRefresh();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro."); }
    finally { setBusyLote(false); }
  };

  const pendentesLote = grupo.pendentes.filter((i) => !isInadimplente(i));
  const todosOk = grupo.pendentes.length === 0;

  const borderCls = isAtual
    ? "border-emerald-500/25 bg-emerald-500/4"
    : grupo.isFuturo
    ? "border-sky-500/15 bg-sky-500/3"
    : "border-border/35 bg-card/10";

  return (
    <>
      <ConfirmCancelModal
        open={Boolean(confirmCancel)}
        onConfirm={async () => {
          const id = confirmCancel!;
          setConfirmCancel(null);
          await run(id, () => marcarCanceladoAction(id));
        }}
        onClose={() => setConfirmCancel(null)}
      />
      <CobrancaModal
        open={Boolean(confirmCobranca)}
        onConfirm={async (motivo) => {
          const id = confirmCobranca!;
          setConfirmCobranca(null);
          await run(id, () => marcarParaCobrancaAction(id, motivo));
          toast.success("Lançamento marcado para cobrança. Aparecerá nos alertas.");
        }}
        onClose={() => setConfirmCobranca(null)}
      />

      <ConfirmSkipModal
        open={Boolean(confirmSkip)}
        onConfirm={async () => {
          const id = confirmSkip!;
          setConfirmSkip(null);
          await run(id, async () => {
            const res = await skipComissaoLancamentoAction(id);
            toast.success(res?.message || "Competência pulada e parcelas futuras reprogramadas.");
          });
        }}
        onClose={() => setConfirmSkip(null)}
      />

      <div className={`overflow-hidden rounded-2xl border ${borderCls}`}>
        {/* Cabeçalho */}
        <div
          className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 select-none"
          onClick={() => !isAtual && setCollapsed((v) => !v)}
        >
          <div className="flex items-center gap-2.5">
            {isAtual ? <Zap className="h-4 w-4 text-emerald-400" /> :
             grupo.isFuturo ? <CalendarDays className="h-4 w-4 text-sky-400" /> :
             <Clock className="h-4 w-4 text-muted-foreground" />}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold capitalize text-foreground">{grupo.label}</span>
                {isAtual && (
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-400">Mês atual</Badge>
                )}
                {grupo.isFuturo && (
                  <Badge variant="outline" className="text-[10px] border-sky-500/20 bg-sky-500/10 text-sky-400">Futuro</Badge>
                )}
                {!isAtual && !grupo.isFuturo && todosOk && (
                  <Badge variant="outline" className="text-[10px] border-emerald-500/20 bg-emerald-500/8 text-emerald-400/70">Em dia</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {grupo.items.length} lançamento{grupo.items.length !== 1 ? "s" : ""} · {fmt(grupo.totalBruto)}
                {grupo.pendentes.length > 0 && (
                  <> · <span className="text-amber-400">{grupo.pendentes.length} pendente{grupo.pendentes.length !== 1 ? "s" : ""}</span></>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendentesLote.length > 1 && !collapsed && (
              <Button
                type="button"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleLote(); }}
                disabled={busyLote || busyId !== null}
                className={`h-8 gap-1.5 text-xs ${
                  isAtual
                    ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    : "border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                }`}
              >
                {busyLote ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Dar baixa em lote ({pendentesLote.length})
              </Button>
            )}
            {!isAtual && (
              collapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Linhas */}
        {!collapsed && (
          <div className="border-t border-white/5">
            <div className="grid grid-cols-[1fr_5.5rem_5.5rem_7rem_6.5rem] gap-3 border-b border-white/5 bg-card/20 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              <span>Beneficiário / Evento</span>
              <span className="text-right">Total</span>
              <span className="text-right">Empresa</span>
              <span className="text-center">Status</span>
              <span className="text-right">Ações</span>
            </div>
            {grupo.items.map((item) => (
              <LancamentoRow
                key={item.id}
                item={item}
                busy={busyId === item.id || busyLote}
                onPago={() => run(item.id, () => marcarPagoAction(item.id))}
                onCancelado={() => setConfirmCancel(item.id)}
                onReverter={() => run(item.id, () => reverterPrevistoAction(item.id))}
                onCobranca={() => setConfirmCobranca(item.id)}
                onRemoverCobranca={() => run(item.id, () => removerFlagCobrancaAction(item.id))}
                onSkip={() => setConfirmSkip(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── Seção: Alertas de cobrança ────────────────────────────────────────────────

function AlertasCobranca({
  items,
  onRefresh,
}: {
  items: ComissaoLancamento[];
  onRefresh: () => void;
}) {
  const porContrato = new Map<string, ComissaoLancamento[]>();
  for (const item of items) {
    const key = item.contrato_id;
    (porContrato.get(key) ?? (porContrato.set(key, []), porContrato.get(key)!)).push(item);
  }
  const contratos = Array.from(porContrato.entries());
  if (!contratos.length) return null;

  const totalBloqueado = items.reduce((s, i) => s + Number(i.valor_bruto || 0), 0);

  return (
    <div className="rounded-2xl border border-orange-500/25 bg-orange-500/5 p-5">
      <div className="mb-4 flex items-start gap-3">
        <Bell className="h-5 w-5 flex-shrink-0 text-orange-400 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Cobranças pendentes</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {contratos.length} contrato{contratos.length !== 1 ? "s" : ""} com clientes em atraso no boleto ·{" "}
            <span className="text-orange-300 font-medium">{fmt(totalBloqueado)} bloqueados</span>
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {contratos.map(([contratoId, cItems]) => {
          const maisAntigo = cItems.reduce((min, i) =>
            (i.competencia_prevista ?? "") < (min.competencia_prevista ?? "") ? i : min
          );
          const meses = new Set(cItems.map((i) => compKey(i.competencia_prevista))).size;
          const total = cItems.reduce((s, i) => s + Number(i.valor_bruto || 0), 0);
          const motivo = cItems[0].observacoes?.replace("⚠ INADIMPLENTE: ", "").replace("⚠ INADIMPLENTE", "");

          return (
            <div key={contratoId} className="flex items-center justify-between gap-3 rounded-xl border border-orange-500/15 bg-orange-500/5 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">
                    {cItems[0].parceiros_corretores?.nome ?? "Empresa"}
                  </span>
                  {motivo && (
                    <span className="text-xs text-orange-300/80 truncate">· {motivo}</span>
                  )}
                </div>
                <div className="ml-5 mt-0.5 text-xs text-muted-foreground">
                  Desde {fmtMes(maisAntigo.competencia_prevista)} · {meses} mês{meses !== 1 ? "es" : ""} em aberto
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <div className="text-sm font-bold text-orange-300">{fmt(total)}</div>
                  <div className="text-xs text-muted-foreground">{cItems.length} lanç.</div>
                </div>
                <Button
                  asChild size="sm" variant="outline"
                  className="h-8 gap-1.5 border-orange-500/20 text-xs text-orange-300 hover:bg-orange-500/10"
                >
                  <a href={`/app/financeiro/pagamentos?contrato_id=${contratoId}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3 w-3" /> Ver contrato
                  </a>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── KPI strip ──────────────────────────────────────────────────────────────────

function KpiStrip({
  totalPago,
  totalPendenteMes,
  totalAtraso,
  totalCobranca,
}: {
  totalPago: number;
  totalPendenteMes: number;
  totalAtraso: number;
  totalCobranca: number;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {[
        {
          label: "Já recebido (pago)",
          value: fmt(totalPago),
          sub: "Total acumulado confirmado",
          color: "emerald",
          icon: <CheckCircle2 className="h-4 w-4" />,
        },
        {
          label: "A receber este mês",
          value: fmt(totalPendenteMes),
          sub: "Pendentes do mês atual",
          color: "sky",
          icon: <Zap className="h-4 w-4" />,
        },
        {
          label: "Em cobrança",
          value: fmt(totalCobranca),
          sub: "Aguardando regularização",
          color: totalCobranca > 0 ? "orange" : "slate",
          icon: <Bell className="h-4 w-4" />,
          alert: totalCobranca > 0,
        },
        {
          label: "Meses em atraso",
          value: fmt(totalAtraso),
          sub: "Meses anteriores sem baixa",
          color: totalAtraso > 0 ? "amber" : "slate",
          icon: <AlertTriangle className="h-4 w-4" />,
          alert: totalAtraso > 0,
        },
      ].map(({ label, value, sub, color, icon, alert }) => {
        const styles: Record<string, { border: string; bg: string; icon: string }> = {
          emerald: { border: "border-emerald-500/20", bg: "bg-emerald-500/5", icon: "text-emerald-400" },
          sky: { border: "border-sky-500/20", bg: "bg-sky-500/5", icon: "text-sky-400" },
          orange: { border: "border-orange-500/20", bg: "bg-orange-500/5", icon: "text-orange-400" },
          amber: { border: "border-amber-500/20", bg: "bg-amber-500/5", icon: "text-amber-400" },
          slate: { border: "border-border/30", bg: "bg-card/15", icon: "text-muted-foreground" },
        };
        const c = styles[color] ?? styles.slate;
        return (
          <div key={label} className={`rounded-2xl border p-4 ${c.border} ${c.bg}`}>
            <div className={`mb-2 flex items-center gap-2 ${c.icon}`}>
              {icon}
              {alert && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
            </div>
            <div className="text-xl font-bold text-foreground">{value}</div>
            <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
            <div className="mt-0.5 text-xs text-muted-foreground/70">{sub}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export function OperacaoMensal({ items }: { items: ComissaoLancamento[] }) {
  const router = useRouter();
  const mesAtual = mesAtualKey();

  const empresaItems = items.filter((i) => i.beneficiario_tipo === "empresa");
  const grupos = agrupar(empresaItems);

  const grupoAtual = grupos.find((g) => g.mes === mesAtual);
  const gruposPassados = grupos.filter((g) => g.mes < mesAtual);
  const gruposFuturos = grupos.filter((g) => g.mes > mesAtual);

  // KPIs
  const totalPago = empresaItems.filter((i) => i.status === "pago").reduce((s, i) => s + Number(i.valor_bruto || 0), 0);
  const totalPendenteMes = grupoAtual?.pendentes.filter((i) => !isInadimplente(i)).reduce((s, i) => s + Number(i.valor_bruto || 0), 0) ?? 0;
  const emCobranca = empresaItems.filter(isInadimplente);
  const totalCobranca = emCobranca.reduce((s, i) => s + Number(i.valor_bruto || 0), 0);
  const emAtrasoItems = gruposPassados.flatMap((g) => g.pendentes.filter((i) => !isInadimplente(i)));
  const totalAtraso = emAtrasoItems.reduce((s, i) => s + Number(i.valor_bruto || 0), 0);

  if (!empresaItems.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <CircleDollarSign className="h-12 w-12 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground">
          Nenhum lançamento. Configure comissões nas cartas e confirme o cronograma.
        </p>
      </div>
    );
  }

  const onRefresh = () => router.refresh();

  return (
    <div className="space-y-5 p-6">
      {/* KPIs */}
      <KpiStrip
        totalPago={totalPago}
        totalPendenteMes={totalPendenteMes}
        totalCobranca={totalCobranca}
        totalAtraso={totalAtraso}
      />

      {/* Legenda de ações */}
      <div className="flex flex-wrap gap-4 rounded-xl border border-border/25 bg-card/10 px-4 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Dar baixa — empresa recebeu a comissão
        </span>
        <span className="flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5 text-orange-400" /> Marcar cobrança (boleto em atraso)
        </span>
        <span className="flex items-center gap-1.5">
          <CircleSlash className="h-3.5 w-3.5 text-rose-400" /> Não vai receber (só este lançamento)
        </span>
        <span className="flex items-center gap-1.5">
          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" /> Desfazer / Reverter
        </span>
      </div>

      {/* Alertas de cobrança */}
      {emCobranca.length > 0 && (
        <AlertasCobranca items={emCobranca} onRefresh={onRefresh} />
      )}

      {/* Meses em atraso (passados sem baixa) */}
      {emAtrasoItems.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/4 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            {emAtrasoItems.length} lançamento{emAtrasoItems.length !== 1 ? "s" : ""} de meses anteriores sem baixa ·{" "}
            {fmt(totalAtraso)}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Veja os grupos abaixo (Histórico) para dar baixa ou marcar para cobrança.
          </p>
        </div>
      )}

      {/* Mês atual */}
      {grupoAtual ? (
        <GrupoMes grupo={grupoAtual} isAtual={true} onRefresh={onRefresh} />
      ) : (
        <div className="rounded-2xl border border-dashed border-border/30 px-6 py-10 text-center">
          <Zap className="mx-auto mb-3 h-8 w-8 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">Nenhum lançamento previsto para o mês atual.</p>
        </div>
      )}

      {/* Próximos meses */}
      {gruposFuturos.length > 0 && (
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Próximos recebimentos
          </h3>
          {gruposFuturos.map((g) => (
            <GrupoMes key={g.mes} grupo={g} isAtual={false} onRefresh={onRefresh} />
          ))}
        </div>
      )}

      {/* Histórico */}
      {gruposPassados.length > 0 && (
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Histórico
          </h3>
          {gruposPassados.map((g) => (
            <GrupoMes key={g.mes} grupo={g} isAtual={false} onRefresh={onRefresh} />
          ))}
        </div>
      )}

      {items.some((i) => i.beneficiario_tipo === "parceiro") && (
        <p className="px-4 text-center text-xs text-muted-foreground/40">
          Repasses de parceiros são gerenciados na aba <strong>Repasses</strong>.
        </p>
      )}
    </div>
  );
}
