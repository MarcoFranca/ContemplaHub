"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FilePlus2, Sparkles, Plus, Trash2 } from "lucide-react";

import { createContractFromLead } from "@/app/app/leads/actions";

type AdminOption = { id: string; nome: string };

type LanceFixoOpcaoForm = {
    id: string;
    percentual: string;
    ordem: number;
    ativo: boolean;
    observacoes: string;
};

function makeOpcao(ordem = 1): LanceFixoOpcaoForm {
    return {
        id: crypto.randomUUID(),
        percentual: "",
        ordem,
        ativo: true,
        observacoes: "",
    };
}

export function ContractSheet({
                                  open,
                                  onOpenChange,
                                  leadId,
                                  leadName,
                                  administradoras,
                                  onSuccess,
                              }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    leadId: string;
    leadName: string;
    administradoras: AdminOption[];
    onSuccess?: () => void;
}) {
    const [admId, setAdmId] = React.useState<string>("");
    const [produto, setProduto] = React.useState("imobiliario");
    const [parcelaReduzida, setParcelaReduzida] = React.useState(false);
    const [autGestao, setAutGestao] = React.useState(false);
    const [fgts, setFgts] = React.useState(false);
    const [embutido, setEmbutido] = React.useState(false);

    const [usaLanceFixo, setUsaLanceFixo] = React.useState(false);
    const [opcoesLanceFixo, setOpcoesLanceFixo] = React.useState<LanceFixoOpcaoForm[]>([]);

    React.useEffect(() => {
        if (!open) {
            setAdmId("");
            setProduto("imobiliario");
            setParcelaReduzida(false);
            setAutGestao(false);
            setFgts(false);
            setEmbutido(false);
            setUsaLanceFixo(false);
            setOpcoesLanceFixo([]);
        }
    }, [open]);

    const opcoesLanceFixoJson = React.useMemo(() => {
        if (!usaLanceFixo) return "[]";

        const normalizadas = opcoesLanceFixo
            .map((op) => ({
                percentual: op.percentual === "" ? null : Number(String(op.percentual).replace(",", ".")),
                ordem: Number(op.ordem),
                ativo: Boolean(op.ativo),
                observacoes: op.observacoes?.trim() || null,
            }))
            .filter((op) => op.percentual !== null);

        return JSON.stringify(normalizadas);
    }, [usaLanceFixo, opcoesLanceFixo]);

    function addOpcaoLanceFixo() {
        setOpcoesLanceFixo((prev) => [...prev, makeOpcao(prev.length + 1)]);
    }

    function removeOpcaoLanceFixo(id: string) {
        setOpcoesLanceFixo((prev) => {
            const next = prev.filter((op) => op.id !== id);
            return next.map((op, idx) => ({
                ...op,
                ordem: idx + 1,
            }));
        });
    }

    function updateOpcaoLanceFixo(
        id: string,
        patch: Partial<LanceFixoOpcaoForm>
    ) {
        setOpcoesLanceFixo((prev) =>
            prev.map((op) => (op.id === id ? { ...op, ...patch } : op))
        );
    }

    function validateLanceFixo() {
        if (!usaLanceFixo) return true;

        if (!opcoesLanceFixo.length) {
            toast.error("Adicione ao menos uma opção de lance fixo.");
            return false;
        }

        const percentuais = new Set<string>();
        const ordens = new Set<number>();

        for (const op of opcoesLanceFixo) {
            const percentual = Number(String(op.percentual).replace(",", "."));
            const ordem = Number(op.ordem);

            if (!op.percentual || Number.isNaN(percentual) || percentual <= 0 || percentual > 100) {
                toast.error("Revise os percentuais do lance fixo. Use valores entre 0 e 100.");
                return false;
            }

            if (Number.isNaN(ordem) || ordem < 1) {
                toast.error("Revise a ordem das opções de lance fixo.");
                return false;
            }

            const percentualKey = percentual.toFixed(4);

            if (percentuais.has(percentualKey)) {
                toast.error("Não repita percentual nas opções de lance fixo.");
                return false;
            }

            if (ordens.has(ordem)) {
                toast.error("Não repita a ordem das opções de lance fixo.");
                return false;
            }

            percentuais.add(percentualKey);
            ordens.add(ordem);
        }

        return true;
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="
          w-full max-w-md
          border-l border-slate-800
          bg-slate-950/95
          backdrop-blur-xl
          text-slate-50
          px-0
          py-0
          flex flex-col
        "
            >
                <SheetHeader className="px-5 py-4 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
                    <SheetTitle className="text-base font-semibold flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/25">
              <FilePlus2 className="h-4 w-4 text-emerald-300" />
            </span>
                        Nova carta
                    </SheetTitle>

                    <SheetDescription className="text-[11px] text-slate-400 leading-relaxed">
                        Cadastre uma nova cota e gere o contrato inicial para{" "}
                        <span className="font-medium text-slate-100">{leadName}</span>. O status
                        começará como{" "}
                        <span className="font-semibold text-emerald-300">
              pendente de assinatura
            </span>.
                    </SheetDescription>
                </SheetHeader>

                <form
                    action={async (formData: FormData) => {
                        if (
                            !formData.get("administradoraId") ||
                            !formData.get("numeroCota") ||
                            !formData.get("grupoCodigo") ||
                            !formData.get("valorCarta") ||
                            !formData.get("produto")
                        ) {
                            toast.error("Preencha os campos obrigatórios.");
                            return;
                        }

                        if (!validateLanceFixo()) {
                            return;
                        }

                        try {
                            toast.dismiss();
                            toast.loading("Criando contrato...");

                            await createContractFromLead(formData);

                            toast.dismiss();
                            toast.success("Nova carta / contrato criado com sucesso.");
                            onOpenChange(false);
                            onSuccess?.();
                        } catch (err) {
                            console.error(err);
                            toast.dismiss();
                            toast.error("Erro ao criar contrato.");
                        }
                    }}
                    className="flex-1 flex flex-col min-h-0"
                >
                    <input type="hidden" name="leadId" value={leadId} />
                    <input type="hidden" name="opcoesLanceFixoJson" value={opcoesLanceFixoJson} />

                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                        <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Identificação da cota
                            </p>

                            <div className="space-y-2">
                                <Label className="text-xs">Administradora</Label>
                                <select
                                    name="administradoraId"
                                    value={admId}
                                    onChange={(e) => setAdmId(e.target.value)}
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
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Grupo</Label>
                                    <Input
                                        name="grupoCodigo"
                                        placeholder="Ex: IM-2030"
                                        required
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Dados financeiros
                            </p>

                            <div className="space-y-2">
                                <Label className="text-xs">Produto</Label>
                                <select
                                    name="produto"
                                    value={produto}
                                    onChange={(e) => setProduto(e.target.value)}
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
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Prazo (meses)</Label>
                                    <Input
                                        name="prazo"
                                        type="number"
                                        placeholder="Ex: 180"
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">Valor da parcela (opcional)</Label>
                                <Input
                                    name="valorParcela"
                                    placeholder="Ex: 1.650,00"
                                    className="h-8 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">Forma de pagamento</Label>
                                <Input
                                    name="formaPagamento"
                                    placeholder="Ex: boleto, débito..."
                                    className="h-8 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">Índice de correção</Label>
                                <Input
                                    name="indiceCorrecao"
                                    placeholder="Ex: INCC, IPCA..."
                                    className="h-8 text-xs"
                                />
                            </div>
                        </section>

                        <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Condições & permissões
                            </p>

                            <div className="flex flex-col gap-2 text-xs">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={parcelaReduzida}
                                        onChange={(e) => setParcelaReduzida(e.target.checked)}
                                        name="parcelaReduzida"
                                        className="h-3 w-3"
                                    />
                                    Parcela reduzida
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={embutido}
                                        onChange={(e) => setEmbutido(e.target.checked)}
                                        name="embutidoPermitido"
                                        className="h-3 w-3"
                                    />
                                    Permite lance embutido
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={fgts}
                                        onChange={(e) => setFgts(e.target.checked)}
                                        name="fgtsPermitido"
                                        className="h-3 w-3"
                                    />
                                    Permite uso do FGTS
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={autGestao}
                                        onChange={(e) => setAutGestao(e.target.checked)}
                                        name="autorizacaoGestao"
                                        className="h-3 w-3"
                                    />
                                    Cliente autorizou gestão da carta
                                </label>
                            </div>
                        </section>

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
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Data de assinatura</Label>
                                    <Input
                                        type="date"
                                        name="dataAssinatura"
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">Nº do contrato</Label>
                                <Input
                                    name="numero"
                                    placeholder="Ex: 2025-000123"
                                    className="h-8 text-xs"
                                />
                            </div>
                        </section>
                    </div>

                    <SheetFooter className="mt-auto border-t border-white/10 bg-slate-950/80 backdrop-blur-xl px-5 py-4 flex justify-between gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            size="sm"
                            className="text-xs bg-emerald-600 hover:bg-emerald-500"
                        >
                            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                            Gerar contrato
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}