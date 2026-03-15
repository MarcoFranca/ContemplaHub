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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import { updateCartaAction } from "../actions";

type LanceFixoOpcaoForm = {
    id?: string;
    localId: string;
    percentual: string;
    ordem: number;
    ativo: boolean;
    observacoes: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cotaId: string;
    initialData: {
        grupo_codigo: string;
        numero_cota: string;
        produto: string;
        valor_carta?: number | string | null;
        valor_parcela?: number | string | null;
        prazo?: number | null;
        status: string;
        autorizacao_gestao: boolean;
        embutido_permitido: boolean;
        embutido_max_percent?: number | string | null;
        fgts_permitido: boolean;
        tipo_lance_preferencial?: string | null;
        estrategia?: string | null;
        objetivo?: string | null;
        assembleia_dia?: number | null;
    };
    opcoesLanceFixo?: Array<{
        id: string;
        cota_id: string;
        percentual: number | string;
        ordem: number;
        ativo: boolean;
        observacoes?: string | null;
        created_at?: string | null;
    }>;
    onSuccess?: () => void;
};

function toInputNumber(value?: number | string | null) {
    if (value === null || value === undefined) return "";
    return String(value);
}

function makeOpcao(ordem = 1): LanceFixoOpcaoForm {
    return {
        localId: crypto.randomUUID(),
        percentual: "",
        ordem,
        ativo: true,
        observacoes: "",
    };
}

