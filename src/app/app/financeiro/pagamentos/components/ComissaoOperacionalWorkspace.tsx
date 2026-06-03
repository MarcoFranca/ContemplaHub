"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowRightLeft,
    BadgePercent,
    CircleDollarSign,
    ClipboardCheck,
    HandCoins,
    Landmark,
    Loader2,
    Plus,
    ReceiptText,
    ShieldCheck,
    UserRound,
    WalletCards,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ParcelasComissaoTable } from "@/app/app/lances/components/comissao/ParcelasComissaoTable";
import { ComissaoParceiroRow } from "@/app/app/lances/components/comissao/ComissaoParceiroRow";
import {
    gerarRegrasProporcionais,
    redistribuirRegrasAutomaticas,
    somarPercentuais,
} from "@/app/app/lances/components/comissao/comissao-calculator";
import type {
    ComissaoRegra,
    CotaComissaoParceiro,
    CotaComissaoPayload,
    CotaComissaoResponse,
} from "@/app/app/lances/types";

import {
    cancelFinanceiroFuturePaymentsAction,
    generateFinanceiroProjectionAction,
    persistFinanceiroCronogramaAction,
    saveFinanceiroComissaoConfigAction,
    skipFinanceiroPagamentoAction,
    updateFinanceiroContratoNumeroAction,
    updateFinanceiroPagamentoStatusAction,
} from "../actions";
import type {
    FinanceiroComissaoWorkspaceData,
    FinanceiroCronogramaPreviewItem,
    FinanceiroProjectionResponse,
    PagamentoItem,
    PagamentoStatus,
    RecebimentoComissaoTipo,
} from "../types";
import { CronogramaOperacionalTable } from "./CronogramaOperacionalTable";
import { CronogramaPreviewTable } from "./CronogramaPreviewTable";

type ComissaoOperacionalWorkspaceProps = FinanceiroComissaoWorkspaceData;

