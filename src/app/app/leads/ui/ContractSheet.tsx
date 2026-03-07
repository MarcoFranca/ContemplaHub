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
import { FilePlus2, Sparkles } from "lucide-react";

import { createContractFromLead } from "@/app/app/leads/actions";

type AdminOption = { id: string; nome: string };

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

    React.useEffect(() => {
        if (!open) {
            setAdmId("");
            setProduto("imobiliario");
            setParcelaReduzida(false);
            setAutGestao(false);
            setFgts(false);
            setEmbutido(false);
        }
    }, [open]);

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
                                    <option value="pesados">Pesados</option>
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