export function EditCartaSheet({
                                   open,
                                   onOpenChange,
                                   cotaId,
                                   initialData,
                                   opcoesLanceFixo = [],
                                   onSuccess,
                               }: Props) {
    const [grupoCodigo, setGrupoCodigo] = React.useState(initialData.grupo_codigo ?? "");
    const [numeroCota, setNumeroCota] = React.useState(initialData.numero_cota ?? "");
    const [produto, setProduto] = React.useState(initialData.produto ?? "imobiliario");
    const [valorCarta, setValorCarta] = React.useState(toInputNumber(initialData.valor_carta));
    const [valorParcela, setValorParcela] = React.useState(toInputNumber(initialData.valor_parcela));
    const [prazo, setPrazo] = React.useState(toInputNumber(initialData.prazo));
    const [assembleiaDia, setAssembleiaDia] = React.useState(toInputNumber(initialData.assembleia_dia));
    const [estrategia, setEstrategia] = React.useState(initialData.estrategia ?? "");
    const [objetivo, setObjetivo] = React.useState(initialData.objetivo ?? "");
    const [tipoLancePreferencial, setTipoLancePreferencial] = React.useState(
        initialData.tipo_lance_preferencial ?? ""
    );

    const [autorizacaoGestao, setAutorizacaoGestao] = React.useState(
        Boolean(initialData.autorizacao_gestao)
    );
    const [embutidoPermitido, setEmbutidoPermitido] = React.useState(
        Boolean(initialData.embutido_permitido)
    );
    const [embutidoMaxPercent, setEmbutidoMaxPercent] = React.useState(
        toInputNumber(initialData.embutido_max_percent)
    );
    const [fgtsPermitido, setFgtsPermitido] = React.useState(Boolean(initialData.fgts_permitido));

    const [usaLanceFixo, setUsaLanceFixo] = React.useState(opcoesLanceFixo.length > 0);
    const [fixos, setFixos] = React.useState<LanceFixoOpcaoForm[]>(
        opcoesLanceFixo.map((op) => ({
            id: op.id,
            localId: crypto.randomUUID(),
            percentual: String(op.percentual ?? ""),
            ordem: op.ordem,
            ativo: Boolean(op.ativo),
            observacoes: op.observacoes ?? "",
        }))
    );

    React.useEffect(() => {
        if (!open) return;

        setGrupoCodigo(initialData.grupo_codigo ?? "");
        setNumeroCota(initialData.numero_cota ?? "");
        setProduto(initialData.produto ?? "imobiliario");
        setValorCarta(toInputNumber(initialData.valor_carta));
        setValorParcela(toInputNumber(initialData.valor_parcela));
        setPrazo(toInputNumber(initialData.prazo));
        setAssembleiaDia(toInputNumber(initialData.assembleia_dia));
        setEstrategia(initialData.estrategia ?? "");
        setObjetivo(initialData.objetivo ?? "");
        setTipoLancePreferencial(initialData.tipo_lance_preferencial ?? "");
        setAutorizacaoGestao(Boolean(initialData.autorizacao_gestao));
        setEmbutidoPermitido(Boolean(initialData.embutido_permitido));
        setEmbutidoMaxPercent(toInputNumber(initialData.embutido_max_percent));
        setFgtsPermitido(Boolean(initialData.fgts_permitido));
        setUsaLanceFixo(opcoesLanceFixo.length > 0);
        setFixos(
            opcoesLanceFixo.map((op) => ({
                id: op.id,
                localId: crypto.randomUUID(),
                percentual: String(op.percentual ?? ""),
                ordem: op.ordem,
                ativo: Boolean(op.ativo),
                observacoes: op.observacoes ?? "",
            }))
        );
    }, [open, initialData, opcoesLanceFixo]);

    function addFixo() {
        setFixos((prev) => [...prev, makeOpcao(prev.length + 1)]);
    }

    function removeFixo(localId: string) {
        setFixos((prev) =>
            prev
                .filter((item) => item.localId !== localId)
                .map((item, idx) => ({ ...item, ordem: idx + 1 }))
        );
    }

    function updateFixo(localId: string, patch: Partial<LanceFixoOpcaoForm>) {
        setFixos((prev) => prev.map((item) => (item.localId === localId ? { ...item, ...patch } : item)));
    }

    function validateFixos() {
        if (!usaLanceFixo) return true;
        if (!fixos.length) {
            toast.error("Adicione ao menos uma opção de lance fixo.");
            return false;
        }

        const ordens = new Set<number>();
        const percentuais = new Set<string>();

        for (const item of fixos) {
            const percentual = Number(String(item.percentual).replace(",", "."));
            const ordem = Number(item.ordem);

            if (!item.percentual || Number.isNaN(percentual) || percentual <= 0 || percentual > 100) {
                toast.error("Revise os percentuais do lance fixo.");
                return false;
            }

            if (Number.isNaN(ordem) || ordem < 1) {
                toast.error("Revise a ordem das opções de lance fixo.");
                return false;
            }

            const pctKey = percentual.toFixed(4);
            if (percentuais.has(pctKey)) {
                toast.error("Não repita percentual nas opções de lance fixo.");
                return false;
            }

            if (ordens.has(ordem)) {
                toast.error("Não repita a ordem das opções de lance fixo.");
                return false;
            }

            ordens.add(ordem);
            percentuais.add(pctKey);
        }

        return true;
    }

    const fixosJson = React.useMemo(() => {
        if (!usaLanceFixo) return "[]";

        return JSON.stringify(
            fixos.map((item) => ({
                id: item.id ?? null,
                percentual: Number(String(item.percentual).replace(",", ".")),
                ordem: Number(item.ordem),
                ativo: Boolean(item.ativo),
                observacoes: item.observacoes?.trim() || null,
            }))
        );
    }, [usaLanceFixo, fixos]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Editar carta</SheetTitle>
                    <SheetDescription>
                        Ajuste os dados operacionais e financeiros da carta.
                    </SheetDescription>
                </SheetHeader>

                <form
                    action={async (formData: FormData) => {
                        if (!grupoCodigo || !numeroCota || !produto || !valorCarta) {
                            toast.error("Preencha os campos obrigatórios.");
                            return;
                        }

                        if (!validateFixos()) return;

                        try {
                            toast.dismiss();
                            toast.loading("Salvando carta...");

                            await updateCartaAction(formData);

                            toast.dismiss();
                            toast.success("Carta atualizada com sucesso.");
                            onOpenChange(false);
                            onSuccess?.();
                        } catch (error) {
                            console.error(error);
                            toast.dismiss();
                            toast.error("Erro ao atualizar carta.");
                        }
                    }}
                    className="mt-6 space-y-6"
                >
                    <input type="hidden" name="cotaId" value={cotaId} />
                    <input type="hidden" name="opcoesLanceFixoJson" value={fixosJson} />

                    <div className="grid gap-4 xl:grid-cols-2">
                        <div className="space-y-6">
                            <div className="rounded-xl border p-4 space-y-4">
                                <h3 className="font-medium">Identificação</h3>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Grupo</Label>
                                        <Input
                                            name="grupo_codigo"
                                            value={grupoCodigo}
                                            onChange={(e) => setGrupoCodigo(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Número da cota</Label>
                                        <Input
                                            name="numero_cota"
                                            value={numeroCota}
                                            onChange={(e) => setNumeroCota(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Produto</Label>
                                        <select
                                            name="produto"
                                            value={produto}
                                            onChange={(e) => setProduto(e.target.value)}
                                            className="h-10 rounded-md border bg-background px-3 text-sm"
                                        >
                                            <option value="imobiliario">Imóvel</option>
                                            <option value="auto">Auto</option>
                                        </select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Dia da assembleia</Label>
                                        <Input
                                            name="assembleia_dia"
                                            type="number"
                                            min={1}
                                            max={31}
                                            value={assembleiaDia}
                                            onChange={(e) => setAssembleiaDia(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border p-4 space-y-4">
                                <h3 className="font-medium">Dados financeiros</h3>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Valor da carta</Label>
                                        <Input
                                            name="valor_carta"
                                            value={valorCarta}
                                            onChange={(e) => setValorCarta(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Valor da parcela</Label>
                                        <Input
                                            name="valor_parcela"
                                            value={valorParcela}
                                            onChange={(e) => setValorParcela(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Prazo</Label>
                                        <Input
                                            name="prazo"
                                            type="number"
                                            value={prazo}
                                            onChange={(e) => setPrazo(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Tipo de lance preferencial</Label>
                                        <select
                                            name="tipo_lance_preferencial"
                                            value={tipoLancePreferencial}
                                            onChange={(e) => setTipoLancePreferencial(e.target.value)}
                                            className="h-10 rounded-md border bg-background px-3 text-sm"
                                        >
                                            <option value="">Selecione</option>
                                            <option value="livre">Livre</option>
                                            <option value="fixo">Fixo</option>
                                        </select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Embutido máximo (%)</Label>
                                        <Input
                                            name="embutido_max_percent"
                                            value={embutidoMaxPercent}
                                            onChange={(e) => setEmbutidoMaxPercent(e.target.value)}
                                            disabled={!embutidoPermitido}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 text-sm">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={autorizacaoGestao}
                                            onChange={(e) => setAutorizacaoGestao(e.target.checked)}
                                            name="autorizacao_gestao"
                                        />
                                        Autorização de gestão
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={embutidoPermitido}
                                            onChange={(e) => setEmbutidoPermitido(e.target.checked)}
                                            name="embutido_permitido"
                                        />
                                        Permite embutido
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={fgtsPermitido}
                                            onChange={(e) => setFgtsPermitido(e.target.checked)}
                                            name="fgts_permitido"
                                        />
                                        Permite FGTS
                                    </label>
                                </div>
                            </div>

                            <div className="rounded-xl border p-4 space-y-4">
                                <h3 className="font-medium">Estratégia</h3>

                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label>Objetivo</Label>
                                        <Input
                                            name="objetivo"
                                            value={objetivo}
                                            onChange={(e) => setObjetivo(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Estratégia</Label>
                                        <Textarea
                                            name="estrategia"
                                            value={estrategia}
                                            onChange={(e) => setEstrategia(e.target.value)}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-xl border p-4 space-y-4">
                                <div>
                                    <h3 className="font-medium">Modalidades de lance fixo</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Configure zero, uma ou várias opções por carta.
                                    </p>
                                </div>

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={usaLanceFixo}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setUsaLanceFixo(checked);
                                            if (checked && fixos.length === 0) {
                                                setFixos([makeOpcao(1)]);
                                            }
                                            if (!checked) {
                                                setFixos([]);
                                            }
                                        }}
                                    />
                                    Esta carta possui lance fixo
                                </label>

                                {usaLanceFixo && (
                                    <div className="space-y-3">
                                        {fixos.map((item, index) => (
                                            <div key={item.localId} className="rounded-lg border p-3 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Opção {index + 1}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFixo(item.localId)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="grid gap-3 md:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label>Percentual (%)</Label>
                                                        <Input
                                                            value={item.percentual}
                                                            onChange={(e) => updateFixo(item.localId, { percentual: e.target.value })}
                                                            placeholder="Ex.: 40"
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label>Ordem</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.ordem}
                                                            onChange={(e) =>
                                                                updateFixo(item.localId, { ordem: Number(e.target.value || 1) })
                                                            }
                                                        />
                                                    </div>

                                                    <div className="grid gap-2 md:col-span-2">
                                                        <Label>Observações</Label>
                                                        <Input
                                                            value={item.observacoes}
                                                            onChange={(e) => updateFixo(item.localId, { observacoes: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.ativo}
                                                        onChange={(e) => updateFixo(item.localId, { ativo: e.target.checked })}
                                                    />
                                                    Opção ativa
                                                </label>
                                            </div>
                                        ))}

                                        <Button type="button" variant="outline" onClick={addFixo}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Adicionar opção
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            Salvar alterações
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}