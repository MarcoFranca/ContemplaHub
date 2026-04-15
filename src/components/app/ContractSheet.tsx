"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
    const router = useRouter();

    const [admId, setAdmId] = React.useState<string>("");
    const [produto, setProduto] = React.useState("imobiliario");
    const [parcelaReduzida, setParcelaReduzida] = React.useState(false);
    const [autGestao, setAutGestao] = React.useState(false);
    const [fgts, setFgts] = React.useState(false);
    const [embutido, setEmbutido] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = e.currentTarget;
        const fd = new FormData(form);

        if (
            !fd.get("administradoraId") ||
            !fd.get("numeroCota") ||
            !fd.get("grupoCodigo") ||
            !fd.get("valorCarta") ||
            !fd.get("produto")
        ) {
            toast.error("Preencha os campos obrigatórios.");
            return;
        }

        const toastId = toast.loading("Criando contrato...");

        try {
            setIsSubmitting(true);

            const result = await createContractFromLead(fd);

            const errorMessage =
                typeof result === "object" &&
                result !== null &&
                "error" in result &&
                typeof result.error === "string"
                    ? result.error
                    : typeof result === "object" &&
                    result !== null &&
                    "message" in result &&
                    typeof result.message === "string"
                        ? result.message
                        : null;

            if (errorMessage) {
                toast.error(errorMessage, { id: toastId });
                return;
            }

            toast.success("Contrato criado com sucesso!", { id: toastId });
            onOpenChange(false);
            onSuccess?.();
            router.refresh();
        } catch (error) {
            console.error("Erro ao criar contrato:", error);
            toast.error("Não foi possível criar o contrato.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full max-w-md flex-col border-l border-slate-800 bg-slate-950/95 px-5 py-4 text-slate-50 backdrop-blur-xl"
            >
                <SheetHeader className="mb-4">
                    <SheetTitle className="flex flex-col gap-1 text-base font-semibold">
                        Gerar contrato
                        <span className="text-xs font-normal text-slate-400">
              Lead: <span className="font-medium text-slate-100">{leadName}</span>
            </span>
                    </SheetTitle>

                    <SheetDescription className="text-[11px] text-slate-400">
                        Cadastre a cota e gere o contrato inicial. O status começará como{" "}
                        <span className="font-semibold text-emerald-300">
              pendente de assinatura
            </span>.
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1"
                >
                    <input type="hidden" name="leadId" value={leadId} />

                    <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Identificação da cota
                        </p>

                        <div className="space-y-2">
                            <Label className="text-xs">Administradora</Label>
                            <select
                                name="administradoraId"
                                value={admId}
                                onChange={(e) => setAdmId(e.target.value)}
                                className="h-9 rounded-md border border-slate-700 bg-slate-950/60 px-2 text-xs"
                                required
                                disabled={isSubmitting}
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
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">Grupo</Label>
                                <Input
                                    name="grupoCodigo"
                                    placeholder="Ex: IM-2030"
                                    required
                                    className="h-8 text-xs"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Dados financeiros
                        </p>

                        <div className="space-y-2">
                            <Label className="text-xs">Produto</Label>
                            <select
                                name="produto"
                                value={produto}
                                onChange={(e) => setProduto(e.target.value)}
                                className="h-9 rounded-md border border-slate-700 bg-slate-950/60 px-2 text-xs"
                                required
                                disabled={isSubmitting}
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
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">Prazo (meses)</Label>
                                <Input
                                    name="prazo"
                                    type="number"
                                    placeholder="Ex: 180"
                                    className="h-8 text-xs"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">Valor da parcela (opcional)</Label>
                            <Input
                                name="valorParcela"
                                placeholder="Ex: 1.650,00"
                                className="h-8 text-xs"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">Forma de pagamento</Label>
                            <Input
                                name="formaPagamento"
                                placeholder="Ex: boleto, débito..."
                                className="h-8 text-xs"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">Índice de correção</Label>
                            <Input
                                name="indiceCorrecao"
                                placeholder="Ex: INCC, IPCA..."
                                className="h-8 text-xs"
                                disabled={isSubmitting}
                            />
                        </div>
                    </section>

                    <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
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
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
                                />
                                Cliente autorizou gestão da carta
                            </label>
                        </div>
                    </section>

                    <section className="mb-2 space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
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
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">Data de assinatura</Label>
                                <Input
                                    type="date"
                                    name="dataAssinatura"
                                    className="h-8 text-xs"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">Nº do contrato</Label>
                            <Input
                                name="numero"
                                placeholder="Ex: 2025-000123"
                                className="h-8 text-xs"
                                disabled={isSubmitting}
                            />
                        </div>
                    </section>

                    <SheetFooter className="mt-auto flex justify-between gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            size="sm"
                            className="text-xs"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Gerando..." : "Gerar contrato"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}