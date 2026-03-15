"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

import type {
    AdminOption,
    ContractFormState,
    LanceFixoOpcaoForm,
} from "./types";

export function ContractIdentitySection({
                                            form,
                                            setField,
                                            administradoras,
                                        }: {
    form: ContractFormState;
    setField: <K extends keyof ContractFormState>(field: K, value: ContractFormState[K]) => void;
    administradoras: AdminOption[];
}) {
    return (
        <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Identificação da cota
            </p>

            <div className="space-y-2">
                <Label className="text-xs">Administradora</Label>
                <select
                    name="administradoraId"
                    value={form.administradoraId}
                    onChange={(e) => setField("administradoraId", e.target.value)}
                    className="h-9 w-full rounded-md bg-slate-950/60 border border-slate-700 px-2 text-xs"
                    required
                >
                    <option value="">Selecione...</option>
                    {administradoras.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.nome}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs">Nº da cota</Label>
                    <Input
                        name="numeroCota"
                        placeholder="Ex: 1302-004"
                        required
                        className="h-8 text-xs"
                        value={form.numeroCota}
                        onChange={(e) => setField("numeroCota", e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs">Grupo</Label>
                    <Input
                        name="grupoCodigo"
                        placeholder="Ex: IM-2030"
                        required
                        className="h-8 text-xs"
                        value={form.grupoCodigo}
                        onChange={(e) => setField("grupoCodigo", e.target.value)}
                    />
                </div>
            </div>
        </section>
    );
}

export function ContractFinancialSection({
                                             form,
                                             setField,
                                         }: {
    form: ContractFormState;
    setField: <K extends keyof ContractFormState>(field: K, value: ContractFormState[K]) => void;
}) {
    return (
        <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Dados financeiros
            </p>

            <div className="space-y-2">
                <Label className="text-xs">Produto</Label>
                <select
                    name="produto"
                    value={form.produto}
                    onChange={(e) => setField("produto", e.target.value)}
                    className="h-9 w-full rounded-md bg-slate-950/60 border border-slate-700 px-2 text-xs"
                    required
                >
                    <option value="imobiliario">Imóvel</option>
                    <option value="auto">Auto</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs">Valor da carta</Label>
                    <Input
                        name="valorCarta"
                        placeholder="Ex: 250.000,00"
                        required
                        className="h-8 text-xs"
                        value={form.valorCarta}
                        onChange={(e) => setField("valorCarta", e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs">Prazo (meses)</Label>
                    <Input
                        name="prazo"
                        type="number"
                        placeholder="Ex: 180"
                        className="h-8 text-xs"
                        value={form.prazo}
                        onChange={(e) => setField("prazo", e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs">Valor da parcela (opcional)</Label>
                <Input
                    name="valorParcela"
                    placeholder="Ex: 1.650,00"
                    className="h-8 text-xs"
                    value={form.valorParcela}
                    onChange={(e) => setField("valorParcela", e.target.value)}
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs">Forma de pagamento</Label>
                <Input
                    name="formaPagamento"
                    placeholder="Ex: boleto, débito..."
                    className="h-8 text-xs"
                    value={form.formaPagamento}
                    onChange={(e) => setField("formaPagamento", e.target.value)}
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs">Índice de correção</Label>
                <Input
                    name="indiceCorrecao"
                    placeholder="Ex: INCC, IPCA..."
                    className="h-8 text-xs"
                    value={form.indiceCorrecao}
                    onChange={(e) => setField("indiceCorrecao", e.target.value)}
                />
            </div>
        </section>
    );
}

export function ContractPermissionsSection({
                                               form,
                                               setField,
                                           }: {
    form: ContractFormState;
    setField: <K extends keyof ContractFormState>(field: K, value: ContractFormState[K]) => void;
}) {
    return (
        <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Condições & permissões
            </p>

            <div className="flex flex-col gap-2 text-xs">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.parcelaReduzida}
                        onChange={(e) => setField("parcelaReduzida", e.target.checked)}
                        name="parcelaReduzida"
                        className="h-3 w-3"
                    />
                    Parcela reduzida
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.embutidoPermitido}
                        onChange={(e) => setField("embutidoPermitido", e.target.checked)}
                        name="embutidoPermitido"
                        className="h-3 w-3"
                    />
                    Permite lance embutido
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.fgtsPermitido}
                        onChange={(e) => setField("fgtsPermitido", e.target.checked)}
                        name="fgtsPermitido"
                        className="h-3 w-3"
                    />
                    Permite uso do FGTS
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.autorizacaoGestao}
                        onChange={(e) => setField("autorizacaoGestao", e.target.checked)}
                        name="autorizacaoGestao"
                        className="h-3 w-3"
                    />
                    Cliente autorizou gestão da carta
                </label>
            </div>
        </section>
    );
}

export function ContractLanceFixoSection({
                                             usaLanceFixo,
                                             setUsaLanceFixo,
                                             opcoesLanceFixo,
                                             setOpcoesLanceFixo,
                                             updateOpcaoLanceFixo,
                                             addOpcaoLanceFixo,
                                             removeOpcaoLanceFixo,
                                             makeOpcao,
                                         }: {
    usaLanceFixo: boolean;
    setUsaLanceFixo: React.Dispatch<React.SetStateAction<boolean>>;
    opcoesLanceFixo: LanceFixoOpcaoForm[];
    setOpcoesLanceFixo: React.Dispatch<React.SetStateAction<LanceFixoOpcaoForm[]>>;
    updateOpcaoLanceFixo: (id: string, patch: Partial<LanceFixoOpcaoForm>) => void;
    addOpcaoLanceFixo: () => void;
    removeOpcaoLanceFixo: (id: string) => void;
    makeOpcao: (ordem?: number, percentual?: string, observacoes?: string) => LanceFixoOpcaoForm;
}) {
    return (
        <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Modalidades de lance fixo
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                        Configure uma ou mais opções por carta, respeitando a ordem operacional.
                    </p>
                </div>
            </div>

            <label className="flex items-center gap-2 text-xs">
                <input
                    type="checkbox"
                    checked={usaLanceFixo}
                    onChange={(e) => {
                        const checked = e.target.checked;
                        setUsaLanceFixo(checked);

                        if (checked && opcoesLanceFixo.length === 0) {
                            setOpcoesLanceFixo([makeOpcao(1)]);
                        }

                        if (!checked) {
                            setOpcoesLanceFixo([]);
                        }
                    }}
                    className="h-3 w-3"
                />
                Esta carta possui opções de lance fixo
            </label>

            {usaLanceFixo && (
                <div className="space-y-3">
                    {opcoesLanceFixo.map((op, idx) => (
                        <div
                            key={op.id}
                            className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-slate-200">
                                    Opção {idx + 1}
                                </p>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-red-300 hover:text-red-200"
                                    onClick={() => removeOpcaoLanceFixo(op.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Percentual (%)</Label>
                                    <Input
                                        value={op.percentual}
                                        onChange={(e) =>
                                            updateOpcaoLanceFixo(op.id, { percentual: e.target.value })
                                        }
                                        placeholder="Ex: 40"
                                        className="h-8 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Ordem</Label>
                                    <Input
                                        type="number"
                                        value={op.ordem}
                                        onChange={(e) =>
                                            updateOpcaoLanceFixo(op.id, {
                                                ordem: Number(e.target.value || 1),
                                            })
                                        }
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">Observações</Label>
                                <Input
                                    value={op.observacoes}
                                    onChange={(e) =>
                                        updateOpcaoLanceFixo(op.id, { observacoes: e.target.value })
                                    }
                                    placeholder="Opcional"
                                    className="h-8 text-xs"
                                />
                            </div>

                            <label className="flex items-center gap-2 text-xs">
                                <input
                                    type="checkbox"
                                    checked={op.ativo}
                                    onChange={(e) =>
                                        updateOpcaoLanceFixo(op.id, { ativo: e.target.checked })
                                    }
                                    className="h-3 w-3"
                                />
                                Opção ativa
                            </label>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={addOpcaoLanceFixo}
                    >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Adicionar opção de fixo
                    </Button>
                </div>
            )}
        </section>
    );
}

export function ContractDatesSection({
                                         form,
                                         setField,
                                     }: {
    form: ContractFormState;
    setField: <K extends keyof ContractFormState>(field: K, value: ContractFormState[K]) => void;
}) {
    return (
        <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Datas & contrato
            </p>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs">Data de adesão</Label>
                    <Input
                        type="date"
                        name="dataAdesao"
                        className="h-8 text-xs"
                        value={form.dataAdesao}
                        onChange={(e) => setField("dataAdesao", e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs">Data de assinatura</Label>
                    <Input
                        type="date"
                        name="dataAssinatura"
                        className="h-8 text-xs"
                        value={form.dataAssinatura}
                        onChange={(e) => setField("dataAssinatura", e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs">Nº do contrato</Label>
                <Input
                    name="numero"
                    placeholder="Ex: 2025-000123"
                    className="h-8 text-xs"
                    value={form.numero}
                    onChange={(e) => setField("numero", e.target.value)}
                />
            </div>
        </section>
    );
}