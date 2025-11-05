"use client";

import * as React from "react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createContractFromLead } from "@/app/app/leads/actions";

export function ContractDrawer({
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
    administradoras: { id: string; nome: string }[];
    onSuccess?: () => void;
}) {
    const [admId, setAdmId] = React.useState<string>("");
    const [produto, setProduto] = React.useState("imobiliario");
    const [parcelaReduzida, setParcelaReduzida] = React.useState(false);
    const [autGestao, setAutGestao] = React.useState(false);
    const [fgts, setFgts] = React.useState(false);
    const [embutido, setEmbutido] = React.useState(false);

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-w-md w-full ml-auto border-l border-white/10 bg-slate-950/90 backdrop-blur-xl text-slate-50">
                <DrawerHeader>
                    <DrawerTitle>Gerar Contrato — {leadName}</DrawerTitle>
                </DrawerHeader>

                <form
                    action={createContractFromLead}
                    onSubmit={(e) => {
                        const fd = new FormData(e.currentTarget);
                        if (!fd.get("administradoraId") || !fd.get("valorCarta")) {
                            e.preventDefault();
                            toast.error("Preencha os campos obrigatórios.");
                            return;
                        }
                        toast.loading("Criando contrato...");
                        onOpenChange(false);
                        onSuccess?.();
                    }}
                    className="p-4 space-y-6 overflow-y-auto max-h-[70vh]"
                >
                    <input type="hidden" name="leadId" value={leadId} />

                    {/* ======================= */}
                    {/* BLOCO 1 — Identificação */}
                    {/* ======================= */}
                    <div className="space-y-3">
                        <Label>Administradora</Label>
                        <select
                            name="administradoraId"
                            value={admId}
                            onChange={(e) => setAdmId(e.target.value)}
                            className="h-9 rounded-md bg-background border px-2 text-sm"
                            required
                        >
                            <option value="">Selecione...</option>
                            {administradoras.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.nome}
                                </option>
                            ))}
                        </select>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Nº da cota</Label>
                                <Input
                                    name="numeroCota"
                                    placeholder="Ex: 1302-004"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Grupo</Label>
                                <Input
                                    name="grupoCodigo"
                                    placeholder="Ex: IM-2030"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* ======================= */}
                    {/* BLOCO 2 — Financeiro */}
                    {/* ======================= */}
                    <div className="space-y-3 pt-2 border-t border-white/10">
                        <Label>Produto</Label>
                        <select
                            name="produto"
                            value={produto}
                            onChange={(e) => setProduto(e.target.value)}
                            className="h-9 rounded-md bg-background border px-2 text-sm"
                        >
                            <option value="imobiliario">Imóvel</option>
                            <option value="auto">Auto</option>
                            <option value="pesados">Pesados</option>
                        </select>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Valor da carta</Label>
                                <Input name="valorCarta" placeholder="Ex: 250.000,00" required />
                            </div>
                            <div>
                                <Label>Prazo (meses)</Label>
                                <Input name="prazo" type="number" placeholder="Ex: 180" />
                            </div>
                        </div>

                        <div>
                            <Label>Forma de pagamento</Label>
                            <Input name="formaPagamento" placeholder="Ex: boleto, débito..." />
                        </div>

                        <div>
                            <Label>Índice de correção</Label>
                            <Input name="indiceCorrecao" placeholder="Ex: INCC, IPCA..." />
                        </div>
                    </div>

                    {/* ======================= */}
                    {/* BLOCO 3 — Opções extras */}
                    {/* ======================= */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                        <Label>Condições e permissões</Label>
                        <div className="flex flex-col gap-2 text-sm">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={parcelaReduzida}
                                    onChange={(e) => setParcelaReduzida(e.target.checked)}
                                    name="parcelaReduzida"
                                />
                                Parcela reduzida
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={embutido}
                                    onChange={(e) => setEmbutido(e.target.checked)}
                                    name="embutidoPermitido"
                                />
                                Permite lance embutido
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={fgts}
                                    onChange={(e) => setFgts(e.target.checked)}
                                    name="fgtsPermitido"
                                />
                                Permite uso do FGTS
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={autGestao}
                                    onChange={(e) => setAutGestao(e.target.checked)}
                                    name="autorizacaoGestao"
                                />
                                Cliente autorizou gestão da carta
                            </label>
                        </div>
                    </div>

                    {/* ======================= */}
                    {/* BLOCO 4 — Datas e contrato */}
                    {/* ======================= */}
                    <div className="pt-2 border-t border-white/10 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Data de adesão</Label>
                                <Input type="date" name="dataAdesao" />
                            </div>
                            <div>
                                <Label>Data de assinatura</Label>
                                <Input type="date" name="dataAssinatura" />
                            </div>
                        </div>
                        <div>
                            <Label>Nº do contrato</Label>
                            <Input name="numero" placeholder="Ex: 2025-000123" />
                        </div>
                    </div>

                    {/* ======================= */}
                    {/* RODAPÉ */}
                    {/* ======================= */}
                    <DrawerFooter className="pt-6 flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">Gerar contrato</Button>
                    </DrawerFooter>
                </form>
            </DrawerContent>
        </Drawer>
    );
}