export function ComissaoOperacionalWorkspace({
    contratos,
    selectedContratoId,
    contratoSelecionado,
    comissaoAtual,
    parceirosDisponiveis,
    resumoFinanceiro,
    timeline,
    lancamentos,
    pagamentos,
}: ComissaoOperacionalWorkspaceProps) {
    const initialPayload = normalizeComissaoPayload(comissaoAtual);
    const router = useRouter();
    const [isSaving, startSaving] = useTransition();
    const [isProjecting, startProjecting] = useTransition();
    const [isUpdatingNumber, startUpdatingNumber] = useTransition();
    const [, startOperating] = useTransition();

    const [payload, setPayload] = useState<CotaComissaoPayload>(() => initialPayload);
    const [projection, setProjection] = useState<FinanceiroProjectionResponse | null>(null);
    const [contractNumber, setContractNumber] = useState(contratoSelecionado?.contrato_numero ?? "");
    const [busyPagamentoId, setBusyPagamentoId] = useState<string | null>(null);
    const [parcelasPlanejadas, setParcelasPlanejadas] = useState(
        Math.max(initialPayload.regras.length, 1),
    );
    const [recebimentoTipo, setRecebimentoTipo] = useState<RecebimentoComissaoTipo>(() => inferRecebimentoTipo(initialPayload));

    const valorCarta = Number(contratoSelecionado?.valor_carta || 0);
    const percentualTotal = Number(payload.percentual_total || 0);
    const totalComissaoBruta = round2(valorCarta * (percentualTotal / 100));
    const totalDistribuido = somarPercentuais(payload.regras || []);
    const percentualParceiros = (payload.parceiros || [])
        .filter((item) => item.ativo)
        .reduce((acc, item) => acc + Number(item.percentual_parceiro || 0), 0);
    const saldoParceiro = Number((percentualTotal - percentualParceiros).toFixed(4));
    const cronogramaPreview = useMemo(
        () => buildCronogramaPreview(payload, valorCarta),
        [payload, valorCarta],
    );
    const totaisPreview = useMemo(() => summarizeCronograma(cronogramaPreview), [cronogramaPreview]);
    const totaisOperacionais = useMemo(() => summarizePagamentosOperacionais(pagamentos), [pagamentos]);
    const numeroContratoPendente = !(contractNumber || "").trim();
    const distribuicaoValida = Math.abs(totalDistribuido - percentualTotal) < 0.0001;
    const parceirosValidos = saldoParceiro >= -0.0001;

    const selectedActionHref = selectedContratoId ? `/app/financeiro/pagamentos?item_id=${selectedContratoId}` : "/app/financeiro/pagamentos";

    const updatePayload = (next: CotaComissaoPayload) => {
        setPayload(next);
        setProjection(null);
    };

    const applyRecebimentoTipo = (tipo: RecebimentoComissaoTipo) => {
        setRecebimentoTipo(tipo);

        if (tipo === "avista") {
            updatePayload({
                ...payload,
                modo: "avista",
                regras: [
                    {
                        ordem: 1,
                        tipo_evento: "adesao",
                        offset_meses: 0,
                        percentual_comissao: percentualTotal,
                        descricao: "",
                        is_manual: false,
                    },
                ],
            });
            setParcelasPlanejadas(1);
            return;
        }

        const quantidade = Math.max(parcelasPlanejadas, 1);
        const regras: ComissaoRegra[] = gerarRegrasProporcionais({
            quantidadeParcelas: quantidade,
            percentualTotal,
            modo: "parcelado",
        }).map((regra) => ({
            ...regra,
            tipo_evento:
                regra.ordem === 1
                    ? ("primeira_cobranca_valida" as const)
                    : ("proxima_cobranca" as const),
        }));

        updatePayload({
            ...payload,
            modo: "parcelado",
            regras:
                tipo === "linear"
                    ? regras
                    : (payload.regras.length > 1 ? payload.regras : regras).map((regra, index) => ({
                          ...regra,
                          ordem: index + 1,
                          is_manual: true,
                      })),
        });
    };

    const regenerateLinearCronograma = () => {
        const quantidade = Math.max(parcelasPlanejadas, 1);
        const regras = gerarRegrasProporcionais({
            quantidadeParcelas: quantidade,
            percentualTotal,
            modo: payload.modo === "avista" ? "avista" : "parcelado",
        }).map((regra) => ({
            ...regra,
            tipo_evento:
                regra.ordem === 1
                    ? ("primeira_cobranca_valida" as const)
                    : ("proxima_cobranca" as const),
        }));

        updatePayload({
            ...payload,
            modo: quantidade === 1 ? "avista" : "parcelado",
            regras,
        });
    };

    const onRegraPercentualChange = (index: number, percentual: number) => {
        const regras = [...payload.regras];
        regras[index] = {
            ...regras[index],
            percentual_comissao: Number(percentual || 0),
            is_manual: true,
        };
        updatePayload({
            ...payload,
            regras:
                recebimentoTipo === "linear"
                    ? redistribuirRegrasAutomaticas({
                          regras,
                          percentualTotal,
                      })
                    : regras.map((regra, idx) => ({ ...regra, ordem: idx + 1 })),
        });
    };

    const onLiberarRegraAuto = (index: number) => {
        const regras = [...payload.regras];
        regras[index] = {
            ...regras[index],
            is_manual: false,
        };
        updatePayload({
            ...payload,
            regras: redistribuirRegrasAutomaticas({
                regras,
                percentualTotal,
            }),
        });
    };

    const updateParceiro = (index: number, patch: Partial<CotaComissaoParceiro>) => {
        const next = [...payload.parceiros];
        next[index] = {
            ...next[index],
            ...patch,
        };
        updatePayload({
            ...payload,
            parceiros: next,
        });
    };

    const addParceiro = () => {
        updatePayload({
            ...payload,
            parceiros: [
                ...payload.parceiros,
                {
                    parceiro_id: "",
                    percentual_parceiro: 0,
                    imposto_retido_pct: payload.imposto_padrao_pct ?? 10,
                    ativo: true,
                    observacoes: "",
                },
            ],
        });
    };

    const removeParceiro = (index: number) => {
        updatePayload({
            ...payload,
            parceiros: payload.parceiros.filter((_, currentIndex) => currentIndex !== index),
        });
    };

    const handleSaveConfig = () => {
        if (!contratoSelecionado?.cota_id) {
            toast.error("Selecione uma carta/cota valida antes de salvar.");
            return;
        }
        if (!distribuicaoValida) {
            toast.error("A soma das parcelas precisa fechar exatamente o percentual total da comissao.");
            return;
        }
        if (!parceirosValidos) {
            toast.error("O total configurado para parceiros nao pode ultrapassar a comissao total.");
            return;
        }

        startSaving(async () => {
            const result = await saveFinanceiroComissaoConfigAction(contratoSelecionado.cota_id!, payload);
            if (!result.ok) {
                toast.error(result.error || "Nao foi possivel salvar a configuracao comercial.");
                return;
            }

            toast.success(result.message || "Configuracao comercial salva.");
            router.refresh();
        });
    };

    const handleGenerateProjection = () => {
        if (!contratoSelecionado?.tem_contrato || !contratoSelecionado?.contrato_id) {
            toast.error("Selecione um contrato valido antes de gerar o cronograma.");
            return;
        }
        if (numeroContratoPendente) {
            toast.error("Cadastre o numero do contrato antes de gerar o cronograma definitivo.");
            return;
        }
        if (!distribuicaoValida || !parceirosValidos) {
            toast.error("Revise a distribuicao da comissao antes de gerar o cronograma.");
            return;
        }

        startProjecting(async () => {
            const saved = await saveFinanceiroComissaoConfigAction(contratoSelecionado.cota_id!, payload);
            if (!saved.ok) {
                toast.error(saved.error || "Nao foi possivel salvar a configuracao antes da previsao.");
                return;
            }

            const persist = await persistFinanceiroCronogramaAction(contratoSelecionado.contrato_id);
            if (!persist.ok) {
                toast.error(persist.error || "Nao foi possivel confirmar o cronograma operacional.");
                return;
            }

            const result = await generateFinanceiroProjectionAction(contratoSelecionado.contrato_id);
            if (result.ok) {
                setProjection(result.projection ?? null);
            }

            toast.success(
                persist.message ||
                    `Cronograma persistido com ${persist.pagamentos_processados || 0} parcelas operacionais.`,
            );
            router.refresh();
        });
    };

    const handlePagamentoStatus = (item: PagamentoItem, status: PagamentoStatus) => {
        startOperating(async () => {
            setBusyPagamentoId(item.id);
            const result = await updateFinanceiroPagamentoStatusAction(item, status);
            setBusyPagamentoId(null);
            if (!result.ok) {
                toast.error(result.error || "Nao foi possivel atualizar a parcela.");
                return;
            }
            toast.success(result.message || "Parcela atualizada com sucesso.");
            router.refresh();
        });
    };

    const handleSkipPagamento = (item: PagamentoItem) => {
        startOperating(async () => {
            setBusyPagamentoId(item.id);
            const result = await skipFinanceiroPagamentoAction(item.id);
            setBusyPagamentoId(null);
            if (!result.ok) {
                toast.error(result.error || "Nao foi possivel pular a competencia.");
                return;
            }
            toast.success(result.message || "Competencia pulada com sucesso.");
            router.refresh();
        });
    };

    const handleCancelFuture = (item: PagamentoItem) => {
        startOperating(async () => {
            setBusyPagamentoId(item.id);
            const result = await cancelFinanceiroFuturePaymentsAction(item.id);
            setBusyPagamentoId(null);
            if (!result.ok) {
                toast.error(result.error || "Nao foi possivel cancelar os recebimentos futuros.");
                return;
            }
            toast.success(result.message || "Recebimentos futuros cancelados.");
            router.refresh();
        });
    };

    const handleUpdateContractNumber = () => {
        if (!contratoSelecionado?.tem_contrato || !contratoSelecionado?.contrato_id) {
            toast.error("Selecione um contrato antes de atualizar o numero.");
            return;
        }
        if (!(contractNumber || "").trim()) {
            toast.error("Informe o numero do contrato.");
            return;
        }

        startUpdatingNumber(async () => {
            const result = await updateFinanceiroContratoNumeroAction(contratoSelecionado.contrato_id, contractNumber);
            if (!result.ok) {
                toast.error(result.error || "Nao foi possivel atualizar o numero do contrato.");
                return;
            }

            toast.success(result.message || "Numero do contrato atualizado.");
            router.refresh();
        });
    };

    if (!contratos.length || !contratoSelecionado) {
        return (
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-sm text-slate-400">
                Nenhuma carta/contrato elegivel para operacao de comissao nesta organizacao.
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <section className="grid gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.45)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="grid gap-2">
                        <Badge className="w-fit border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-300">
                            Operacao de comissao
                        </Badge>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-white">Carta vendida, comissao configurada e cronograma previsto</h1>
                            <p className="max-w-4xl text-sm leading-6 text-slate-400">
                                Selecione a carta, ajuste a regra comercial, modele o recebimento e confirme a previsao operacional
                                antes dos lancamentos financeiros reais por competencia.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {contratoSelecionado.tem_contrato ? (
                            <Link
                                href={`/app/comissoes?contrato_id=${contratoSelecionado.contrato_id}`}
                                className="inline-flex h-11 items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                            >
                                Ver comissao gerada
                            </Link>
                        ) : (
                            <div className="inline-flex h-11 items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-slate-400">
                                Sem contrato cadastrado
                            </div>
                        )}
                    </div>
                </div>

                <form action={selectedActionHref} className="grid gap-3 md:max-w-2xl">
                    <label className="grid gap-2 text-sm text-slate-200">
                        <span>Carta / contrato</span>
                        <select
                            name="contrato_id"
                            defaultValue={selectedContratoId}
                            className="h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none"
                        >
                            {contratos.map((contrato, index) => (
                                <option key={`${contrato.selection_id}-${index}`} value={contrato.selection_id}>
                                    {((contrato.tem_contrato ? contrato.contrato_numero || "Numero pendente" : "Sem contrato") || "Numero pendente") +
                                        " - " +
                                        (contrato.cliente_nome || "Cliente sem nome") +
                                        " - Cota " +
                                        (contrato.numero_cota || "-")}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div>
                        <Button type="submit" variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]">
                            Carregar carta
                        </Button>
                    </div>
                </form>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <ContextCard
                        icon={UserRound}
                        label="Cliente"
                        value={contratoSelecionado.cliente_nome || "Cliente sem nome"}
                        description={`Contrato ${contratoSelecionado.contrato_numero || "pendente"} • Cota ${contratoSelecionado.numero_cota || "-"}`}
                    />
                    <ContextCard
                        icon={Landmark}
                        label="Carta"
                        value={formatMoney(valorCarta)}
                        description={`Grupo ${contratoSelecionado.grupo_codigo || "-"} • ${contratoSelecionado.administradora_nome || "Administradora nao informada"}`}
                    />
                    <ContextCard
                        icon={ReceiptText}
                        label="Status"
                        value={labelStatus(contratoSelecionado.contrato_status)}
                        description={`Cota ${labelStatus(contratoSelecionado.cota_status)}`}
                    />
                    <ContextCard
                        icon={BadgePercent}
                        label="Comissao atual"
                        value={
                            contratoSelecionado.possui_comissao_ativa
                                ? `${Number(contratoSelecionado.percentual_comissao || 0).toFixed(4)}%`
                                : "Nao configurada"
                        }
                        description={
                            contratoSelecionado.parceiro_vinculado
                                ? `Parceiro ${contratoSelecionado.parceiro_nome || "vinculado"} • ${Number(contratoSelecionado.parceiro_percentual || 0).toFixed(4)}%`
                                : "Venda direta para a organizacao"
                        }
                    />
                </div>

                {numeroContratoPendente ? (
                    <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-50">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div className="grid gap-1">
                                <p className="inline-flex items-center gap-2 text-sm font-semibold">
                                    <AlertTriangle className="h-4 w-4" />
                                    Numero de contrato pendente
                                </p>
                                <p className="max-w-2xl text-sm text-amber-50/80">
                                    {contratoSelecionado.tem_contrato
                                        ? "A carta pode entrar na selecao, mas o cronograma definitivo so deve ser confirmado depois do cadastro do numero do contrato."
                                        : "A carta ja aparece na selecao mesmo sem contrato cadastrado. Salve a configuracao da comissao, mas cadastre o contrato antes da projeção definitiva e dos lancamentos reais."}
                                </p>
                            </div>

                            {contratoSelecionado.tem_contrato ? (
                                <div className="grid w-full gap-3 lg:max-w-xl lg:grid-cols-[1fr_auto]">
                                    <Input
                                        value={contractNumber}
                                        onChange={(event) => setContractNumber(event.target.value)}
                                        placeholder="Informe o numero do contrato"
                                        className="h-11 border-amber-300/20 bg-black/20 text-white"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleUpdateContractNumber}
                                        disabled={isUpdatingNumber}
                                        className="h-11 bg-white text-slate-950 hover:bg-white/90"
                                    >
                                        {isUpdatingNumber ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Salvar numero
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <section className="grid gap-5 rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.45)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="grid gap-1">
                            <h2 className="text-lg font-semibold text-white">Configuracao comercial da carta</h2>
                            <p className="text-sm text-slate-400">
                                Modele a comissao total, o cronograma de recebimento e o repasse do parceiro sem depender do
                                lancamento manual de parcelas financeiras.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                                onClick={handleSaveConfig}
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Salvar configuracao
                            </Button>
                            <Button
                                type="button"
                                className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                onClick={handleGenerateProjection}
                                disabled={isProjecting || !contratoSelecionado.tem_contrato || numeroContratoPendente}
                            >
                                {isProjecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Confirmar cronograma operacional
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-3">
                        <MetricCard label="Comissao total" value={formatMoney(totalComissaoBruta)} helper={`${percentualTotal.toFixed(4)}% sobre a carta`} icon={CircleDollarSign} />
                        <MetricCard label="Liquido empresa" value={formatMoney(totaisPreview.empresaLiquida)} helper={`${saldoParceiro.toFixed(4)}% reservado para a empresa`} icon={WalletCards} />
                        <MetricCard label="Liquido parceiro" value={formatMoney(totaisPreview.parceiroLiquido)} helper={`${percentualParceiros.toFixed(4)}% em repasses ativos`} icon={HandCoins} />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                        <FieldShell label="Comissao total %" hint="Percentual bruto calculado sobre o valor da carta.">
                            <Input
                                type="number"
                                step="0.0001"
                                min={0}
                                value={payload.percentual_total}
                                onChange={(event) => {
                                    const nextTotal = Number(event.target.value || 0);
                                    const nextPayload = {
                                        ...payload,
                                        percentual_total: nextTotal,
                                    };
                                    if (nextPayload.regras.length) {
                                        nextPayload.regras = redistribuirRegrasAutomaticas({
                                            regras: nextPayload.regras,
                                            percentualTotal: nextTotal,
                                        });
                                    }
                                    updatePayload(nextPayload);
                                }}
                            />
                        </FieldShell>

                        <FieldShell label="Regra inicial da competencia" hint="Controla o ponto de partida do cronograma previsto.">
                            <select
                                className="h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none"
                                value={payload.primeira_competencia_regra}
                                onChange={(event) =>
                                    updatePayload({
                                        ...payload,
                                        primeira_competencia_regra: event.target.value as CotaComissaoPayload["primeira_competencia_regra"],
                                    })
                                }
                            >
                                <option value="mes_adesao">Mes da adesao</option>
                                <option value="primeira_cobranca_valida">Primeira cobranca valida</option>
                                <option value="manual">Manual</option>
                            </select>
                        </FieldShell>

                        <FieldShell label="Imposto padrao do parceiro %" hint="Base sugerida para repasse do parceiro.">
                            <Input
                                type="number"
                                step="0.01"
                                min={0}
                                value={payload.imposto_padrao_pct}
                                onChange={(event) =>
                                    updatePayload({
                                        ...payload,
                                        imposto_padrao_pct: Number(event.target.value || 0),
                                    })
                                }
                            />
                        </FieldShell>

                        <FieldShell label="Observacoes da configuracao" hint="Contexto comercial da carta para a operacao.">
                            <Textarea
                                rows={3}
                                value={payload.observacoes || ""}
                                onChange={(event) =>
                                    updatePayload({
                                        ...payload,
                                        observacoes: event.target.value,
                                    })
                                }
                                placeholder="Ex.: comissao Porto com recebimento em 10 parcelas apos alocacao."
                                className="rounded-2xl border-white/10 bg-slate-950 text-white"
                            />
                        </FieldShell>
                    </div>

                    <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-semibold text-white">Tipo de recebimento</h3>
                                <p className="text-sm text-slate-400">
                                    Escolha se a comissao entra a vista, parcelada linearmente ou em parcelas manuais/variaveis.
                                </p>
                            </div>
                            <Tabs value={recebimentoTipo} onValueChange={(value) => applyRecebimentoTipo(value as RecebimentoComissaoTipo)}>
                                <TabsList className="h-11 rounded-2xl bg-slate-950/80 p-1">
                                    <TabsTrigger value="avista" className="rounded-xl px-4">A vista</TabsTrigger>
                                    <TabsTrigger value="linear" className="rounded-xl px-4">Parcelado linear</TabsTrigger>
                                    <TabsTrigger value="variavel" className="rounded-xl px-4">Parcelado variavel</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {recebimentoTipo !== "avista" ? (
                            <div className="grid gap-4 md:grid-cols-[0.65fr_auto]">
                                <FieldShell
                                    label="Quantidade de parcelas"
                                    hint="Usado para gerar o cronograma linear ou como base inicial do cronograma manual."
                                >
                                    <Input
                                        type="number"
                                        min={1}
                                        value={parcelasPlanejadas}
                                        onChange={(event) => setParcelasPlanejadas(Math.max(Number(event.target.value || 1), 1))}
                                    />
                                </FieldShell>
                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-12 w-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                                        onClick={regenerateLinearCronograma}
                                    >
                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                        Regerar cronograma
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {!distribuicaoValida || !parceirosValidos ? (
                        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                            {!distribuicaoValida ? (
                                <p>A soma das parcelas precisa fechar exatamente o percentual total da comissao.</p>
                            ) : null}
                            {!parceirosValidos ? (
                                <p>O total reservado para parceiros nao pode ultrapassar a comissao total da carta.</p>
                            ) : null}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                            Configuracao consistente para salvar e confirmar o cronograma previsto.
                        </div>
                    )}

                    <ParcelasComissaoTable
                        regras={payload.regras}
                        valorBase={valorCarta}
                        onPercentualChange={onRegraPercentualChange}
                        onLiberarAuto={onLiberarRegraAuto}
                    />

                    <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-semibold text-white">Parceiro e repasse</h3>
                                <p className="text-sm text-slate-400">
                                    Se houver parceiro na venda, distribua a parcela da comissao, imposto e liquido por parceiro.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                                onClick={addParceiro}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar parceiro
                            </Button>
                        </div>

                        {payload.parceiros.length ? (
                            <div className="grid gap-3">
                                {payload.parceiros.map((item, index) => (
                                    <ComissaoParceiroRow
                                        key={`${item.id || item.parceiro_id || "novo"}-${index}`}
                                        item={item}
                                        parceiros={parceirosDisponiveis}
                                        onChange={(patch) => updateParceiro(index, patch)}
                                        onRemove={() => removeParceiro(index)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-5 text-sm text-slate-400">
                                Nenhum parceiro configurado. A venda sera tratada como 100% da organizacao.
                            </div>
                        )}
                    </div>
                </section>

                <section className="grid gap-5 rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.45)]">
                    <div className="grid gap-1">
                        <h2 className="text-lg font-semibold text-white">Pre-visualizacao operacional</h2>
                        <p className="text-sm text-slate-400">
                            Veja como a comissao se divide por parcela, parceiro e empresa antes de seguir para o motor financeiro.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <MetricCard label="Bruto do parceiro" value={formatMoney(totaisPreview.parceiroBruto)} helper="Soma das parcelas repassadas" icon={HandCoins} />
                        <MetricCard label="Imposto parceiro" value={formatMoney(totaisPreview.parceiroImposto)} helper="Retencao prevista sobre o repasse" icon={ShieldCheck} />
                        <MetricCard label="Liquido do parceiro" value={formatMoney(totaisPreview.parceiroLiquido)} helper="Valor liquido do parceiro" icon={WalletCards} />
                        <MetricCard label="Liquido da empresa" value={formatMoney(totaisPreview.empresaLiquida)} helper="Comissao liquida da organizacao" icon={CircleDollarSign} />
                    </div>

                    <CronogramaPreviewTable items={cronogramaPreview} />

                    <div className="grid gap-4 md:grid-cols-4">
                        <MetricCard label="Previsto" value={formatMoney(totaisOperacionais.previsto)} helper={`${totaisOperacionais.previstoCount} parcelas em aberto`} icon={ReceiptText} />
                        <MetricCard label="Pago" value={formatMoney(totaisOperacionais.pago)} helper={`${totaisOperacionais.pagoCount} parcelas confirmadas`} icon={ClipboardCheck} />
                        <MetricCard label="Inadimplente" value={formatMoney(totaisOperacionais.inadimplente)} helper={`${totaisOperacionais.inadimplenteCount} parcelas bloqueadas`} icon={AlertTriangle} />
                        <MetricCard label="Cancelado" value={formatMoney(totaisOperacionais.cancelado)} helper={`${totaisOperacionais.canceladoCount} parcelas interrompidas`} icon={ArrowRightLeft} />
                    </div>

                    {projection ? (
                        <div className="grid gap-3 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-100">
                            <div className="flex items-start justify-between gap-3">
                                <div className="grid gap-1">
                                    <p className="text-sm font-semibold">Cronograma previsto confirmado</p>
                                    <p className="text-sm text-emerald-100/80">
                                        {projection.detail || "A previsao usa a configuracao salva da carta e mostra os lancamentos previstos antes da execucao por competencia."}
                                    </p>
                                </div>
                                <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0" />
                            </div>
                            <div className="grid gap-2 text-sm text-emerald-100/80">
                                <p>Lancamentos projetados: {projection.lancamentos?.length || 0}</p>
                                <p>Fluxo: preview seguro + cronograma operacional persistido por pagamento.</p>
                            </div>
                        </div>
                    ) : null}

                    <Tabs defaultValue="operacao" className="gap-4">
                        <TabsList className="h-11 rounded-2xl bg-slate-950/80 p-1">
                            <TabsTrigger value="operacao" className="rounded-xl px-4">Operacao mensal</TabsTrigger>
                            <TabsTrigger value="gerados" className="rounded-xl px-4">Lancamentos reais</TabsTrigger>
                            <TabsTrigger value="projecao" className="rounded-xl px-4">Projecao</TabsTrigger>
                            <TabsTrigger value="resumo" className="rounded-xl px-4">Resumo financeiro</TabsTrigger>
                            <TabsTrigger value="timeline" className="rounded-xl px-4">Timeline</TabsTrigger>
                        </TabsList>

                        <TabsContent value="operacao" className="grid gap-4">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                                O cronograma confirmado vira a operacao mensal da carta. A equipe so atua nas excecoes:
                                marcar pago, marcar inadimplente, cancelar futuros ou pular a proxima competencia quando
                                nao houver assembleia e o ciclo financeiro precisar ser empurrado para frente.
                            </div>
                            <CronogramaOperacionalTable
                                pagamentos={pagamentos}
                                busyPagamentoId={busyPagamentoId}
                                onStatusChange={handlePagamentoStatus}
                                onSkip={handleSkipPagamento}
                                onCancelFuture={handleCancelFuture}
                            />
                        </TabsContent>

                        <TabsContent value="gerados" className="grid gap-3">
                            {lancamentos.length ? (
                                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
                                    <div className="grid grid-cols-[0.7fr_1fr_0.9fr_0.8fr_1fr] gap-3 border-b border-white/10 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                                        <span>Parcela</span>
                                        <span>Beneficiario</span>
                                        <span>Status</span>
                                        <span>Competencia</span>
                                        <span>Valor</span>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {lancamentos.map((item, index) => (
                                            <div key={item.id || `${item.ordem}-${item.beneficiario_tipo}-${item.competencia_prevista || "sem-competencia"}-${index}`} className="grid grid-cols-[0.7fr_1fr_0.9fr_0.8fr_1fr] gap-3 px-4 py-4 text-sm text-slate-200">
                                                <span>#{item.ordem}</span>
                                                <span>{item.beneficiario_tipo === "parceiro" ? item.parceiros_corretores?.nome || "Parceiro" : "Empresa"}</span>
                                                <span>{item.status}</span>
                                                <span>{item.competencia_prevista || "-"}</span>
                                                <span>{formatMoney(item.valor_liquido)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <EmptyBlock text="Ainda nao existem lancamentos financeiros gerados por competencia para este contrato." />
                            )}
                        </TabsContent>

                        <TabsContent value="projecao" className="grid gap-3">
                            {projection?.lancamentos?.length ? (
                                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
                                    <div className="grid grid-cols-[0.7fr_1fr_0.9fr_0.9fr_1fr] gap-3 border-b border-white/10 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                                        <span>Parcela</span>
                                        <span>Beneficiario</span>
                                        <span>Status previsto</span>
                                        <span>Competencia</span>
                                        <span>Valor</span>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {projection.lancamentos.map((item, index) => (
                                            <div
                                                key={item.id || `${item.ordem}-${item.beneficiario_tipo}-${item.competencia_prevista || "sem-competencia"}-${index}`}
                                                className="grid grid-cols-[0.7fr_1fr_0.9fr_0.9fr_1fr] gap-3 px-4 py-4 text-sm text-slate-200"
                                            >
                                                <span>#{item.ordem}</span>
                                                <span>{item.beneficiario_tipo === "parceiro" ? item.parceiros_corretores?.nome || "Parceiro" : "Empresa"}</span>
                                                <span>{item.status}</span>
                                                <span>{item.competencia_prevista || "-"}</span>
                                                <span>{formatMoney(item.valor_liquido)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <EmptyBlock
                                    text={
                                        contratoSelecionado.tem_contrato
                                            ? "Nenhuma projeção confirmada ainda. Use 'Confirmar cronograma previsto' para visualizar o prospectado mes a mes."
                                            : "Sem contrato cadastrado nesta carta. A tela mostra a configuracao e o preview local, mas a projeção operacional do backend precisa de um contrato."
                                    }
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="resumo" className="grid gap-3">
                            {resumoFinanceiro ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <MetricCard
                                        label="Total bruto"
                                        value={formatMoney(resumoFinanceiro.totais.total_bruto)}
                                        helper={`${resumoFinanceiro.quantidades.lancamentos} lancamentos no total`}
                                        icon={CircleDollarSign}
                                    />
                                    <MetricCard
                                        label="Total liquido parceiro"
                                        value={formatMoney(resumoFinanceiro.totais.parceiro.liquido)}
                                        helper={`Impostos ${formatMoney(resumoFinanceiro.totais.parceiro.imposto)}`}
                                        icon={HandCoins}
                                    />
                                    <MetricCard
                                        label="Total liquido empresa"
                                        value={formatMoney(resumoFinanceiro.totais.empresa.liquido)}
                                        helper="Valor consolidado da organizacao"
                                        icon={WalletCards}
                                    />
                                    <MetricCard
                                        label="Repasses"
                                        value={`${resumoFinanceiro.quantidades.por_repasse_status.pendente ?? 0} pendentes`}
                                        helper={`${resumoFinanceiro.quantidades.por_repasse_status.pago ?? 0} pagos`}
                                        icon={ShieldCheck}
                                    />
                                </div>
                            ) : (
                                <EmptyBlock
                                    text={
                                        contratoSelecionado.tem_contrato
                                            ? "Resumo financeiro ainda indisponivel ou sem lançamentos reais para este contrato."
                                            : "Sem contrato cadastrado nesta carta. O resumo financeiro real aparece depois que o contrato existir e o motor processar competências."
                                    }
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="timeline" className="grid gap-3">
                            {timeline?.items?.length ? (
                                <div className="grid gap-3">
                                    {timeline.items.map((item, index) => (
                                        <div key={`${item.tipo}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{item.titulo}</p>
                                                    <p className="text-xs text-slate-400">{item.tipo} • {item.data_ref || item.timestamp || "-"}</p>
                                                </div>
                                                <Badge variant="outline" className="border-white/10 text-slate-300">
                                                    {item.tipo}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyBlock
                                    text={
                                        contratoSelecionado.tem_contrato
                                            ? "Timeline ainda sem eventos financeiros ou de comissao para este contrato."
                                            : "Sem contrato cadastrado nesta carta. A timeline operacional passa a existir depois do vínculo contratual."
                                    }
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </section>
            </div>
        </div>
    );
}

function normalizeComissaoPayload(response: CotaComissaoResponse | null): CotaComissaoPayload {
    const config = response?.config;
    const regras = response?.regras ?? [];
    const parceiros = response?.parceiros ?? [];

    if (!config) {
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
                    tipo_evento: "adesao" as const,
                    offset_meses: 0,
                    percentual_comissao: 0,
                    descricao: "",
                    is_manual: false,
                },
            ],
            parceiros: [],
        };
    }

    return {
        ...config,
        regras: regras.length
            ? regras.map((item) => ({
                  ...item,
                  percentual_comissao: Number(item.percentual_comissao || 0),
              }))
            : [
                  {
                      ordem: 1,
                      tipo_evento: "adesao" as const,
                      offset_meses: 0,
                      percentual_comissao: Number(config.percentual_total || 0),
                      descricao: "",
                      is_manual: false,
                  },
              ],
        parceiros: parceiros.map((item) => ({
            ...item,
            percentual_parceiro: Number(item.percentual_parceiro || 0),
            imposto_retido_pct: Number(item.imposto_retido_pct || 0),
        })),
    };
}

function inferRecebimentoTipo(payload: CotaComissaoPayload): RecebimentoComissaoTipo {
    if (payload.modo === "avista" || payload.regras.length <= 1) {
        return "avista";
    }
    const percentuais = payload.regras.map((item) => Number(item.percentual_comissao || 0).toFixed(4));
    return new Set(percentuais).size === 1 && !payload.regras.some((item) => item.is_manual) ? "linear" : "variavel";
}

function buildCronogramaPreview(payload: CotaComissaoPayload, valorCarta: number): FinanceiroCronogramaPreviewItem[] {
    const totalPercentual = Number(payload.percentual_total || 0);
    const parceirosAtivos = payload.parceiros.filter((item) => item.ativo);
    const totalParceiro = parceirosAtivos.reduce((acc, item) => acc + Number(item.percentual_parceiro || 0), 0);
    const partnerRatio = totalPercentual > 0 ? totalParceiro / totalPercentual : 0;
    const partnerTaxRatio =
        totalParceiro > 0
            ? parceirosAtivos.reduce((acc, item) => {
                  const percentual = Number(item.percentual_parceiro || 0);
                  const imposto = Number(item.imposto_retido_pct || 0);
                  return acc + percentual * (imposto / 100);
              }, 0) / totalParceiro
            : 0;

    return payload.regras.map((regra) => {
        const percentualComissao = Number(regra.percentual_comissao || 0);
        const valorTotal = round2(valorCarta * (percentualComissao / 100));
        const parceiroBruto = round2(valorTotal * partnerRatio);
        const parceiroImposto = round2(parceiroBruto * partnerTaxRatio);
        const parceiroLiquido = round2(parceiroBruto - parceiroImposto);
        const empresaLiquida = round2(valorTotal - parceiroBruto);

        return {
            ordem: regra.ordem,
            tipo_evento: regra.tipo_evento,
            offset_meses: regra.offset_meses,
            percentual_comissao: percentualComissao,
            valor_total: valorTotal,
            parceiro_bruto: parceiroBruto,
            parceiro_imposto: parceiroImposto,
            parceiro_liquido: parceiroLiquido,
            empresa_liquida: empresaLiquida,
        };
    });
}

function summarizeCronograma(items: FinanceiroCronogramaPreviewItem[]) {
    return items.reduce(
        (acc, item) => {
            acc.parceiroBruto += item.parceiro_bruto;
            acc.parceiroImposto += item.parceiro_imposto;
            acc.parceiroLiquido += item.parceiro_liquido;
            acc.empresaLiquida += item.empresa_liquida;
            return acc;
        },
        {
            parceiroBruto: 0,
            parceiroImposto: 0,
            parceiroLiquido: 0,
            empresaLiquida: 0,
        },
    );
}

function summarizePagamentosOperacionais(items: PagamentoItem[]) {
    return items.reduce(
        (acc, item) => {
            const valor = Number(item.valor || 0);
            switch (item.status) {
                case "pago":
                    acc.pago += valor;
                    acc.pagoCount += 1;
                    break;
                case "inadimplente":
                    acc.inadimplente += valor;
                    acc.inadimplenteCount += 1;
                    break;
                case "cancelado":
                    acc.cancelado += valor;
                    acc.canceladoCount += 1;
                    break;
                default:
                    acc.previsto += valor;
                    acc.previstoCount += 1;
                    break;
            }
            return acc;
        },
        {
            previsto: 0,
            previstoCount: 0,
            pago: 0,
            pagoCount: 0,
            inadimplente: 0,
            inadimplenteCount: 0,
            cancelado: 0,
            canceladoCount: 0,
        },
    );
}

function ContextCard({
    icon: Icon,
    label,
    value,
    description,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="grid gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                <Icon className="h-3.5 w-3.5 text-emerald-300" />
                {label}
            </div>
            <p className="text-sm font-medium text-white">{value}</p>
            <p className="text-sm text-slate-400">{description}</p>
        </div>
    );
}

function FieldShell({
    label,
    hint,
    children,
}: {
    label: string;
    hint: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <div className="grid gap-1">
                <label className="text-sm font-medium text-slate-200">{label}</label>
                <p className="text-xs text-slate-500">{hint}</p>
            </div>
            {children}
        </div>
    );
}

function MetricCard({
    label,
    value,
    helper,
    icon: Icon,
}: {
    label: string;
    value: string;
    helper: string;
    icon: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className="grid gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                <Icon className="h-3.5 w-3.5 text-emerald-300" />
                {label}
            </div>
            <p className="text-lg font-semibold text-white">{value}</p>
            <p className="text-xs text-slate-500">{helper}</p>
        </div>
    );
}

function EmptyBlock({ text }: { text: string }) {
    return <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">{text}</div>;
}

function labelStatus(value?: string | null) {
    if (!value) return "Nao informado";
    return value.replaceAll("_", " ");
}

function formatMoney(value?: string | number | null) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(Number(value || 0));
}

function round2(value: number) {
    return Math.round(value * 100) / 100;
}
