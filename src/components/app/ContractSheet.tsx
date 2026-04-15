"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createContractFromLead } from "@/app/app/leads/actions";

type AdminOption = { id: string; nome: string };

type Step = 0 | 1 | 2;

function formatCurrencyBRL(value: string) {
    const digits = value.replace(/\D/g, "");
    const numeric = Number(digits) / 100;

    if (!digits) return "";

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(numeric);
}

function onlyDigits(value: string) {
    return value.replace(/\D/g, "");
}

function normalizeCurrencyToBackend(value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    const numeric = Number(digits) / 100;
    return numeric.toFixed(2);
}

function getStepTitle(step: Step) {
    if (step === 0) return "Identificação";
    if (step === 1) return "Financeiro";
    return "Condições e datas";
}

function getStepDescription(step: Step) {
    if (step === 0) {
        return "Defina a administradora e identifique a cota no grupo.";
    }
    if (step === 1) {
        return "Preencha os dados financeiros principais da carta.";
    }
    return "Finalize com permissões, datas e dados contratuais.";
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
    const router = useRouter();

    const formRef = React.useRef<HTMLFormElement | null>(null);

    const [step, setStep] = React.useState<Step>(0);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const [admId, setAdmId] = React.useState("");
    const [grupoCodigo, setGrupoCodigo] = React.useState("");
    const [numeroCota, setNumeroCota] = React.useState("");
    const [produto, setProduto] = React.useState("imobiliario");

    const [valorCarta, setValorCarta] = React.useState("");
    const [valorParcela, setValorParcela] = React.useState("");
    const [prazo, setPrazo] = React.useState("");
    const [formaPagamento, setFormaPagamento] = React.useState("");
    const [indiceCorrecao, setIndiceCorrecao] = React.useState("");

    const [parcelaReduzida, setParcelaReduzida] = React.useState(false);
    const [autGestao, setAutGestao] = React.useState(false);
    const [fgts, setFgts] = React.useState(false);
    const [embutido, setEmbutido] = React.useState(false);
    const [dataAdesao, setDataAdesao] = React.useState("");
    const [dataAssinatura, setDataAssinatura] = React.useState("");
    const [numeroContrato, setNumeroContrato] = React.useState("");

    React.useEffect(() => {
        if (!open) {
            setStep(0);
        }
    }, [open]);

    function validateStep(currentStep: Step) {
        if (currentStep === 0) {
            if (!admId || !grupoCodigo || !numeroCota) {
                toast.error("Preencha administradora, grupo e número da cota.");
                return false;
            }
        }

        if (currentStep === 1) {
            if (!produto || !valorCarta) {
                toast.error("Preencha o produto e o valor da carta.");
                return false;
            }
        }

        return true;
    }

    function handleNext() {
        if (!validateStep(step)) return;
        setStep((prev) => Math.min(prev + 1, 2) as Step);
    }

    function handleBack() {
        setStep((prev) => Math.max(prev - 1, 0) as Step);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!validateStep(0) || !validateStep(1)) return;

        const toastId = toast.loading("Criando contrato...");

        try {
            setIsSubmitting(true);

            const fd = new FormData();

            fd.set("leadId", leadId);
            fd.set("administradoraId", admId);
            fd.set("grupoCodigo", grupoCodigo.trim().toUpperCase());
            fd.set("numeroCota", numeroCota.trim());
            fd.set("produto", produto);
            fd.set("valorCarta", normalizeCurrencyToBackend(valorCarta));

            if (prazo) fd.set("prazo", prazo);
            if (valorParcela) fd.set("valorParcela", normalizeCurrencyToBackend(valorParcela));
            if (formaPagamento) fd.set("formaPagamento", formaPagamento.trim());
            if (indiceCorrecao) fd.set("indiceCorrecao", indiceCorrecao.trim());
            if (dataAdesao) fd.set("dataAdesao", dataAdesao);
            if (dataAssinatura) fd.set("dataAssinatura", dataAssinatura);
            if (numeroContrato) fd.set("numero", numeroContrato.trim());

            if (parcelaReduzida) fd.set("parcelaReduzida", "on");
            if (fgts) fd.set("fgtsPermitido", "on");
            if (embutido) fd.set("embutidoPermitido", "on");
            if (autGestao) fd.set("autorizacaoGestao", "on");

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

    const progress = ((step + 1) / 3) * 100;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full max-w-xl flex-col border-l border-slate-800 bg-slate-950/95 px-0 py-0 text-slate-50 backdrop-blur-xl"
            >
                <div className="border-b border-slate-800 px-6 py-5">
                    <SheetHeader className="space-y-2 text-left">
                        <SheetTitle className="text-lg font-semibold">
                            Nova carta / contrato
                        </SheetTitle>

                        <SheetDescription className="text-sm text-slate-400">
                            Lead: <span className="font-medium text-slate-200">{leadName}</span>
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Etapa {step + 1} de 3 — {getStepTitle(step)}
              </span>
                            <span>{Math.round(progress)}%</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                            <div
                                className="h-full rounded-full bg-emerald-400 transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <p className="text-xs text-slate-400">{getStepDescription(step)}</p>
                    </div>
                </div>

                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                        {step === 0 && (
                            <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-100">
                                        Identificação da cota
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Esses dados ajudam a localizar corretamente a carta dentro da administradora.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Administradora</Label>
                                    <select
                                        name="administradoraId"
                                        value={admId}
                                        onChange={(e) => setAdmId(e.target.value)}
                                        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm"
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

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Grupo</Label>
                                        <Input
                                            name="grupoCodigo"
                                            value={grupoCodigo}
                                            onChange={(e) => setGrupoCodigo(e.target.value.toUpperCase())}
                                            placeholder="Ex: IM-2030"
                                            className="h-10 text-sm"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs">Número da cota</Label>
                                        <Input
                                            name="numeroCota"
                                            value={numeroCota}
                                            onChange={(e) => setNumeroCota(e.target.value)}
                                            placeholder="Ex: 1302-004"
                                            className="h-10 text-sm"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {step === 1 && (
                            <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-100">
                                        Dados financeiros
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Preencha a estrutura da carta para formalizar corretamente o contrato.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Produto</Label>
                                    <select
                                        name="produto"
                                        value={produto}
                                        onChange={(e) => setProduto(e.target.value)}
                                        className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm"
                                        required
                                        disabled={isSubmitting}
                                    >
                                        <option value="imobiliario">Imóvel</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Valor da carta</Label>
                                        <Input
                                            name="valorCarta"
                                            value={valorCarta}
                                            onChange={(e) => setValorCarta(formatCurrencyBRL(e.target.value))}
                                            placeholder="R$ 0,00"
                                            className="h-10 text-sm"
                                            required
                                            disabled={isSubmitting}
                                            inputMode="numeric"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs">Prazo (meses)</Label>
                                        <Input
                                            name="prazo"
                                            type="number"
                                            value={prazo}
                                            onChange={(e) => setPrazo(onlyDigits(e.target.value))}
                                            placeholder="Ex: 180"
                                            className="h-10 text-sm"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Valor da parcela</Label>
                                        <Input
                                            name="valorParcela"
                                            value={valorParcela}
                                            onChange={(e) => setValorParcela(formatCurrencyBRL(e.target.value))}
                                            placeholder="R$ 0,00"
                                            className="h-10 text-sm"
                                            disabled={isSubmitting}
                                            inputMode="numeric"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs">Forma de pagamento</Label>
                                        <Input
                                            name="formaPagamento"
                                            value={formaPagamento}
                                            onChange={(e) => setFormaPagamento(e.target.value)}
                                            placeholder="Ex: boleto"
                                            className="h-10 text-sm"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Índice de correção</Label>
                                    <Input
                                        name="indiceCorrecao"
                                        value={indiceCorrecao}
                                        onChange={(e) => setIndiceCorrecao(e.target.value.toUpperCase())}
                                        placeholder="Ex: INCC / IPCA"
                                        className="h-10 text-sm"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </section>
                        )}

                        {step === 2 && (
                            <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-100">
                                        Condições e formalização
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Defina permissões operacionais e complete os dados contratuais.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-3 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={parcelaReduzida}
                                            onChange={(e) => setParcelaReduzida(e.target.checked)}
                                            disabled={isSubmitting}
                                        />
                                        Parcela reduzida
                                    </label>

                                    <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-3 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={embutido}
                                            onChange={(e) => setEmbutido(e.target.checked)}
                                            disabled={isSubmitting}
                                        />
                                        Permite lance embutido
                                    </label>

                                    <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-3 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={fgts}
                                            onChange={(e) => setFgts(e.target.checked)}
                                            disabled={isSubmitting}
                                        />
                                        Permite uso do FGTS
                                    </label>

                                    <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-3 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={autGestao}
                                            onChange={(e) => setAutGestao(e.target.checked)}
                                            disabled={isSubmitting}
                                        />
                                        Cliente autorizou gestão
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Data de adesão</Label>
                                        <Input
                                            type="date"
                                            name="dataAdesao"
                                            value={dataAdesao}
                                            onChange={(e) => setDataAdesao(e.target.value)}
                                            className="h-10 text-sm"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs">Data de assinatura</Label>
                                        <Input
                                            type="date"
                                            name="dataAssinatura"
                                            value={dataAssinatura}
                                            onChange={(e) => setDataAssinatura(e.target.value)}
                                            className="h-10 text-sm"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Número do contrato</Label>
                                    <Input
                                        name="numero"
                                        value={numeroContrato}
                                        onChange={(e) => setNumeroContrato(e.target.value)}
                                        placeholder="Ex: 2025-000123"
                                        className="h-10 text-sm"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="border-t border-slate-800 bg-slate-950/90 px-6 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={step === 0 ? () => onOpenChange(false) : handleBack}
                                disabled={isSubmitting}
                            >
                                {step === 0 ? "Cancelar" : "Voltar"}
                            </Button>

                            <div className="flex items-center gap-3">
                                {step < 2 ? (
                                    <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                                        Próximo
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Criando..." : "Criar contrato"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}