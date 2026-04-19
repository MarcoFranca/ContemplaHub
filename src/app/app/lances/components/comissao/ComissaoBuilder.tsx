"use client";

import * as React from "react";
import {
  BadgePercent,
  Calculator,
  CircleDollarSign,
  HandCoins,
  Handshake,
  Plus,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { CotaComissaoPayload } from "../../types";
import {
  gerarRegrasProporcionais,
  redistribuirRegrasAutomaticas,
  somarPercentuais,
  atualizarRegraManual,
} from "./comissao-calculator";
import { ParcelasComissaoTable } from "./ParcelasComissaoTable";
import { ComissaoParceiroRow } from "./ComissaoParceiroRow";
import type { ParceiroSelectOption, CotaComissaoParceiro } from "../../types";

type Props = {
  value: CotaComissaoPayload;
  onChange: (next: CotaComissaoPayload) => void;
  parceirosDisponiveis: ParceiroSelectOption[];
  valorBase?: number | null;
};

export function ComissaoBuilder({
  value,
  onChange,
  parceirosDisponiveis,
  valorBase = 0,
}: Props) {
  const [quantidadeParcelas, setQuantidadeParcelas] = React.useState(
    Math.max(value.regras?.length || 1, 1)
  );

  const percentualTotal = Number(value.percentual_total || 0);
  const totalDistribuido = somarPercentuais(value.regras || []);
  const saldo = Number((percentualTotal - totalDistribuido).toFixed(4));
  const valorTotalEstimado = Number(valorBase || 0) * (percentualTotal / 100);
  const totalParceiros = (value.parceiros || []).filter((item) => item.ativo).length;

  const setField = <K extends keyof CotaComissaoPayload>(
    field: K,
    fieldValue: CotaComissaoPayload[K]
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const gerarParcelas = () => {
    const regras = gerarRegrasProporcionais({
      quantidadeParcelas,
      percentualTotal,
      modo: value.modo,
    });

    setField("regras", regras);
  };

  const onPercentualChange = (index: number, percentual: number) => {
    const regras = atualizarRegraManual({
      regras: value.regras,
      regraIndex: index,
      percentual,
      percentualTotal,
    });

    setField("regras", regras);
  };

  const onLiberarAuto = (index: number) => {
    const next = [...value.regras];
    next[index] = { ...next[index], is_manual: false };

    setField(
      "regras",
      redistribuirRegrasAutomaticas({
        regras: next,
        percentualTotal,
      })
    );
  };

  const addParceiro = () => {
    const next: CotaComissaoParceiro = {
      parceiro_id: "",
      percentual_parceiro: 0,
      imposto_retido_pct: value.imposto_padrao_pct ?? 10,
      ativo: true,
      observacoes: "",
    };

    setField("parceiros", [...value.parceiros, next]);
  };

  const podeSalvar = Math.abs(saldo) < 0.0001;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/12 via-emerald-500/5 to-transparent p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Comissão e repasses
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Estruture a comissão com clareza financeira
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Defina o percentual total, distribua em parcelas e vincule parceiros com uma visão mais executiva do repasse.
              </p>
            </div>
          </div>

          <div className="grid min-w-full gap-3 sm:grid-cols-2 xl:min-w-[420px] xl:grid-cols-2">
            <ResumoCard
              icon={BadgePercent}
              label="Comissão total"
              value={`${percentualTotal.toFixed(4)}%`}
            />
            <ResumoCard
              icon={CircleDollarSign}
              label="Valor estimado"
              value={formatMoney(valorTotalEstimado)}
            />
            <ResumoCard
              icon={Calculator}
              label="Distribuído"
              value={`${totalDistribuido.toFixed(4)}%`}
            />
            <ResumoCard
              icon={HandCoins}
              label="Saldo"
              value={`${saldo.toFixed(4)}%`}
              danger={!podeSalvar}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Configuração principal</h4>
              <p className="text-xs text-muted-foreground">
                Ajuste a base da comissão antes de distribuir as parcelas.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FieldShell label="Comissão total %" hint="Percentual bruto sobre a base configurada.">
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
              />
            </FieldShell>

            <FieldShell label="Modo de pagamento" hint="À vista ou distribuído em parcelas.">
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/15"
                value={value.modo}
                onChange={(e) =>
                  setField("modo", e.target.value as CotaComissaoPayload["modo"])
                }
              >
                <option value="avista">À vista</option>
                <option value="parcelado">Parcelado</option>
              </select>
            </FieldShell>

            <FieldShell label="Imposto padrão %" hint="Base inicial aplicada aos parceiros.">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={value.imposto_padrao_pct}
                onChange={(e) =>
                  setField("imposto_padrao_pct", Number(e.target.value || 0))
                }
              />
            </FieldShell>

            <FieldShell label="Quantidade de parcelas" hint="Use para gerar a distribuição automática.">
              <Input
                type="number"
                min={1}
                value={quantidadeParcelas}
                onChange={(e) => setQuantidadeParcelas(Number(e.target.value || 1))}
              />
            </FieldShell>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="border-emerald-500/20 hover:bg-emerald-500/5" onClick={gerarParcelas}>
              <WandSparkles className="mr-2 h-4 w-4 text-emerald-300" />
              Gerar parcelas automaticamente
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300">
              <Handshake className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Leitura rápida</h4>
              <p className="text-xs text-muted-foreground">
                Validação imediata para evitar erro antes de salvar.
              </p>
            </div>
          </div>

          <Alert className={podeSalvar ? "border-emerald-500/20 bg-emerald-500/5 text-foreground" : "border-red-500/30 bg-red-500/5"}>
            <AlertTitle>
              {podeSalvar ? "Distribuição válida" : "Distribuição incompleta"}
            </AlertTitle>
            <AlertDescription>
              {podeSalvar
                ? "A comissão está equilibrada e pronta para seguir para persistência e geração de lançamentos."
                : "Ajuste as parcelas para fechar exatamente o percentual total informado."}
            </AlertDescription>
          </Alert>

          <div className="mt-4 grid gap-3">
            <MiniInfo label="Base de cálculo" value={value.base_calculo === "valor_carta" ? "Valor da carta" : value.base_calculo} />
            <MiniInfo label="Parcelas criadas" value={`${value.regras?.length || 0}`} />
            <MiniInfo label="Parceiros ativos" value={`${totalParceiros}`} />
            <MiniInfo label="Valor base" value={formatMoney(Number(valorBase || 0))} />
          </div>
        </section>
      </div>

      <ParcelasComissaoTable
        regras={value.regras}
        valorBase={Number(valorBase || 0)}
        onPercentualChange={onPercentualChange}
        onLiberarAuto={onLiberarAuto}
      />

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300">
              <Handshake className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Parceiros vinculados</h4>
              <p className="text-sm text-muted-foreground">
                O repasse do parceiro é aplicado de forma proporcional ao cronograma da comissão.
              </p>
            </div>
          </div>

          <Button type="button" variant="outline" className="border-emerald-500/20 hover:bg-emerald-500/5" onClick={addParceiro}>
            <Plus className="mr-2 h-4 w-4 text-emerald-300" />
            Adicionar parceiro
          </Button>
        </div>

        <div className="space-y-3">
          {value.parceiros.map((item, index) => (
            <ComissaoParceiroRow
              key={`${item.parceiro_id || "novo"}-${index}`}
              item={item}
              parceiros={parceirosDisponiveis}
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

          {!value.parceiros.length ? (
            <div className="rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhum parceiro vinculado ainda. Adicione apenas quando houver repasse nesta negociação.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ResumoCard({
  icon: Icon,
  label,
  value,
  danger = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border px-4 py-3 shadow-sm backdrop-blur-sm",
        danger
          ? "border-red-500/25 bg-red-500/8"
          : "border-emerald-500/15 bg-background/80",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className={danger ? "h-3.5 w-3.5 text-red-300" : "h-3.5 w-3.5 text-emerald-300"} />
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

function FieldShell({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </label>
      {children}
      <p className="text-[11px] leading-5 text-muted-foreground">{hint}</p>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/70 px-3 py-2.5">
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}
