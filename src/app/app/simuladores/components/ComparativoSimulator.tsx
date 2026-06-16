"use client";

import * as React from "react";
import {
    Bar,
    BarChart,
    Cell,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/form/MoneyInput";
import { parseMoneyBRCents } from "@/lib/masks";
import { FileDown, Landmark, Layers, Scale, TrendingDown } from "lucide-react";

import { PRODUTOS, type ProdutoSimulador, type TipoContratacao } from "../lib/consorcio";
import { pctStrFromFactor } from "../lib/format";
import { anualParaMensal, type SistemaAmortizacao } from "../lib/financiamento";
import { calcularComparativo, type ComparativoInput } from "../lib/comparativo";
import { brl, pct } from "../lib/format";
import { abrirComparativoPdf } from "../lib/pdf";

type TaxaUnidade = "am" | "aa";

type FormState = {
    clienteNome: string;
    valorBem: string;
    prazo: string;
    tipoContratacao: TipoContratacao;
    produto: ProdutoSimulador;
    taxaAdmin: string;
    fundoReserva: string;
    reajuste: string;
    prazoFinanciamento: string;
    entrada: string;
    taxa: string;
    taxaUnidade: TaxaUnidade;
    sistema: SistemaAmortizacao;
};

const DEFAULTS: FormState = {
    clienteNome: "",
    valorBem: "300.000,00",
    prazo: "200",
    tipoContratacao: "fisica",
    produto: "imovel",
    taxaAdmin: pctStrFromFactor(PRODUTOS.imovel.defaults.taxaAdmin),
    fundoReserva: pctStrFromFactor(PRODUTOS.imovel.defaults.fundoReserva),
    reajuste: "",
    prazoFinanciamento: "360",
    entrada: "",
    taxa: "10,50",
    taxaUnidade: "aa",
    sistema: "sac",
};

function parsePctStr(s: string): number {
    const n = Number(s.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n / 100 : 0;
}

const tooltipStyle = {
    backgroundColor: "rgb(15 23 42)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    fontSize: 12,
    color: "#e2e8f0",
};

function selectClass() {
    return "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm";
}

export function ComparativoSimulator({ organizacaoNome }: { organizacaoNome?: string }) {
    const [form, setForm] = React.useState<FormState>(DEFAULTS);
    const set = (patch: Partial<FormState>) => setForm((p) => ({ ...p, ...patch }));

    // Ao trocar de produto, repõe as taxas padrão dele (campanha pode ser editada depois).
    const setProduto = (produto: ProdutoSimulador) =>
        setForm((p) => ({
            ...p,
            produto,
            taxaAdmin: pctStrFromFactor(PRODUTOS[produto].defaults.taxaAdmin),
            fundoReserva: pctStrFromFactor(PRODUTOS[produto].defaults.fundoReserva),
        }));

    const input: ComparativoInput = React.useMemo(() => {
        const taxaRaw = parsePctStr(form.taxa);
        const taxaMensal = form.taxaUnidade === "aa" ? anualParaMensal(taxaRaw) : taxaRaw;
        return {
            valorBem: parseMoneyBRCents(form.valorBem) ?? 0,
            prazo: Number(form.prazo) || 0,
            tipoContratacao: form.tipoContratacao,
            produto: form.produto,
            taxaAdmin: parsePctStr(form.taxaAdmin),
            fundoReserva: parsePctStr(form.fundoReserva),
            reajusteAnual: parsePctStr(form.reajuste),
            prazoFinanciamento: Number(form.prazoFinanciamento) || 0,
            entrada: parseMoneyBRCents(form.entrada) ?? 0,
            taxaMensal,
            sistema: form.sistema,
        };
    }, [form]);

    const r = React.useMemo(() => calcularComparativo(input), [input]);
    const ganhouConsorcio = r.economia > 0;

    const chartData = [
        { name: "Consórcio", value: Math.round(r.consorcio.custoTotal), fill: "#10b981" },
        { name: "Financiamento", value: Math.round(r.financiamento.totalPago), fill: "#f59e0b" },
    ];

    return (
        <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                {/* ===== FORM ===== */}
                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Cliente (opcional, sai no PDF)</Label>
                        <Input
                            value={form.clienteNome}
                            onChange={(e) => set({ clienteNome: e.target.value })}
                            placeholder="Nome do cliente"
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Valor do bem / crédito</Label>
                            <MoneyInput value={form.valorBem} onChange={(v) => set({ valorBem: v })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Prazo consórcio (meses)</Label>
                            <Input
                                value={form.prazo}
                                inputMode="numeric"
                                onChange={(e) => set({ prazo: e.target.value.replace(/\D/g, "") })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Contratação</Label>
                            <select
                                value={form.tipoContratacao}
                                onChange={(e) => set({ tipoContratacao: e.target.value as TipoContratacao })}
                                className={selectClass()}
                            >
                                <option value="fisica">Pessoa Física</option>
                                <option value="juridica">Pessoa Jurídica</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Produto (consórcio)</Label>
                            <select
                                value={form.produto}
                                onChange={(e) => setProduto(e.target.value as ProdutoSimulador)}
                                className={selectClass()}
                            >
                                {(Object.keys(PRODUTOS) as ProdutoSimulador[]).map((p) => (
                                    <option key={p} value={p}>
                                        {PRODUTOS[p].label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Layers className="h-3.5 w-3.5" />
                            Consórcio
                        </p>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Taxa de adm.</Label>
                                <div className="relative">
                                    <Input
                                        value={form.taxaAdmin}
                                        inputMode="decimal"
                                        onChange={(e) => set({ taxaAdmin: e.target.value.replace(/[^\d,]/g, "") })}
                                        className="pr-7"
                                        placeholder="0,00"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Fundo reserva</Label>
                                <div className="relative">
                                    <Input
                                        value={form.fundoReserva}
                                        inputMode="decimal"
                                        onChange={(e) => set({ fundoReserva: e.target.value.replace(/[^\d,]/g, "") })}
                                        className="pr-7"
                                        placeholder="0,00"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Reajuste a.a. (opc.)</Label>
                                <div className="relative">
                                    <Input
                                        value={form.reajuste}
                                        inputMode="decimal"
                                        onChange={(e) => set({ reajuste: e.target.value.replace(/[^\d,]/g, "") })}
                                        className="pr-7"
                                        placeholder="0,00"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Ajuste a taxa de adm. conforme a campanha. O reajuste anual é só projeção do valor do bem (contexto).
                        </p>
                    </div>

                    <div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Landmark className="h-3.5 w-3.5" />
                            Financiamento
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Prazo financiamento (meses)</Label>
                                <Input
                                    value={form.prazoFinanciamento}
                                    inputMode="numeric"
                                    onChange={(e) => set({ prazoFinanciamento: e.target.value.replace(/\D/g, "") })}
                                    placeholder="360"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Entrada</Label>
                                <MoneyInput value={form.entrada} onChange={(v) => set({ entrada: v })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Sistema</Label>
                                <select
                                    value={form.sistema}
                                    onChange={(e) => set({ sistema: e.target.value as SistemaAmortizacao })}
                                    className={selectClass()}
                                >
                                    <option value="price">Price (parcela fixa)</option>
                                    <option value="sac">SAC (decrescente)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Taxa de juros</Label>
                                <div className="relative">
                                    <Input
                                        value={form.taxa}
                                        inputMode="decimal"
                                        onChange={(e) => set({ taxa: e.target.value.replace(/[^\d,]/g, "") })}
                                        className="pr-7"
                                        placeholder="0,00"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                        %
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Período da taxa</Label>
                                <select
                                    value={form.taxaUnidade}
                                    onChange={(e) => set({ taxaUnidade: e.target.value as TaxaUnidade })}
                                    className={selectClass()}
                                >
                                    <option value="am">ao mês</option>
                                    <option value="aa">ao ano</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== RESULTADO ===== */}
                <div className="space-y-4">
                    <div
                        className={`rounded-2xl border p-4 ${
                            ganhouConsorcio
                                ? "border-emerald-500/30 bg-emerald-500/5"
                                : "border-amber-500/30 bg-amber-500/5"
                        }`}
                    >
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Scale className="h-3.5 w-3.5" />
                            Conclusão
                        </p>
                        <p className="mt-1 text-sm text-slate-100">
                            {ganhouConsorcio ? (
                                <>
                                    No consórcio você desembolsa{" "}
                                    <span className="font-semibold text-emerald-300">
                                        {brl(Math.abs(r.economia))}
                                    </span>{" "}
                                    a menos ({pct(Math.abs(r.economiaPct))}) ao final do plano.
                                </>
                            ) : (
                                <>
                                    O financiamento sai{" "}
                                    <span className="font-semibold text-amber-300">
                                        {brl(Math.abs(r.economia))}
                                    </span>{" "}
                                    mais barato no total, em troca do acesso imediato ao bem.
                                </>
                            )}
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                            <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                                <Layers className="h-3.5 w-3.5" /> Consórcio
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">Parcela · {form.prazo}x</p>
                            <p className="text-xl font-semibold text-emerald-300">{brl(r.consorcio.parcela)}</p>
                            <p className="mt-2 text-xs text-muted-foreground">Custo total</p>
                            <p className="text-lg font-semibold text-white">{brl(r.consorcio.custoTotal)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                +{pct(r.consorcio.custoExtraPct)} sobre o bem · acesso na contemplação
                            </p>
                        </div>

                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                            <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                                <Landmark className="h-3.5 w-3.5" /> Financiamento
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Parcela {form.sistema === "sac" ? "inicial" : ""} · {form.prazoFinanciamento}x
                            </p>
                            <p className="text-xl font-semibold text-amber-300">
                                {brl(r.financiamento.parcelaInicial)}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">Custo total</p>
                            <p className="text-lg font-semibold text-white">{brl(r.financiamento.totalPago)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Juros {pct(r.financiamento.custoExtraPct)} · acesso imediato
                            </p>
                        </div>
                    </div>

                    {input.reajusteAnual && input.reajusteAnual > 0 ? (
                        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-sm text-slate-100">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Projeção de valorização do bem
                            </p>
                            <p className="mt-1">
                                A {pct(input.reajusteAnual)} a.a., o bem de {brl(input.valorBem)} tende a valer{" "}
                                <span className="font-semibold text-sky-300">{brl(r.valorBemCorrigido)}</span> ao
                                fim de {form.prazo} meses. No consórcio o crédito é reajustado pelo índice e{" "}
                                <span className="font-medium">acompanha essa valorização</span>; no financiamento
                                você trava o preço de hoje (mas paga juros).
                            </p>
                        </div>
                    ) : null}

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <TrendingDown className="h-3.5 w-3.5" />
                            Custo total ao final do plano
                        </p>
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 16, right: 8, bottom: 0, left: -8 }}>
                                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={tooltipStyle}
                                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                                        formatter={(v: number) => [brl(v), "Custo total"]}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={70}>
                                        {chartData.map((d) => (
                                            <Cell key={d.name} fill={d.fill} />
                                        ))}
                                        <LabelList
                                            dataKey="value"
                                            position="top"
                                            formatter={(v: number) => brl(v)}
                                            style={{ fill: "#e2e8f0", fontSize: 11 }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <Button
                        type="button"
                        onClick={() =>
                            abrirComparativoPdf(input, r, {
                                clienteNome: form.clienteNome.trim() || undefined,
                                organizacaoNome,
                            })
                        }
                        className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        <FileDown className="mr-2 h-4 w-4" />
                        Gerar PDF comparativo
                    </Button>

                    <p className="text-center text-xs text-muted-foreground/70">
                        Consórcio sem juros (taxas de adm. + fundo); financiamento com juros. O consórcio
                        não dá acesso imediato ao bem. Valores de referência.
                    </p>
                </div>
            </div>
        </div>
    );
}
