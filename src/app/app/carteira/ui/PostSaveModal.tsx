"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    FileText,
    WalletCards,
    BadgeDollarSign,
    Target,
    Sparkles,
    ArrowLeft,
    Save,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { DocumentoSection } from "@/features/contratos/components/sections/documento-section";
import { CartaModalidadesForm } from "@/app/app/lances/components/forms/CartaModalidadesForm";
import { ComissaoBuilder } from "@/app/app/lances/components/comissao/ComissaoBuilder";

export type PostSaveMode =
    | "menu"
    | "documento"
    | "modalidades"
    | "comissao";

export interface CartaModalidadesInitialValues {
    embutidoPermitido: boolean;
    embutidoMaxPercent: number | null;
    fgtsPermitido: boolean;
    opcoesLanceFixo: Array<{
        id?: string;
        ordem: number;
        percentual?: number | null;
        ativo: boolean;
    }>;
}

type ComissaoPayload = React.ComponentProps<typeof ComissaoBuilder>["value"];
type ComissaoParceirosDisponiveis =
    React.ComponentProps<typeof ComissaoBuilder>["parceirosDisponiveis"];

type ParceiroBasico = {
    id: string;
    nome: string;
};

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contractId: string | null;
    cotaId: string | null;
    onFinish: () => void;
    modalidadesInitialValues?: CartaModalidadesInitialValues;

    parceirosDisponiveis?: ParceiroBasico[];
    valorBaseComissao?: number | null;

    /**
     * Se você já tiver uma server action/rota pronta para persistir a comissão avançada,
     * passe aqui. Se não passar, a UI funciona e o usuário consegue montar a comissão,
     * mas o botão apenas conclui sem persistir.
     */
    onSaveAdvancedCommission?: (params: {
        cotaId: string;
        contractId: string | null;
        value: ComissaoPayload;
    }) => Promise<{ ok: boolean; message?: string }>;

    /**
     * Opcional para pré-carregar a comissão inicial.
     * Se não vier, montamos uma estrutura base segura.
     */
    comissaoInitialValue?: ComissaoPayload | null;
}

function buildDefaultModalidades(): CartaModalidadesInitialValues {
    return {
        embutidoPermitido: false,
        embutidoMaxPercent: null,
        fgtsPermitido: false,
        opcoesLanceFixo: [
            { ordem: 1, percentual: null, ativo: false },
            { ordem: 2, percentual: null, ativo: false },
            { ordem: 3, percentual: null, ativo: false },
        ],
    };
}

function buildDefaultComissao(): ComissaoPayload {
    return {
        percentual_total: 0,
        base_calculo: "valor_carta",
        modo: "avista",
        imposto_padrao_pct: 10,
        primeira_competencia_regra: "mes_adesao",
        furo_meses_override: null,
        ativo: true,
        observacoes: "",
        regras: [
            {
                ordem: 1,
                tipo_evento: "adesao",
                offset_meses: 0,
                percentual_comissao: 0,
                descricao: "Comissão inicial da carta",
                is_manual: false,
            },
        ],
        parceiros: [],
    };
}

function normalizeParceiros(
    parceiros: ParceiroBasico[]
): ComissaoParceirosDisponiveis {
    return parceiros.map((item) => ({
        id: item.id,
        nome: item.nome,
        value: item.id,
        label: item.nome,
        parceiro_id: item.id,
        parceiro_nome: item.nome,
        ativo: true,
    }));
}

function sumRegras(value: ComissaoPayload) {
    return Number(
        (value.regras ?? []).reduce((acc, item) => {
            return acc + Number(item.percentual_comissao || 0);
        }, 0)
    );
}

