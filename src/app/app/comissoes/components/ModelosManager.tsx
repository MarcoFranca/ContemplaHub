"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ComissaoEvento, ComissaoModelo, ComissaoModeloRegra } from "../types";
import {
    createModeloComissaoAction,
    deleteModeloComissaoAction,
    updateModeloComissaoAction,
} from "../actions";

const EVENTOS: { value: ComissaoEvento; label: string }[] = [
    { value: "adesao", label: "Adesão" },
    { value: "primeira_cobranca_valida", label: "1ª cobrança" },
    { value: "proxima_cobranca", label: "Cobrança" },
    { value: "contemplacao", label: "Contemplação" },
    { value: "manual", label: "Manual" },
];

type RegraDraft = {
    offset_meses: number;
    proporcao: string; // % da comissão
    tipo_evento: ComissaoEvento;
    descricao: string;
};

const fmtPct = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}%`;

function emptyDraft(offset = 0): RegraDraft {
    return { offset_meses: offset, proporcao: "", tipo_evento: "proxima_cobranca", descricao: "" };
}

export function ModelosManager({ initialModelos }: { initialModelos: ComissaoModelo[] }) {
    const router = useRouter();
    const [editing, setEditing] = React.useState<ComissaoModelo | null>(null);
    const [creating, setCreating] = React.useState(false);
    const formOpen = creating || editing !== null;

    return (
        <div className="space-y-4">
            {!formOpen && (
                <Button onClick={() => setCreating(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo modelo
                </Button>
            )}

            {formOpen && (
                <ModeloForm
                    modelo={editing}
                    onClose={() => { setCreating(false); setEditing(null); }}
                    onSaved={() => { setCreating(false); setEditing(null); router.refresh(); }}
                />
            )}

            {initialModelos.length === 0 && !formOpen ? (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        Nenhum modelo cadastrado. Crie campanhas como &quot;Porto Aniversário&quot; com a
                        proporção da comissão em cada mês.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {initialModelos.map((m) => (
                        <Card key={m.id} className="border-emerald-500/10">
                            <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold">{m.nome}</h3>
                                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                                            Total padrão {fmtPct(Number(m.percentual_total || 0))}
                                        </Badge>
                                        <Badge variant="outline">
                                            {m.regras.length} parcela{m.regras.length !== 1 ? "s" : ""}
                                        </Badge>
                                        {!m.ativo && <Badge variant="secondary">Inativo</Badge>}
                                    </div>
                                    {m.descricao && <p className="mt-1 text-sm text-muted-foreground">{m.descricao}</p>}
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {[...m.regras]
                                            .sort((a, b) => a.offset_meses - b.offset_meses)
                                            .map((r, i) => (
                                                <span key={i} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                                                    {i + 1}ª: {fmtPct(Number(r.proporcao || 0))}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(m)}>
                                        <Pencil className="h-3.5 w-3.5" /> Editar
                                    </Button>
                                    <DeleteButton id={m.id} nome={m.nome} onDone={() => router.refresh()} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function DeleteButton({ id, nome, onDone }: { id: string; nome: string; onDone: () => void }) {
    const [pending, start] = React.useTransition();
    return (
        <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
            disabled={pending}
            onClick={() => {
                if (!confirm(`Excluir o modelo "${nome}"? Isso não afeta comissões já configuradas.`)) return;
                start(async () => {
                    try {
                        await deleteModeloComissaoAction(id);
                        toast.success("Modelo excluído.");
                        onDone();
                    } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Erro ao excluir.");
                    }
                });
            }}
        >
            <Trash2 className="h-3.5 w-3.5" /> Excluir
        </Button>
    );
}

function ModeloForm({
    modelo,
    onClose,
    onSaved,
}: {
    modelo: ComissaoModelo | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [nome, setNome] = React.useState(modelo?.nome ?? "");
    const [descricao, setDescricao] = React.useState(modelo?.descricao ?? "");
    const [ativo, setAtivo] = React.useState(modelo?.ativo ?? true);
    const [totalPadrao, setTotalPadrao] = React.useState(String(modelo?.percentual_total ?? ""));
    const [qtdGerar, setQtdGerar] = React.useState("12");
    const [regras, setRegras] = React.useState<RegraDraft[]>(
        modelo?.regras?.length
            ? [...modelo.regras]
                  .sort((a, b) => a.offset_meses - b.offset_meses)
                  .map((r) => ({
                      offset_meses: r.offset_meses,
                      proporcao: String(r.proporcao ?? ""),
                      tipo_evento: r.tipo_evento,
                      descricao: r.descricao ?? "",
                  }))
            : [emptyDraft(0)]
    );
    const [pending, start] = React.useTransition();

    const somaProporcao = regras.reduce((s, r) => s + (Number(r.proporcao) || 0), 0);
    const totalNum = Number(totalPadrao) || 0;
    const somaOk = Math.abs(somaProporcao - 100) < 0.01;

    const setRow = (i: number, patch: Partial<RegraDraft>) =>
        setRegras((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    const addRow = () => setRegras((prev) => [...prev, emptyDraft(prev.length)]);
    const removeRow = (i: number) => setRegras((prev) => prev.filter((_, idx) => idx !== i));

    const preencherExemplo = () => {
        const props = [7, 6, 6, 6, 7, 8, 8, 9, 10, 10, 11, 12]; // soma 100 (tabela Porto Aniversário)
        if (!nome.trim()) setNome("Porto Aniversário");
        if (!totalPadrao) setTotalPadrao("4");
        setRegras(
            props.map((p, i) => ({
                offset_meses: i,
                proporcao: String(p),
                tipo_evento: "proxima_cobranca",
                descricao: "",
            }))
        );
        toast.success("Exemplo Porto Aniversário preenchido. Ajuste o que precisar.");
    };

    const gerarParcelas = () => {
        const n = Math.max(1, Math.min(120, Math.floor(Number(qtdGerar) || 0)));
        const base = Math.floor((100 / n) * 10000) / 10000;
        const rows: RegraDraft[] = Array.from({ length: n }, (_, i) => ({
            offset_meses: i,
            proporcao: String(base),
            tipo_evento: "proxima_cobranca",
            descricao: "",
        }));
        // ajusta a última pra somar exatamente 100
        rows[n - 1].proporcao = String(Number((100 - base * (n - 1)).toFixed(4)));
        setRegras(rows);
        toast.success(`${n} parcelas iguais geradas. Ajuste se precisar.`);
    };

    const save = () => {
        if (!nome.trim()) return toast.error("Informe o nome do modelo.");
        if (totalNum <= 0) return toast.error("Informe o percentual total padrão da comissão.");
        const valid = regras.filter((r) => Number(r.proporcao) > 0);
        if (valid.length === 0) return toast.error("Informe ao menos uma parcela.");
        if (Math.abs(valid.reduce((s, r) => s + Number(r.proporcao), 0) - 100) >= 0.01) {
            return toast.error("A soma das proporções deve ser 100%.");
        }

        const payload = {
            nome: nome.trim(),
            descricao: descricao.trim() || null,
            ativo,
            percentual_total: Number(totalNum.toFixed(4)),
            regras: valid.map((r, idx): ComissaoModeloRegra => ({
                ordem: idx + 1,
                tipo_evento: r.tipo_evento,
                offset_meses: Number(r.offset_meses) || 0,
                proporcao: Number(r.proporcao),
                descricao: r.descricao.trim() || null,
            })),
        };

        start(async () => {
            try {
                if (modelo) await updateModeloComissaoAction(modelo.id, payload);
                else await createModeloComissaoAction(payload);
                toast.success(modelo ? "Modelo atualizado." : "Modelo criado.");
                onSaved();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Erro ao salvar o modelo.");
            }
        });
    };

    return (
        <Card className="border-emerald-500/20">
            <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{modelo ? "Editar modelo" : "Novo modelo"}</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} title="Fechar">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">Nome</label>
                        <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Porto Aniversário" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Total padrão da comissão (%)</label>
                        <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={totalPadrao}
                            onChange={(e) => setTotalPadrao(e.target.value)}
                            placeholder="Ex.: 4"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground">Descrição (opcional)</label>
                    <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Campanha, vigência, etc." />
                </div>

                {/* Gerador rápido */}
                <div className="flex flex-wrap items-end gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div>
                        <label className="text-[10px] text-muted-foreground">Parcelado em (vezes)</label>
                        <Input
                            type="number"
                            min={1}
                            max={120}
                            value={qtdGerar}
                            onChange={(e) => setQtdGerar(e.target.value)}
                            className="h-9 w-28"
                        />
                    </div>
                    <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={gerarParcelas}>
                        <Wand2 className="h-3.5 w-3.5" /> Gerar parcelas iguais
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 gap-1.5" onClick={preencherExemplo}>
                        Exemplo Porto Aniversário
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        Cria N parcelas proporcionais (100% ÷ N). Depois ajuste cada mês se quiser.
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">
                            Parcelas (proporção da comissão)
                        </label>
                        <span className={`text-xs ${somaOk ? "text-emerald-300" : "text-amber-300"}`}>
                            Soma: <strong>{fmtPct(somaProporcao)}</strong> {somaOk ? "✓" : "(precisa 100%)"}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {regras.map((r, i) => {
                            const propNum = Number(r.proporcao) || 0;
                            const pctCarta = totalNum > 0 ? (totalNum * propNum) / 100 : 0;
                            return (
                                <div key={i} className="grid grid-cols-[4.5rem_1fr_7rem_7rem_2.5rem] items-end gap-2">
                                    <div>
                                        <label className="text-[10px] text-muted-foreground">Mês</label>
                                        <Input type="number" min={0} value={r.offset_meses}
                                            onChange={(e) => setRow(i, { offset_meses: Number(e.target.value) })} className="h-9" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-muted-foreground">% da comissão</label>
                                        <Input type="number" min={0} step="0.01" value={r.proporcao} placeholder="0,00"
                                            onChange={(e) => setRow(i, { proporcao: e.target.value })} className="h-9" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-muted-foreground">Evento</label>
                                        <select
                                            value={r.tipo_evento}
                                            onChange={(e) => setRow(i, { tipo_evento: e.target.value as ComissaoEvento })}
                                            className="h-9 w-full rounded-md border border-white/10 bg-slate-950 px-2 text-sm text-white outline-none"
                                        >
                                            {EVENTOS.map((ev) => (<option key={ev.value} value={ev.value}>{ev.label}</option>))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-muted-foreground">% da carta</label>
                                        <div className="flex h-9 items-center rounded-md border border-white/5 bg-slate-950/50 px-2 text-xs tabular-nums text-muted-foreground">
                                            {pctCarta > 0 ? fmtPct(Number(pctCarta.toFixed(4))) : "—"}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-300 hover:bg-rose-500/10"
                                        onClick={() => removeRow(i)} disabled={regras.length === 1} title="Remover parcela">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>

                    <Button variant="outline" size="sm" className="gap-1.5" onClick={addRow}>
                        <Plus className="h-3.5 w-3.5" /> Adicionar parcela
                    </Button>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
                        Ativo
                    </label>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={pending}>Cancelar</Button>
                        <Button onClick={save} disabled={pending || !somaOk}>{pending ? "Salvando..." : "Salvar modelo"}</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
