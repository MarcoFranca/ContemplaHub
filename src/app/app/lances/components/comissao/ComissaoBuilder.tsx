"use client";

import * as React from "react";
import {
  BadgePercent,
  Building2,
  Calculator,
  CircleDollarSign,
  Handshake,
  Info,
  Plus,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CotaComissaoPayload, CotaComissaoParceiro, ParceiroSelectOption } from "../../types";
import {
  gerarRegrasProporcionais,
  redistribuirRegrasAutomaticas,
  somarPercentuais,
  atualizarRegraManual,
} from "./comissao-calculator";
import { ParcelasComissaoTable } from "./ParcelasComissaoTable";
import { ComissaoParceiroRow } from "./ComissaoParceiroRow";

type Props = {
  value: CotaComissaoPayload;
  onChange: (next: CotaComissaoPayload) => void;
  parceirosDisponiveis: ParceiroSelectOption[];
  valorBase?: number | null;
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export function ComissaoBuilder({ value, onChange, parceirosDisponiveis, valorBase = 0 }: Props) {
  const [quantidadeParcelas, setQuantidadeParcelas] = React.useState(
    Math.max(value.regras?.length || 1, 1)
  );

  const base = Number(valorBase || 0);
  const pctTotal = Number(value.percentual_total || 0);
  const totalDistribuido = somarPercentuais(value.regras || []);
  const saldo = Number((pctTotal - totalDistribuido).toFixed(4));
  const podeSalvar = Math.abs(saldo) < 0.0001;
  const progressPct = pctTotal > 0 ? Math.min((totalDistribuido / pctTotal) * 100, 100) : 0;
  const valorTotalComissao = base * (pctTotal / 100);

  const totalPctParceiros = (value.parceiros || [])
    .filter((p) => p.ativo)
    .reduce((s, p) => s + Number(p.percentual_parceiro || 0), 0);
  const pctEmpresa = Math.max(pctTotal - totalPctParceiros, 0);
  const valorEmpresa = base * (pctEmpresa / 100);
  const valorParceiros = base * (totalPctParceiros / 100);

  const setField = <K extends keyof CotaComissaoPayload>(
    field: K,
    fieldValue: CotaComissaoPayload[K]
  ) => onChange({ ...value, [field]: fieldValue });

  const gerarParcelas = () => {
    setField(
      "regras",
      gerarRegrasProporcionais({ quantidadeParcelas, percentualTotal: pctTotal, modo: value.modo })
    );
  };

  const onPercentualChange = (index: number, percentual: number) => {
    setField(
      "regras",
      atualizarRegraManual({ regras: value.regras, regraIndex: index, percentual, percentualTotal: pctTotal })
    );
  };

  const onLiberarAuto = (index: number) => {
    const next = [...value.regras];
    next[index] = { ...next[index], is_manual: false };
    setField("regras", redistribuirRegrasAutomaticas({ regras: next, percentualTotal: pctTotal }));
  };

  const addParceiro = () => {
    const novo: CotaComissaoParceiro = {
      parceiro_id: "",
      percentual_parceiro: 0,
      imposto_retido_pct: value.imposto_padrao_pct ?? 10,
      ativo: true,
      observacoes: "",
    };
    setField("parceiros", [...value.parceiros, novo]);
  };

  return (
    <div className="space-y-4">
      {/* ── Resumo financeiro ── */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">
          <CircleDollarSign className="h-3.5 w-3.5" />
          Comissão da carta
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {base > 0 && pctTotal > 0 ? fmt(valorTotalComissao) : "—"}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {pctTotal > 0
                ? `${pctTotal.toFixed(4)}% sobre ${base > 0 ? fmt(base) : "valor não informado"}`
                : "Informe o percentual de comissão abaixo"}
            </div>
          </div>

          {base > 0 && pctTotal > 0 && (
            <div className="flex items-center gap-5">
              <div className="text-right">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Empresa
                </div>
                <div className="text-lg font-bold text-sky-300">{fmt(valorEmpresa)}</div>
                <div className="text-xs text-muted-foreground">{pctEmpresa.toFixed(2)}%</div>
              </div>
              {totalPctParceiros > 0 && (
                <div className="text-right">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Parceiros
                  </div>
                  <div className="text-lg font-bold text-emerald-300">{fmt(valorParceiros)}</div>
                  <div className="text-xs text-muted-foreground">{totalPctParceiros.toFixed(2)}%</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Bloco 1: Base financeira ── */}
      <SectionBlock number={1} title="Base financeira" icon={<BadgePercent className="h-4 w-4" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <FieldLabel>Comissão total (%)</FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.0001"
                min={0}
                value={value.percentual_total}
                onChange={(e) => {
                  const nextTotal = Number(e.target.value || 0);
                  const next = { ...value, percentual_total: nextTotal };
                  if (next.regras?.length) {
                    next.regras = redistribuirRegrasAutomaticas({
                      regras: next.regras,
                      percentualTotal: nextTotal,
                    });
                  }
                  onChange(next);
                }}
                className="flex-1"
              />
              {base > 0 && pctTotal > 0 && (
                <span className="flex-shrink-0 text-sm font-semibold text-emerald-300">
                  = {fmt(valorTotalComissao)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <FieldLabel>Imposto padrão dos parceiros (%)</FieldLabel>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={value.imposto_padrao_pct}
              onChange={(e) => setField("imposto_padrao_pct", Number(e.target.value || 0))}
            />
          </div>
        </div>
      </SectionBlock>

      {/* ── Bloco 2: Estrutura de recebimento ── */}
      <SectionBlock
        number={2}
        title="Estrutura de recebimento"
        icon={<Calculator className="h-4 w-4" />}
      >
        <div className="space-y-4">
          {/* Segmented control: À vista / Parcelado */}
          <div className="space-y-1.5">
            <FieldLabel>Modo de recebimento</FieldLabel>
            <div className="inline-flex rounded-xl border border-border/40 bg-card/40 p-0.5">
              {(["avista", "parcelado"] as const).map((modo) => (
                <button
                  key={modo}
                  type="button"
                  onClick={() => setField("modo", modo)}
                  className={`
                    rounded-lg px-5 py-2 text-sm font-medium transition-all
                    ${value.modo === modo
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  {modo === "avista" ? "À vista" : "Parcelado"}
                </button>
              ))}
            </div>
          </div>

          {value.modo === "avista" ? (
            <div className="flex items-center gap-2 rounded-xl border border-border/35 bg-card/20 px-4 py-3 text-sm text-muted-foreground">
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>
                Pagamento único no evento de <strong className="text-foreground">adesão</strong>.
                {base > 0 && pctTotal > 0 && (
                  <>
                    {" "}Valor:{" "}
                    <strong className="text-emerald-300">{fmt(valorTotalComissao)}</strong>
                  </>
                )}
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <FieldLabel>Número de parcelas</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={quantidadeParcelas}
                  onChange={(e) => setQuantidadeParcelas(Number(e.target.value || 1))}
                  className="w-28"
                />
              </div>
              {base > 0 && pctTotal > 0 && quantidadeParcelas > 0 && (
                <div className="pb-2.5 text-sm text-muted-foreground">
                  ≈ <strong className="text-foreground">{fmt(valorTotalComissao / quantidadeParcelas)}</strong> / parcela
                </div>
              )}
              <div className="pb-0.5">
                <Button
                  type="button"
                  variant="outline"
                  className="border-emerald-500/20 hover:bg-emerald-500/5"
                  onClick={gerarParcelas}
                >
                  <WandSparkles className="mr-2 h-4 w-4 text-emerald-300" />
                  Gerar automaticamente
                </Button>
              </div>
            </div>
          )}
        </div>
      </SectionBlock>

      {/* ── Bloco 3: Cronograma ── */}
      <SectionBlock number={3} title="Cronograma de parcelas" icon={<Calculator className="h-4 w-4" />}>
        {/* Barra de validação */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Distribuição de percentuais</span>
            <span className={`font-semibold ${podeSalvar ? "text-emerald-400" : "text-amber-400"}`}>
              {totalDistribuido.toFixed(4)}% de {pctTotal.toFixed(4)}%
              {!podeSalvar && saldo !== 0 && (
                <span className="ml-1.5 text-amber-400/80">
                  — {saldo > 0 ? `faltam ${saldo.toFixed(4)}%` : `excesso de ${Math.abs(saldo).toFixed(4)}%`}
                </span>
              )}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/6">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                podeSalvar ? "bg-emerald-500/70" : "bg-amber-500/60"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {podeSalvar && (
            <p className="mt-1 text-xs text-emerald-400">✓ Distribuição balanceada e pronta para salvar</p>
          )}
        </div>

        <ParcelasComissaoTable
          regras={value.regras}
          valorBase={base}
          onPercentualChange={onPercentualChange}
          onLiberarAuto={onLiberarAuto}
        />
      </SectionBlock>

      {/* ── Bloco 4: Parceiros ── */}
      <SectionBlock number={4} title="Parceiros" icon={<Handshake className="h-4 w-4" />}>
        {/* Visualização da divisão */}
        {base > 0 && pctTotal > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Divisão da comissão</span>
              <span>{fmt(valorTotalComissao)} total</span>
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full bg-sky-500/55 transition-all duration-300"
                style={{
                  width: `${pctTotal > 0 ? (pctEmpresa / pctTotal) * 100 : 100}%`,
                }}
              />
              <div
                className="h-full bg-emerald-500/55 transition-all duration-300"
                style={{
                  width: `${pctTotal > 0 ? (totalPctParceiros / pctTotal) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-sky-400" />
                <span className="text-muted-foreground">Empresa</span>
                <strong className="text-sky-300">{fmt(valorEmpresa)}</strong>
                <span className="text-muted-foreground">({pctEmpresa.toFixed(2)}%)</span>
              </span>
              {totalPctParceiros > 0 && (
                <span className="flex items-center gap-1.5">
                  <Handshake className="h-3 w-3 text-emerald-400" />
                  <span className="text-muted-foreground">Parceiros</span>
                  <strong className="text-emerald-300">{fmt(valorParceiros)}</strong>
                  <span className="text-muted-foreground">({totalPctParceiros.toFixed(2)}%)</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Linhas de parceiros */}
        <div className="space-y-3">
          {value.parceiros.map((item, index) => (
            <ComissaoParceiroRow
              key={`${item.parceiro_id || "novo"}-${index}`}
              item={item}
              parceiros={parceirosDisponiveis}
              valorBase={base}
              onChange={(patch) => {
                const next = [...value.parceiros];
                next[index] = { ...next[index], ...patch };
                setField("parceiros", next);
              }}
              onRemove={() =>
                setField(
                  "parceiros",
                  value.parceiros.filter((_, i) => i !== index)
                )
              }
            />
          ))}

          {!value.parceiros.length && (
            <div className="rounded-xl border border-dashed border-border/35 bg-card/15 px-4 py-5 text-center text-sm text-muted-foreground">
              Nenhum parceiro vinculado. Adicione apenas quando houver repasse nesta negociação.
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 border-emerald-500/20 hover:bg-emerald-500/5"
          onClick={addParceiro}
        >
          <Plus className="mr-2 h-3.5 w-3.5 text-emerald-300" />
          Adicionar parceiro
        </Button>
      </SectionBlock>
    </div>
  );
}

function SectionBlock({
  number,
  title,
  icon,
  children,
}: {
  number: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/20 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-400">
          {number}
        </div>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <span className="text-emerald-400">{icon}</span>
          {title}
        </div>
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </label>
  );
}
