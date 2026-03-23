"use client";

import * as React from "react";
import { WandSparkles } from "lucide-react";
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
import { Handshake, Plus } from "lucide-react";

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
        <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
                <ResumoCard label="Comissão total" value={`${percentualTotal.toFixed(4)}%`} />
                <ResumoCard label="Valor estimado" value={formatMoney(valorTotalEstimado)} />
                <ResumoCard label="Distribuído" value={`${totalDistribuido.toFixed(4)}%`} />
                <ResumoCard
                    label="Saldo"
                    value={`${saldo.toFixed(4)}%`}
                    danger={!podeSalvar}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                        Comissão total %
                    </label>
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
                </div>

                <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Modo</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={value.modo}
                        onChange={(e) =>
                            setField("modo", e.target.value as CotaComissaoPayload["modo"])
                        }
                    >
                        <option value="avista">À vista</option>
                        <option value="parcelado">Parcelado</option>
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                        Imposto padrão %
                    </label>
                    <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={value.imposto_padrao_pct}
                        onChange={(e) =>
                            setField("imposto_padrao_pct", Number(e.target.value || 0))
                        }
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                        Qtde. parcelas
                    </label>
                    <Input
                        type="number"
                        min={1}
                        value={quantidadeParcelas}
                        onChange={(e) => setQuantidadeParcelas(Number(e.target.value || 1))}
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={gerarParcelas}>
                    <WandSparkles className="mr-2 h-4 w-4" />
                    Gerar parcelas automaticamente
                </Button>
            </div>

            <Alert variant={podeSalvar ? "default" : "destructive"}>
                <AlertTitle>
                    {podeSalvar ? "Distribuição válida" : "Distribuição incompleta"}
                </AlertTitle>
                <AlertDescription>
                    {podeSalvar
                        ? "A comissão está corretamente distribuída entre as parcelas."
                        : "Ajuste as parcelas para fechar 100% da comissão informada antes de salvar."}
                </AlertDescription>
            </Alert>

            <ParcelasComissaoTable
                regras={value.regras}
                valorBase={Number(valorBase || 0)}
                onPercentualChange={onPercentualChange}
                onLiberarAuto={onLiberarAuto}
            />

            <div className="space-y-3 rounded-xl border p-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h4 className="font-medium inline-flex items-center gap-2">
                            <Handshake className="h-4 w-4 text-emerald-400" />
                            Parceiros vinculados
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            O repasse do parceiro será distribuído proporcionalmente ao cronograma.
                        </p>
                    </div>

                    <Button type="button" variant="outline" onClick={addParceiro}>
                        <Plus className="mr-2 h-4 w-4" />
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
                        <p className="text-sm text-muted-foreground">
                            Nenhum parceiro vinculado a esta carta.
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function ResumoCard({
                        label,
                        value,
                        danger = false,
                    }: {
    label: string;
    value: string;
    danger?: boolean;
}) {
    return (
        <div
            className={`rounded-xl border px-4 py-3 ${
                danger ? "border-red-500/50 bg-red-500/5" : "bg-muted/30"
            }`}
        >
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {label}
            </div>
            <div className="text-lg font-semibold">{value}</div>
        </div>
    );
}

function formatMoney(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value || 0);
}