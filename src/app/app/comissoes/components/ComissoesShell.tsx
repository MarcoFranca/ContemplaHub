"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  GitMerge,
  LayoutDashboard,
  List,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComissaoLancamento, ComissaoResumo, ParceiroOption } from "../types";
import { ExecutiveDashboard } from "./ExecutiveDashboard";
import { PipelineFinanceiro } from "./PipelineFinanceiro";
import { LancamentosTable } from "./LancamentosTable";
import { RepassesGestao } from "./RepassesGestao";
import { CronogramaRecebimentos } from "./CronogramaRecebimentos";
import { ComissoesFilters } from "./ComissoesFilters";

type Props = {
  items: ComissaoLancamento[];
  resumo: ComissaoResumo | null;
  parceiros: ParceiroOption[];
  activeTab: string;
  refreshPath: string;
};

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pipeline", label: "Pipeline", icon: GitMerge },
  { id: "lancamentos", label: "Lançamentos", icon: List },
  { id: "repasses", label: "Repasses", icon: Wallet },
  { id: "cronograma", label: "Cronograma", icon: CalendarDays },
] as const;

export function ComissoesShell({ items, resumo, parceiros, activeTab, refreshPath }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [showFilters, setShowFilters] = React.useState(false);

  function switchTab(tab: string) {
    const next = new URLSearchParams(params.toString());
    next.set("tab", tab);
    router.push(`${pathname}?${next.toString()}`);
  }

  const filterKeys = ["parceiro_id", "status", "repasse_status", "competencia_de", "competencia_ate"];
  const activeFilters = Object.fromEntries(
    filterKeys.map((k) => [k, params.get(k)]).filter(([, v]) => Boolean(v))
  );
  const filterCount = Object.keys(activeFilters).length;

  function removeFilter(key: string) {
    const next = new URLSearchParams(params.toString());
    next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  function clearFilters() {
    const next = new URLSearchParams();
    next.set("tab", activeTab);
    router.push(`${pathname}?${next.toString()}`);
  }

  const repasesAlert = resumo && resumo.repasses_pendentes > 0 ? resumo.repasses_pendentes : 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Page header ── */}
      <div className="flex-shrink-0 border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="px-6 pt-5">
          {/* Title row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Comissões & Repasses</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Gestão operacional · {items.length} lançamento{items.length !== 1 ? "s" : ""}
                {filterCount > 0 && (
                  <span className="ml-1.5 text-amber-400">
                    · {filterCount} filtro{filterCount !== 1 ? "s" : ""} ativo{filterCount !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="gap-2 text-xs">
                <Link href="/app/financeiro/pagamentos">
                  <BookOpen className="h-3.5 w-3.5" />
                  Por Contrato
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters((v) => !v)}
                className={`gap-2 text-xs ${
                  showFilters ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : ""
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtros
                {filterCount > 0 && (
                  <span className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black">
                    {filterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Collapsible filters */}
          {showFilters && (
            <div className="mt-3 rounded-xl border border-border/50 bg-card/40 p-4">
              <ComissoesFilters parceiros={parceiros} />
            </div>
          )}

          {/* Active filter pills */}
          {filterCount > 0 && !showFilters && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Filtros ativos:</span>
              {Object.entries(activeFilters).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300"
                >
                  {filterLabel(key, value as string)}
                  <button
                    onClick={() => removeFilter(key)}
                    className="ml-0.5 rounded-full hover:text-white transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearFilters}
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                limpar tudo
              </button>
            </div>
          )}

          {/* Tab nav */}
          <div className="mt-4 flex">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => switchTab(id)}
                  className={`
                    inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "border-emerald-500 text-emerald-400"
                        : "border-transparent text-muted-foreground hover:border-border/50 hover:text-foreground"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {id === "repasses" && repasesAlert > 0 && (
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400">
                      {repasesAlert}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "dashboard" && <ExecutiveDashboard items={items} resumo={resumo} />}
        {activeTab === "pipeline" && <PipelineFinanceiro items={items} refreshPath={refreshPath} />}
        {activeTab === "lancamentos" && (
          <div className="p-6">
            <LancamentosTable items={items} refreshPath={refreshPath} title="Todos os lançamentos" />
          </div>
        )}
        {activeTab === "repasses" && <RepassesGestao items={items} refreshPath={refreshPath} />}
        {activeTab === "cronograma" && <CronogramaRecebimentos items={items} />}
      </div>
    </div>
  );
}

function filterLabel(key: string, value: string): string {
  const map: Record<string, (v: string) => string> = {
    status: (v) => `Status: ${labelStatus(v)}`,
    repasse_status: (v) => `Repasse: ${labelRepasse(v)}`,
    parceiro_id: () => "Parceiro filtrado",
    competencia_de: (v) => `De: ${fmtDate(v)}`,
    competencia_ate: (v) => `Até: ${fmtDate(v)}`,
  };
  return map[key]?.(value) ?? `${key}: ${value}`;
}

function labelStatus(s: string) {
  return { previsto: "Previsto", disponivel: "Disponível", pago: "Pago", cancelado: "Cancelado" }[s] ?? s;
}

function labelRepasse(s: string) {
  return { pendente: "Pendente", pago: "Pago", cancelado: "Cancelado", nao_aplicavel: "N/A" }[s] ?? s;
}

function fmtDate(v: string) {
  try {
    return new Date(v + "T12:00:00").toLocaleDateString("pt-BR");
  } catch {
    return v;
  }
}
