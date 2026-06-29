"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  History,
  Loader2,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepasseDialog } from "./RepasseDialog";
import { PagarParceiroDialog } from "./PagarParceiroDialog";
import { HistoricoLotesDialog } from "./HistoricoLotesDialog";
import { marcarRepassesPagosLoteAction } from "../actions";
import type { ComissaoLancamento } from "../types";

type Props = {
  items: ComissaoLancamento[];
  refreshPath: string;
};

const EVENTO_LABELS: Record<string, string> = {
  adesao: "Adesão",
  primeira_cobranca_valida: "1ª Cobrança",
  proxima_cobranca: "Próx. Cobrança",
  contemplacao: "Contemplação",
  manual: "Manual",
};

const money = (v: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

const nowYM = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
})();

/** Mês de referência do repasse: usa a previsão de repasse, senão a competência. */
function dueYM(item: ComissaoLancamento): string {
  const ref = item.repasse_previsto_em || item.competencia_prevista || "";
  return ref.slice(0, 7);
}

type Bucket = "atraso" | "mes" | "futuro";
function bucketOf(item: ComissaoLancamento): Bucket {
  const ym = dueYM(item);
  if (!ym || ym > nowYM) return "futuro";
  if (ym < nowYM) return "atraso";
  return "mes";
}

const dataLabel = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : null);

const ymLabel = (ym: string) => {
  if (!ym) return "Sem competência";
  const [y, m] = ym.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(y, m - 1, 1));
};

/** Agrupa lançamentos por mês de repasse (asc), com subtotal e ids do mês. */
function groupByMonth(items: ComissaoLancamento[]) {
  const map = new Map<string, ComissaoLancamento[]>();
  for (const it of items) {
    const ym = dueYM(it);
    (map.get(ym) ?? (map.set(ym, []), map.get(ym)!)).push(it);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([ym, list]) => ({
      ym,
      label: ymLabel(ym),
      total: list.reduce((s, i) => s + Number(i.valor_liquido || 0), 0),
      ids: list.map((i) => i.id),
      items: list,
    }));
}

type Tab = "agora" | "futuros" | "pagos";