export function PostSaveModal({
                                  open,
                                  onOpenChange,
                                  contractId,
                                  cotaId,
                                  onFinish,
                                  modalidadesInitialValues,
                                  parceirosDisponiveis = [],
                                  valorBaseComissao = 0,
                                  onSaveAdvancedCommission,
                                  comissaoInitialValue,
                              }: Props) {
    const router = useRouter();
    const [mode, setMode] = useState<PostSaveMode>("menu");
    const [isSavingCommission, startSavingCommission] = useTransition();

    const effectiveModalidadesInitialValues = useMemo(
        () => modalidadesInitialValues ?? buildDefaultModalidades(),
        [modalidadesInitialValues]
    );

    const parceirosComissao = useMemo(
        () => normalizeParceiros(parceirosDisponiveis),
        [parceirosDisponiveis]
    );

    const [comissaoValue, setComissaoValue] = useState<ComissaoPayload>(
        comissaoInitialValue ?? buildDefaultComissao()
    );

    useEffect(() => {
        if (open) {
            setComissaoValue(comissaoInitialValue ?? buildDefaultComissao());
        }
    }, [open, comissaoInitialValue]);

    const totalDistribuido = sumRegras(comissaoValue);
    const percentualTotal = Number(comissaoValue.percentual_total || 0);
    const saldo = Number((percentualTotal - totalDistribuido).toFixed(4));

    const comissaoValida =
        percentualTotal > 0 &&
        Math.abs(saldo) < 0.0001 &&
        Array.isArray(comissaoValue.regras) &&
        comissaoValue.regras.length > 0 &&
        (comissaoValue.modo !== "avista" || comissaoValue.regras.length === 1);

    function handleClose(nextOpen: boolean) {
        onOpenChange(nextOpen);
        if (!nextOpen) {
            setMode("menu");
        }
    }

    function handleFinish() {
        setMode("menu");
        onFinish();
    }

    function handleGoToLances() {
        if (!cotaId) return;
        onOpenChange(false);
        setMode("menu");
        router.push(`/app/lances?cota=${cotaId}`);
        router.refresh();
    }

    function handleSaveAdvancedCommission() {
        if (!cotaId) {
            toast.error("Não foi possível identificar a cota.");
            return;
        }

        if (!comissaoValida) {
            toast.error("Ajuste a comissão antes de salvar.");
            return;
        }

        if (!onSaveAdvancedCommission) {
            toast.success(
                "Comissão avançada montada. Falta apenas ligar a persistência."
            );
            return;
        }

        startSavingCommission(async () => {
            const result = await onSaveAdvancedCommission({
                cotaId,
                contractId,
                value: comissaoValue,
            });

            if (!result.ok) {
                toast.error(result.message ?? "Não foi possível salvar a comissão.");
                return;
            }

            toast.success(result.message ?? "Comissão avançada salva com sucesso.");
            handleFinish();
        });
    }

    function renderMenu() {
        return (
            <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-slate-200">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2 text-emerald-300">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <div className="font-medium text-white">
                                Cadastro concluído com sucesso
                            </div>
                            <p className="leading-6 text-slate-300">
                                A carta já foi criada. Agora você pode enriquecer a operação com
                                documento, modalidades e comissão.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3">
                    <Card className="border-white/10 bg-white/[0.03]">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base text-white">
                                <FileText className="h-4 w-4 text-blue-300" />
                                Documento do contrato
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-3">
                            <p className="text-sm leading-6 text-slate-300">
                                Anexe o PDF do contrato agora para deixar a formalização já
                                completa.
                            </p>
                            <Button
                                type="button"
                                onClick={() => setMode("documento")}
                                disabled={!contractId}
                            >
                                Abrir
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-white/[0.03]">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base text-white">
                                <WalletCards className="h-4 w-4 text-cyan-300" />
                                Modalidades da carta
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-3">
                            <p className="text-sm leading-6 text-slate-300">
                                Configure embutido, FGTS e opções de lance fixo da carta.
                            </p>
                            <Button
                                type="button"
                                onClick={() => setMode("modalidades")}
                                disabled={!cotaId}
                            >
                                Abrir
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-white/[0.03]">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base text-white">
                                <BadgeDollarSign className="h-4 w-4 text-amber-300" />
                                Comissão avançada
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-3">
                            <p className="text-sm leading-6 text-slate-300">
                                Ajuste parcelas, cronograma e parceiros da comissão da carta.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMode("comissao")}
                                disabled={!cotaId}
                            >
                                Abrir
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-white/[0.03]">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base text-white">
                                <Target className="h-4 w-4 text-emerald-300" />
                                Seguir para lances
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-3">
                            <p className="text-sm leading-6 text-slate-300">
                                Ir direto para a gestão de lances e evolução operacional da cota.
                            </p>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleGoToLances}
                                disabled={!cotaId}
                            >
                                Ir agora
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={handleFinish}>
                        Finalizar
                    </Button>
                </div>
            </div>
        );
    }

    function renderHeader() {
        const config = {
            menu: {
                title: "Próximos passos da operação",
                description:
                    "Escolha a próxima ação para enriquecer o cadastro recém-criado.",
            },
            documento: {
                title: "Documento do contrato",
                description:
                    "Anexe o PDF do contrato usando o vínculo já salvo no sistema.",
            },
            modalidades: {
                title: "Modalidades da carta",
                description:
                    "Configure embutido, FGTS e opções de lance fixo da cota.",
            },
            comissao: {
                title: "Comissão avançada",
                description:
                    "Ajuste parcelas, cronograma e parceiros da comissão da carta.",
            },
        } as const;

        const current = config[mode];

        return (
            <DialogHeader className="space-y-3">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    Pós-cadastro
                </div>

                <div>
                    <DialogTitle className="text-2xl font-semibold text-white">
                        {current.title}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm leading-6 text-slate-300">
                        {current.description}
                    </DialogDescription>
                </div>
            </DialogHeader>
        );
    }

    function renderContent() {
        if (mode === "menu") return renderMenu();

        if (mode === "documento") {
            return (
                <div className="space-y-5">
                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setMode("menu")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </div>

                    {contractId ? (
                        <DocumentoSection contractId={contractId} />
                    ) : (
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                            Não foi possível identificar o contrato salvo.
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button type="button" onClick={handleFinish}>
                            Concluir
                        </Button>
                    </div>
                </div>
            );
        }

        if (mode === "modalidades") {
            return (
                <div className="space-y-5">
                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setMode("menu")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </div>

                    {cotaId ? (
                        <CartaModalidadesForm
                            cotaId={cotaId}
                            initialValues={effectiveModalidadesInitialValues}
                        />
                    ) : (
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                            Não foi possível identificar a cota salva.
                        </div>
                    )}
                </div>
            );
        }

        if (mode === "comissao") {
            return (
                <div className="space-y-5">
                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setMode("menu")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </div>

                    {!cotaId ? (
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                            Não foi possível identificar a cota salva.
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <Alert
                                variant={comissaoValida ? "default" : "destructive"}
                                className={
                                    comissaoValida
                                        ? "border-emerald-400/20 bg-emerald-500/10 text-slate-100"
                                        : "border-amber-400/20 bg-amber-500/10 text-slate-100"
                                }
                            >
                                <AlertTitle className="text-white">
                                    {comissaoValida
                                        ? "Comissão pronta para salvar"
                                        : "Revise a distribuição antes de salvar"}
                                </AlertTitle>
                                <AlertDescription className="text-slate-300">
                                    {comissaoValida
                                        ? "A comissão está consistente e pronta para persistência."
                                        : "Garanta que o percentual total esteja distribuído corretamente entre as regras."}
                                </AlertDescription>
                            </Alert>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <ComissaoBuilder
                                    value={comissaoValue}
                                    onChange={setComissaoValue}
                                    parceirosDisponiveis={parceirosComissao}
                                    valorBase={valorBaseComissao}
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setMode("menu")}
                                >
                                    Voltar ao menu
                                </Button>

                                <Button
                                    type="button"
                                    onClick={handleSaveAdvancedCommission}
                                    disabled={isSavingCommission || !cotaId}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSavingCommission
                                        ? "Salvando comissão..."
                                        : "Salvar comissão avançada"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return null;
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.10),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(37,99,235,0.14),_transparent_30%),linear-gradient(180deg,_#07111f_0%,_#091427_42%,_#08111d_100%)] text-white sm:max-w-5xl">
                {renderHeader()}
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
}