"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/form/MoneyInput";
import { parseMoneyBRCents } from "@/lib/masks";
import {
    Building2,
    Car,
    FileDown,
    Percent,
    Settings2,
    Truck,
    TrendingDown,
    Wallet,
    Trophy,
    AlertTriangle,
} from "lucide-react";

import {
    PRODUTOS,
    calcularConsorcio,
    type ProdutoSimulador,
    type RedutorModo,
    type SimuladorInput,
    type TipoContratacao,
} from "../lib/consorcio";
import { brl, pct, meses } from "../lib/format";
import { abrirSimulacaoPdf } from "../lib/pdf";

type FormState = {
    clienteNome: string;
    creditoContratado: string;
    tipoContratacao: TipoContratacao;
    prazoTotal: string;
    redutor: string; // percent string ("25") ou "campanha"
    recursoProprio: string;
    fgts: string;
    lanceEmbutido: string;
    contemplacaoParcela: string;
    lancePercentualDesejado: string;
    taxaAdesao: string;
    taxaAdmin: string;
    fundoReserva: string;
    seguro: string;
};

const PRODUTO_ICON: Record<ProdutoSimulador, React.ComponentType<{ className?: string }>> = {
    imovel: Building2,
    auto: Car,
    pesados: Truck,
};

function moneyStr(n: number) {
    if (!n) return "";
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
}

function pctStr(factor: number) {
    return String(Number((factor * 100).toFixed(4))).replace(".", ",");
}

function parsePctStr(s: string): number {
    const n = Number(s.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n / 100 : 0;
}

function buildDefaultForm(produto: ProdutoSimulador): FormState {
    const d = PRODUTOS[produto].defaults;
    return {
        clienteNome: "",
        creditoContratado: moneyStr(d.creditoContratado),
        tipoContratacao: "fisica",
        prazoTotal: String(d.prazoTotal),
        redutor: d.redutor === "campanha" ? "campanha" : pctStr(d.redutor),
        recursoProprio: "",
        fgts: "",
        lanceEmbutido: "",
        contemplacaoParcela: "1",
        lancePercentualDesejado: "40",
        taxaAdesao: pctStr(d.taxaAdesao),
        taxaAdmin: pctStr(d.taxaAdmin),
        fundoReserva: pctStr(d.fundoReserva),
        seguro: pctStr(d.seguro),
    };
}

function formToInput(produto: ProdutoSimulador, f: FormState): SimuladorInput {
    const redutor: RedutorModo = f.redutor === "campanha" ? "campanha" : parsePctStr(f.redutor);
    return {
        produto,
        creditoContratado: parseMoneyBRCents(f.creditoContratado) ?? 0,
        tipoContratacao: f.tipoContratacao,
        prazoTotal: Number(f.prazoTotal) || 0,
        redutor,
        recursoProprio: parseMoneyBRCents(f.recursoProprio) ?? 0,
        fgts: parseMoneyBRCents(f.fgts) ?? 0,
        lanceEmbutido: parseMoneyBRCents(f.lanceEmbutido) ?? 0,
        contemplacaoParcela: Number(f.contemplacaoParcela) || 0,
        lancePercentualDesejado: parsePctStr(f.lancePercentualDesejado),
        taxaAdesao: parsePctStr(f.taxaAdesao),
        taxaAdmin: parsePctStr(f.taxaAdmin),
        fundoReserva: parsePctStr(f.fundoReserva),
        seguro: parsePctStr(f.seguro),
    };
}

const REDUTOR_OPCOES = [
    { value: "0", label: "Sem redutor" },
    { value: "20", label: "20%" },
    { value: "25", label: "25%" },
    { value: "30", label: "30%" },
    { value: "40", label: "40%" },
    { value: "50", label: "50%" },
    { value: "campanha", label: "Campanha Parcela Original" },
];

function PctField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <div className="relative">
                <Input
                    value={value}
                    inputMode="decimal"
                    onChange={(e) => onChange(e.target.value.replace(/[^\d,]/g, ""))}
                    className="pr-7"
                    placeholder="0,00"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                </span>
            </div>
        </div>
    );
}

function ResultRow({
    label,
    value,
    strong,
    hint,
}: {
    label: string;
    value: string;
    strong?: boolean;
    hint?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-white/5 py-1.5 last:border-0">
            <span className="text-sm text-muted-foreground">
                {label}
                {hint ? <span className="ml-1 text-xs text-muted-foreground/70">{hint}</span> : null}
            </span>
            <span className={strong ? "text-sm font-semibold text-white" : "text-sm text-slate-100"}>
                {value}
            </span>
        </div>
    );
}