export function RepassesGestao({ items, refreshPath }: Props) {
  const [tab, setTab] = React.useState<Tab>("agora");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const [pending, startTransition] = React.useTransition();

  const isCollapsed = (key: string) => collapsed.has(key);
  const toggleCollapse = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const parc = items.filter((i) => i.beneficiario_tipo === "parceiro");

  const pendentes = parc.filter((i) => i.repasse_status === "pendente");
  const pagos = parc.filter((i) => i.repasse_status === "pago");

  const atraso = pendentes.filter((i) => bucketOf(i) === "atraso");
  const mes = pendentes.filter((i) => bucketOf(i) === "mes");
  const futuro = pendentes.filter((i) => bucketOf(i) === "futuro");

  const sum = (arr: ComissaoLancamento[]) => arr.reduce((s, i) => s + Number(i.valor_liquido || 0), 0);

  // Itens da aba ativa
  const visible = tab === "agora" ? [...atraso, ...mes] : tab === "futuros" ? futuro : pagos;
  const selectable = tab !== "pagos";

  // Agrupa por parceiro dentro da aba
  const gruposMap = new Map<string, { nome: string; items: ComissaoLancamento[] }>();
  for (const it of visible) {
    const pid = it.parceiro_id ?? "—";
    const g = gruposMap.get(pid) ?? { nome: it.parceiros_corretores?.nome ?? "Parceiro", items: [] };
    g.items.push(it);
    gruposMap.set(pid, g);
  }
  const grupos = [...gruposMap.entries()].sort((a, b) => sum(b[1].items) - sum(a[1].items));

  const selectedItems = visible.filter((i) => selected.has(i.id));
  const selectedTotal = sum(selectedItems);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleMany = (ids: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const baixarLote = (ids: string[]) => {
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await marcarRepassesPagosLoteAction(ids, refreshPath);
      if (res.falhas > 0) {
        toast.error(`${res.count} baixado(s), ${res.falhas} falharam.`);
      } else {
        toast.success(`${res.count} repasse(s) baixado(s).`);
      }
      setSelected(new Set());
    });
  };

  const renderRow = (item: ComissaoLancamento) => {
    const b = item.repasse_status === "pago" ? "pago" : bucketOf(item);
    const accent =
      b === "atraso"
        ? "border-l-rose-500"
        : b === "mes"
          ? "border-l-amber-500"
          : b === "pago"
            ? "border-l-emerald-500"
            : "border-l-sky-500/60";
    return (
      <div
        key={item.id}
        className={`flex items-center gap-3 border-l-2 ${accent} px-4 py-3 transition-colors hover:bg-white/2`}
      >
        {selectable && (
          <input
            type="checkbox"
            checked={selected.has(item.id)}
            onChange={() => toggle(item.id)}
            className="h-4 w-4 shrink-0 accent-emerald-500"
          />
        )}
        <div className="min-w-0 flex-1">
          <Link
            href={`/app/contratos/${item.contrato_id}`}
            className="group flex items-center gap-2 hover:underline"
          >
            <span className="truncate text-sm font-medium group-hover:text-emerald-300">
              {item.cliente_nome ?? "Cliente sem nome"}
            </span>
            {item.grupo_codigo && (
              <span className="text-xs text-muted-foreground">· Grupo {item.grupo_codigo}</span>
            )}
            {item.numero_cota && (
              <span className="text-xs text-muted-foreground">· Cota {item.numero_cota}</span>
            )}
            <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
          </Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span>{EVENTO_LABELS[item.tipo_evento] ?? item.tipo_evento} · Parc. {item.ordem}</span>
            {b === "atraso" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-1.5 text-[10px] font-medium text-rose-300">
                <AlertTriangle className="h-3 w-3" /> Vencido
              </span>
            )}
            {item.repasse_pago_em && (
              <span className="text-emerald-400/80">· Pago {dataLabel(item.repasse_pago_em)}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold tabular-nums">{money(item.valor_liquido)}</div>
          <div className="text-[10px] text-muted-foreground">líquido</div>
        </div>
        {item.repasse_status === "pendente" ? (
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
            onClick={() => baixarLote([item.id])}
            disabled={pending}
            title="Dar baixa neste repasse"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Pago
          </span>
        )}
        <RepasseDialog lancamento={item} refreshPath={refreshPath} />
      </div>
    );
  };

  const TABS: { key: Tab; label: string; count: number; icon: typeof Clock; cls: string }[] = [
    { key: "agora", label: "A pagar agora", count: atraso.length + mes.length, icon: Clock, cls: "text-amber-300" },
    { key: "futuros", label: "A vencer (futuro)", count: futuro.length, icon: CalendarClock, cls: "text-sky-300" },
    { key: "pagos", label: "Pagos", count: pagos.length, icon: CheckCircle2, cls: "text-emerald-300" },
  ];

  return (
    <div className="space-y-5 p-6">
      {/* KPIs por urgência */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={AlertTriangle}
          label="Em atraso"
          value={money(sum(atraso))}
          hint={`${atraso.length} repasse(s) vencido(s)`}
          tone="rose"
        />
        <Kpi
          icon={Clock}
          label="Vence neste mês"
          value={money(sum(mes))}
          hint={`${mes.length} a pagar este mês`}
          tone="amber"
        />
        <Kpi
          icon={CheckCircle2}
          label="Pago"
          value={money(sum(pagos))}
          hint={`${pagos.length} liquidado(s)`}
          tone="emerald"
        />
        <Kpi
          icon={CalendarClock}
          label="A vencer (futuro)"
          value={money(sum(futuro))}
          hint={`${futuro.length} provisionado(s)`}
          tone="slate"
        />
      </div>

      {/* Abas de foco */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setSelected(new Set());
              }}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-emerald-500/40 bg-emerald-500/10 text-white"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? t.cls : ""}`} />
              {t.label}
              <span className="rounded-full bg-white/10 px-1.5 text-xs">{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Barra de baixa em lote */}
      {selectable && selectedItems.length > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 backdrop-blur">
          <span className="text-sm">
            <strong>{selectedItems.length}</strong> selecionado(s) ·{" "}
            <strong className="tabular-nums">{money(selectedTotal)}</strong>
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())} disabled={pending}>
              Limpar
            </Button>
            <Button
              size="sm"
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              onClick={() => baixarLote([...selected])}
              disabled={pending}
            >
              {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
              Dar baixa em lote ({selectedItems.length})
            </Button>
          </div>
        </div>
      )}

      {/* Lista agrupada por parceiro */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 py-16">
          <Wallet className="mb-3 h-10 w-10 text-muted-foreground/25" />
          <p className="text-sm text-muted-foreground">
            {tab === "agora"
              ? "Nenhum repasse a pagar agora. Tudo em dia! 🎉"
              : tab === "futuros"
                ? "Nenhum repasse futuro provisionado."
                : "Nenhum repasse pago no período."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {grupos.map(([pid, g]) => {
            const ids = g.items.map((i) => i.id);
            const allSel = selectable && ids.every((id) => selected.has(id));
            return (
              <div key={pid} className="overflow-hidden rounded-2xl border border-border/35 bg-card/15">
                <div className="flex items-center justify-between gap-3 border-b border-border/25 bg-card/25 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleCollapse(pid)}
                      className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                      title={isCollapsed(pid) ? "Expandir" : "Minimizar"}
                    >
                      {isCollapsed(pid) ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {selectable && (
                      <input
                        type="checkbox"
                        checked={allSel}
                        onChange={(e) => toggleMany(ids, e.target.checked)}
                        className="h-4 w-4 accent-emerald-500"
                        title="Selecionar todos deste parceiro"
                      />
                    )}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      {pid !== "—" ? (
                        <Link
                          href={`/app/parceiros/${pid}`}
                          className="truncate text-sm font-semibold hover:text-emerald-300 hover:underline"
                          title="Ver detalhes do parceiro"
                        >
                          {g.nome}
                        </Link>
                      ) : (
                        <div className="truncate text-sm font-semibold">{g.nome}</div>
                      )}
                      <div className="text-xs text-muted-foreground">{g.items.length} repasse(s)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Total {tab === "pagos" ? "pago" : "a pagar"}</div>
                      <div className="text-sm font-bold tabular-nums">{money(sum(g.items))}</div>
                    </div>
                    <HistoricoLotesDialog
                      parceiroId={pid}
                      nome={g.nome}
                      trigger={
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 border-white/10" title="Histórico de repasses">
                          <History className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Histórico</span>
                        </Button>
                      }
                    />
                    {selectable && g.items.some((i) => i.repasse_status === "pendente") && (
                      <PagarParceiroDialog
                        parceiroId={pid}
                        nome={g.nome}
                        items={g.items.filter((i) => i.repasse_status === "pendente")}
                        refreshPath={refreshPath}
                        trigger={
                          <Button size="sm" className="h-8 bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                            <Banknote className="mr-1.5 h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Pagar tudo</span>
                            <span className="sm:hidden">Pagar</span>
                          </Button>
                        }
                      />
                    )}
                  </div>
                </div>

                {!isCollapsed(pid) && (
                <div>
                  {groupByMonth(g.items).map((mg) => {
                    const allSelMonth = selectable && mg.ids.every((id) => selected.has(id));
                    const mKey = `${pid}:${mg.ym}`;
                    const mClosed = isCollapsed(mKey);
                    return (
                      <div key={mg.ym}>
                        {/* Subtotal do mês — "quanto repassar neste mês" */}
                        <div className="flex items-center justify-between gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-1.5">
                          <span className="inline-flex min-w-0 items-center gap-2 text-xs font-medium capitalize text-muted-foreground">
                            {selectable && (
                              <input
                                type="checkbox"
                                checked={allSelMonth}
                                onChange={(e) => toggleMany(mg.ids, e.target.checked)}
                                className="h-3.5 w-3.5 accent-emerald-500"
                                title="Selecionar todo o mês"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => toggleCollapse(mKey)}
                              className="inline-flex items-center gap-1.5 hover:text-foreground"
                            >
                              {mClosed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              <CalendarClock className="h-3.5 w-3.5" />
                              {mg.label}
                            </button>
                          </span>
                          <span className="text-sm font-bold tabular-nums">
                            {money(mg.total)}
                            <span className="ml-1 text-[11px] font-normal text-muted-foreground">· {mg.items.length}</span>
                          </span>
                        </div>
                        {!mClosed && <div className="divide-y divide-border/20">{mg.items.map(renderRow)}</div>}
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  hint: string;
  tone: "rose" | "amber" | "emerald" | "slate";
}) {
  const tones: Record<string, string> = {
    rose: "border-rose-500/25 bg-rose-500/5 text-rose-400",
    amber: "border-amber-500/25 bg-amber-500/5 text-amber-400",
    emerald: "border-emerald-500/25 bg-emerald-500/5 text-emerald-400",
    slate: "border-border/40 bg-card/20 text-muted-foreground",
  };
  const valueTone: Record<string, string> = {
    rose: "text-rose-300",
    amber: "text-amber-300",
    emerald: "text-emerald-300",
    slate: "text-foreground",
  };
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-2xl font-bold tabular-nums ${valueTone[tone]}`}>{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