export function ConsorcioSimulator({ organizacaoNome }: { organizacaoNome?: string }) {
    const [produto, setProduto] = React.useState<ProdutoSimulador>("imovel");
    const [forms, setForms] = React.useState<Record<ProdutoSimulador, FormState>>(() => ({
        imovel: buildDefaultForm("imovel"),
        auto: buildDefaultForm("auto"),
        pesados: buildDefaultForm("pesados"),
    }));
    const [taxasAbertas, setTaxasAbertas] = React.useState(false);

    const config = PRODUTOS[produto];
    const form = forms[produto];

    const set = (patch: Partial<FormState>) =>
        setForms((prev) => ({ ...prev, [produto]: { ...prev[produto], ...patch } }));

    const input = React.useMemo(() => formToInput(produto, form), [produto, form]);
    const r = React.useMemo(() => calcularConsorcio(input), [input]);

    return (
        <div className="space-y-4">
            {/* Tabs de produto */}
            <div className="flex flex-wrap gap-2">
                {(Object.keys(PRODUTOS) as ProdutoSimulador[]).map((p) => {
                    const Icon = PRODUTO_ICON[p];
                    const active = p === produto;
                    return (
                        <Button
                            key={p}
                            type="button"
                            variant={active ? "default" : "outline"}
                            size="sm"
                            onClick={() => setProduto(p)}
                            className={active ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {PRODUTOS[p].label}
                        </Button>
                    );
                })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                {/* ============ FORM ============ */}
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
                            <Label className="text-xs text-muted-foreground">Crédito contratado</Label>
                            <MoneyInput
                                value={form.creditoContratado}
                                onChange={(v) => set({ creditoContratado: v })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Tipo de contratação</Label>
                            <select
                                value={form.tipoContratacao}
                                onChange={(e) => set({ tipoContratacao: e.target.value as TipoContratacao })}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                            >
                                <option value="fisica">Pessoa Física</option>
                                <option value="juridica">Pessoa Jurídica</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Prazo total (parcelas)</Label>
                            <Input
                                value={form.prazoTotal}
                                inputMode="numeric"
                                onChange={(e) => set({ prazoTotal: e.target.value.replace(/\D/g, "") })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Redutor do grupo</Label>
                            <select
                                value={form.redutor}
                                onChange={(e) => set({ redutor: e.target.value })}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                            >
                                {REDUTOR_OPCOES.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Wallet className="h-3.5 w-3.5" />
                            Oferta de lance
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Recurso próprio</Label>
                                <MoneyInput
                                    value={form.recursoProprio}
                                    onChange={(v) => set({ recursoProprio: v })}
                                />
                            </div>

                            {config.permiteFgts && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">FGTS</Label>
                                    <MoneyInput value={form.fgts} onChange={(v) => set({ fgts: v })} />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Lance embutido
                                </Label>
                                <MoneyInput
                                    value={form.lanceEmbutido}
                                    onChange={(v) => set({ lanceEmbutido: v })}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Máx. {pct(config.embutidoMaxPct)}: {brl(r.embutidoMaximo)}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Contemplação na parcela
                                </Label>
                                <Input
                                    value={form.contemplacaoParcela}
                                    inputMode="numeric"
                                    onChange={(e) =>
                                        set({ contemplacaoParcela: e.target.value.replace(/\D/g, "") })
                                    }
                                />
                            </div>
                        </div>

                        {r.embutidoExcedido && (
                            <p className="inline-flex items-center gap-1.5 text-xs text-amber-400">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Embutido acima do máximo permitido ({pct(config.embutidoMaxPct)} ={" "}
                                {brl(r.embutidoMaximo)}). Verifique a característica do grupo.
                            </p>
                        )}
                    </div>

                    {/* Lance por percentual desejado */}
                    <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Percent className="h-3.5 w-3.5" />
                            Lance por percentual (ex.: lance fixo)
                        </p>

                        <div className="grid gap-3 sm:grid-cols-[140px_1fr] sm:items-center">
                            <PctField
                                label="% de lance desejado"
                                value={form.lancePercentualDesejado}
                                onChange={(v) => set({ lancePercentualDesejado: v })}
                            />

                            <div className="grid gap-2 sm:grid-cols-2">
                                <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                                    <p className="text-[11px] text-muted-foreground">
                                        Total necessário
                                    </p>
                                    <p className="text-sm font-semibold text-white">
                                        {brl(r.lanceDesejadoTotal)}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                                    <p className="text-[11px] text-muted-foreground">
                                        Usando o embutido
                                    </p>
                                    <p className="text-sm font-semibold text-emerald-300">
                                        {r.lanceDesejadoComEmbutido > 0
                                            ? brl(r.lanceDesejadoComEmbutido)
                                            : `${brl(0)} (embutido cobre)`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Taxas (avançado) */}
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <button
                            type="button"
                            onClick={() => setTaxasAbertas((v) => !v)}
                            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground hover:text-white"
                        >
                            <Settings2 className="h-3.5 w-3.5" />
                            Taxas do grupo {taxasAbertas ? "▾" : "▸"}
                        </button>

                        {taxasAbertas && (
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {config.temAdesao && (
                                    <PctField
                                        label="Taxa antecipada (adesão)"
                                        value={form.taxaAdesao}
                                        onChange={(v) => set({ taxaAdesao: v })}
                                    />
                                )}
                                <PctField
                                    label="Taxa administrativa"
                                    value={form.taxaAdmin}
                                    onChange={(v) => set({ taxaAdmin: v })}
                                />
                                <PctField
                                    label="Fundo de reserva"
                                    value={form.fundoReserva}
                                    onChange={(v) => set({ fundoReserva: v })}
                                />
                                <PctField
                                    label="Seguro (apenas PF)"
                                    value={form.seguro}
                                    onChange={(v) => set({ seguro: v })}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ============ RESULTADO ============ */}
                <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                {r.temReducao ? "Parcela reduzida" : "Parcela"}
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-emerald-300">
                                {brl(r.parcelaReduzida)}
                            </p>
                            {r.temReducao && (
                                <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <TrendingDown className="h-3.5 w-3.5" />
                                    Economia de {brl(r.economiaMensal)}/mês
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Representatividade do lance
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-white">
                                {pct(r.representatividadeLance)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Total ofertado: {brl(r.totalLance)}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            Parcelas e custo
                        </p>
                        {config.temAdesao && (
                            <ResultRow
                                label={`${r.adesaoQtdParcelas} primeiras parcelas`}
                                value={brl(r.primeirasParcelas)}
                                hint={`adesão ${brl(r.adesaoParcela)}`}
                            />
                        )}
                        <ResultRow
                            label={r.temReducao ? "Parcela reduzida (demais)" : "Parcela"}
                            value={brl(r.parcelaReduzida)}
                            strong
                        />
                        {r.temReducao && (
                            <ResultRow label="Parcela integral" value={brl(r.parcelaIntegral)} />
                        )}
                        <ResultRow label="Saldo devedor" value={brl(r.saldoDevedor)} />
                        <ResultRow label="Categoria" value={brl(r.categoria)} />
                        {input.tipoContratacao === "fisica" && (
                            <ResultRow label="Seguro mensal" value={brl(r.valorSeguro)} />
                        )}
                    </div>

                    <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
                        <p className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Trophy className="h-3.5 w-3.5" />
                            Estimativa pós-contemplação (parcela {input.contemplacaoParcela}ª)
                        </p>
                        <ResultRow label="Crédito liberado" value={brl(r.creditoLiberado)} strong />
                        <ResultRow
                            label="Reduzindo a parcela → nova parcela"
                            value={brl(r.reduzirParcela_novaParcela)}
                            strong
                            hint={`em ${meses(r.reduzirParcela_novoPrazo)}`}
                        />
                        <ResultRow
                            label="Reduzindo só o prazo → novo prazo"
                            value={meses(r.reduzirPrazo_novoPrazo)}
                            strong
                            hint={`parcela ${brl(r.reduzirPrazo_parcela)}`}
                        />
                    </div>

                    <Button
                        type="button"
                        onClick={() =>
                            abrirSimulacaoPdf(input, r, {
                                clienteNome: form.clienteNome.trim() || undefined,
                                organizacaoNome,
                            })
                        }
                        className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        <FileDown className="mr-2 h-4 w-4" />
                        Gerar PDF para o cliente
                    </Button>

                    <p className="text-center text-xs text-muted-foreground/70">
                        Valores de referência. Sujeito à disponibilidade de vagas no grupo.
                    </p>
                </div>
            </div>
        </div>
    );
}
