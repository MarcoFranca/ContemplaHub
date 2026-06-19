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
  ReceiptText,
  Settings2,
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
import { ComissaoConfigSection } from "@/app/app/lances/components/comissao/ComissaoConfigSection";
import { ContratoSearchSelect } from "./ContratoSearchSelect";
import { ComissaoStatusBadge, RepasseStatusBadge } from "@/app/app/comissoes/components/status-badges";
import type { CotaComissaoPayload, CotaComissaoResponse } from "@/app/app/lances/types";

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
} from "../types";
import { CronogramaOperacionalTable } from "./CronogramaOperacionalTable";
import { CronogramaPreviewTable } from "./CronogramaPreviewTable";

type Props = FinanceiroComissaoWorkspaceData;

const fmt = (v?: string | number | null) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

const fmtDate = (v?: string | null) => {
  if (!v) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(v.includes("T") ? v : `${v}T12:00:00`));
  } catch {
    return v;
  }
};

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
  basePath = "/app/financeiro/pagamentos",
  showCartaSelector = true,
}: Props & { basePath?: string; showCartaSelector?: boolean }) {
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

  const valorCarta = Number(contratoSelecionado?.valor_carta || 0);
  const percentualTotal = Number(payload.percentual_total || 0);
  const totalComissaoBruta = round2(valorCarta * (percentualTotal / 100));
  const totalDistribuido = payload.regras.reduce(
    (s, r) => s + Number(r.percentual_comissao || 0), 0
  );
  const percentualParceiros = payload.parceiros
    .filter((p) => p.ativo)
    .reduce((s, p) => s + Number(p.percentual_parceiro || 0), 0);
  const saldoParceiro = Number((percentualTotal - percentualParceiros).toFixed(4));

  const cronogramaPreview = useMemo(
    () => buildCronogramaPreview(payload, valorCarta),
    [payload, valorCarta]
  );
  const totaisPreview = useMemo(() => summarizeCronograma(cronogramaPreview), [cronogramaPreview]);
  const totaisOperacionais = useMemo(
    () => summarizePagamentosOperacionais(pagamentos),
    [pagamentos]
  );

  const distribuicaoValida = Math.abs(totalDistribuido - percentualTotal) < 0.0001;
  const parceirosValidos = saldoParceiro >= -0.0001;
  const numeroContratoPendente = !(contractNumber || "").trim();

  const updatePayload = (next: CotaComissaoPayload) => {
    setPayload(next);
    setProjection(null);
  };

  const handleSaveConfig = () => {
    if (!contratoSelecionado?.cota_id) {
      toast.error("Selecione uma carta/cota válida antes de salvar.");
      return;
    }
    if (!distribuicaoValida) {
      toast.error("A soma das parcelas precisa fechar exatamente o percentual total da comissão.");
      return;
    }
    if (!parceirosValidos) {
      toast.error("O total configurado para parceiros não pode ultrapassar a comissão total.");
      return;
    }
    startSaving(async () => {
      const result = await saveFinanceiroComissaoConfigAction(contratoSelecionado.cota_id!, payload);
      if (!result.ok) {
        toast.error(result.error || "Não foi possível salvar a configuração comercial.");
        return;
      }
      toast.success(result.message || "Configuração comercial salva.");
      router.refresh();
    });
  };

  const handleGenerateProjection = () => {
    if (!contratoSelecionado?.tem_contrato || !contratoSelecionado?.contrato_id) {
      toast.error("Selecione um contrato válido antes de gerar o cronograma.");
      return;
    }
    if (numeroContratoPendente) {
      toast.error("Cadastre o número do contrato antes de confirmar o cronograma.");
      return;
    }
    if (!distribuicaoValida || !parceirosValidos) {
      toast.error("Revise a distribuição da comissão antes de gerar o cronograma.");
      return;
    }
    startProjecting(async () => {
      const saved = await saveFinanceiroComissaoConfigAction(
        contratoSelecionado.cota_id!, payload
      );
      if (!saved.ok) {
        toast.error(saved.error || "Não foi possível salvar a configuração antes da previsão.");
        return;
      }
      const persist = await persistFinanceiroCronogramaAction(contratoSelecionado.contrato_id);
      if (!persist.ok) {
        toast.error(persist.error || "Não foi possível confirmar o cronograma operacional.");
        return;
      }
      const result = await generateFinanceiroProjectionAction(contratoSelecionado.contrato_id);
      if (result.ok) setProjection(result.projection ?? null);
      toast.success(
        persist.message ||
          `Cronograma persistido com ${persist.pagamentos_processados || 0} parcelas operacionais.`
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
        toast.error(result.error || "Não foi possível atualizar a parcela.");
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
        toast.error(result.error || "Não foi possível pular a competência.");
        return;
      }
      toast.success(result.message || "Competência pulada com sucesso.");
      router.refresh();
    });
  };

  const handleCancelFuture = (item: PagamentoItem) => {
    startOperating(async () => {
      setBusyPagamentoId(item.id);
      const result = await cancelFinanceiroFuturePaymentsAction(item.id);
      setBusyPagamentoId(null);
      if (!result.ok) {
        toast.error(result.error || "Não foi possível cancelar os recebimentos futuros.");
        return;
      }
      toast.success(result.message || "Recebimentos futuros cancelados.");
      router.refresh();
    });
  };

  const handleUpdateContractNumber = () => {
    if (!contratoSelecionado?.tem_contrato || !contratoSelecionado?.contrato_id) {
      toast.error("Selecione um contrato antes de atualizar o número.");
      return;
    }
    if (!(contractNumber || "").trim()) {
      toast.error("Informe o número do contrato.");
      return;
    }
    startUpdatingNumber(async () => {
      const result = await updateFinanceiroContratoNumeroAction(
        contratoSelecionado.contrato_id,
        contractNumber
      );
      if (!result.ok) {
        toast.error(result.error || "Não foi possível atualizar o número do contrato.");
        return;
      }
      toast.success(result.message || "Número do contrato atualizado.");
      router.refresh();
    });
  };

  if (!contratos.length || !contratoSelecionado) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-sm text-slate-400">
        Nenhuma carta/contrato elegível para operação de comissão nesta organização.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* ── Header: seletor de carta + contexto ── */}
      <section className="grid gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-2">
            <Badge className="w-fit border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-300">
              Regra comercial · por carta
            </Badge>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                Configuração de Comissão por Carta
              </h1>
              <p className="mt-0.5 max-w-2xl text-sm text-slate-400">
                Configure a regra de comissão, visualize o cronograma previsto e opere as parcelas mensais.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/app/comissoes"
              className="inline-flex h-9 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
            >
              ← Comissões
            </Link>
            {contratoSelecionado.tem_contrato && (
              <Link
                href={`/app/comissoes?contrato_id=${contratoSelecionado.contrato_id}`}
                className="inline-flex h-9 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white transition hover:bg-white/[0.08]"
              >
                Ver lançamentos →
              </Link>
            )}
          </div>
        </div>

        {/* Seletor de carta (com busca) — oculto quando a tela já é de um cliente só */}
        {showCartaSelector && (
          <div className="max-w-xl">
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Carta / cliente
            </label>
            <ContratoSearchSelect
              contratos={contratos}
              selectedId={selectedContratoId}
              basePath={basePath}
            />
          </div>
        )}

        {/* Cards de contexto */}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ContextCard
            icon={UserRound}
            label="Cliente"
            value={contratoSelecionado.cliente_nome || "Sem nome"}
            description={`Contrato ${contratoSelecionado.contrato_numero || "pendente"} · Cota ${contratoSelecionado.numero_cota || "—"}`}
          />
          <ContextCard
            icon={Landmark}
            label="Carta"
            value={fmt(valorCarta)}
            description={`Grupo ${contratoSelecionado.grupo_codigo || "—"} · ${contratoSelecionado.administradora_nome || "Administradora não informada"}`}
          />
          <ContextCard
            icon={ReceiptText}
            label="Status"
            value={labelStatus(contratoSelecionado.contrato_status)}
            description={`Cota ${labelStatus(contratoSelecionado.cota_status)}`}
          />
          <ContextCard
            icon={BadgePercent}
            label="Comissão atual"
            value={
              contratoSelecionado.possui_comissao_ativa
                ? `${Number(contratoSelecionado.percentual_comissao || 0).toFixed(4)}%`
                : "Não configurada"
            }
            description={
              contratoSelecionado.parceiro_vinculado
                ? `Parceiro ${contratoSelecionado.parceiro_nome || "vinculado"} · ${Number(contratoSelecionado.parceiro_percentual || 0).toFixed(4)}%`
                : "Venda direta para a organização"
            }
          />
        </div>

        {/* Aviso de número de contrato pendente */}
        {numeroContratoPendente && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="grid gap-1">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-100">
                  <AlertTriangle className="h-4 w-4" />
                  Número de contrato pendente
                </p>
                <p className="max-w-2xl text-sm text-amber-100/80">
                  {contratoSelecionado.tem_contrato
                    ? "Cadastre o número do contrato antes de confirmar o cronograma definitivo."
                    : "Salve a configuração da comissão, mas cadastre o contrato antes da projeção operacional."}
                </p>
              </div>
              {contratoSelecionado.tem_contrato && (
                <div className="flex w-full gap-2 lg:max-w-sm">
                  <Input
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    placeholder="Número do contrato"
                    className="h-10 border-amber-300/20 bg-black/20 text-white"
                  />
                  <Button
                    type="button"
                    onClick={handleUpdateContractNumber}
                    disabled={isUpdatingNumber}
                    className="h-10 bg-white text-slate-950 hover:bg-white/90"
                  >
                    {isUpdatingNumber && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Corpo: Configuração (esq) + Visualização (dir) ── */}
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">

        {/* ── Coluna esquerda: Configuração comercial ── */}
        <section className="grid gap-5 rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.45)]">

          {/* Cabeçalho + botões de ação */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Configuração comercial</h2>
              <p className="mt-0.5 text-sm text-slate-400">
                Modele a comissão, o cronograma de recebimento e o repasse do parceiro.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                onClick={handleSaveConfig}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar regra
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                onClick={handleGenerateProjection}
                disabled={
                  isProjecting || !contratoSelecionado.tem_contrato || numeroContratoPendente
                }
                title={
                  pagamentos.length > 0
                    ? "Reprocessa o cronograma com a regra atual. Parcelas já operadas não são afetadas."
                    : "Confirma o cronograma e gera as parcelas operacionais."
                }
              >
                {isProjecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {pagamentos.length > 0 ? "Reprocessar cronograma" : "Confirmar cronograma"}
              </Button>
            </div>
          </div>

          {/* Métricas resumo */}
          <div className="grid gap-3 md:grid-cols-3">
            <MetricCard
              label="Comissão total"
              value={fmt(totalComissaoBruta)}
              helper={`${percentualTotal.toFixed(4)}% sobre a carta`}
              icon={CircleDollarSign}
            />
            <MetricCard
              label="Líquido empresa"
              value={fmt(totaisPreview.empresaLiquida)}
              helper={`${saldoParceiro.toFixed(4)}% reservado para a empresa`}
              icon={WalletCards}
            />
            <MetricCard
              label="Líquido parceiro"
              value={fmt(totaisPreview.parceiroLiquido)}
              helper={`${percentualParceiros.toFixed(4)}% em repasses ativos`}
              icon={HandCoins}
            />
          </div>

          {/* ── ComissaoConfigSection (substitui o formulário manual) ── */}
          <ComissaoConfigSection
            value={payload}
            onChange={updatePayload}
            parceirosDisponiveis={parceirosDisponiveis}
            valorBase={valorCarta}
          />

          {/* Configurações avançadas de cronograma */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-200">Configurações avançadas</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Regra da primeira competência
                </label>
                <select
                  className="h-10 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
                  value={payload.primeira_competencia_regra}
                  onChange={(e) =>
                    updatePayload({
                      ...payload,
                      primeira_competencia_regra:
                        e.target.value as CotaComissaoPayload["primeira_competencia_regra"],
                    })
                  }
                >
                  <option value="mes_adesao">Mês da adesão</option>
                  <option value="primeira_cobranca_valida">Primeira cobrança válida</option>
                  <option value="manual">Manual</option>
                </select>
                <p className="text-xs text-slate-500">Ponto de partida do cronograma previsto.</p>
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Observações
                </label>
                <Textarea
                  rows={3}
                  value={payload.observacoes || ""}
                  onChange={(e) => updatePayload({ ...payload, observacoes: e.target.value })}
                  placeholder="Contexto comercial da carta para a operação."
                  className="rounded-xl border-white/10 bg-slate-950 text-sm text-white placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Ações de salvar (rodapé) — evita rolar até o topo após preencher tudo */}
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
              onClick={handleSaveConfig}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar regra
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              onClick={handleGenerateProjection}
              disabled={
                isProjecting || !contratoSelecionado.tem_contrato || numeroContratoPendente
              }
              title={
                pagamentos.length > 0
                  ? "Reprocessa o cronograma com a regra atual. Parcelas já operadas não são afetadas."
                  : "Confirma o cronograma e gera as parcelas operacionais."
              }
            >
              {isProjecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pagamentos.length > 0 ? "Reprocessar cronograma" : "Confirmar cronograma"}
            </Button>
          </div>
        </section>

        {/* ── Coluna direita: Pré-visualização e operação ── */}
        <section className="grid gap-5 rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.45)]">
          <div>
            <h2 className="text-base font-semibold text-white">Pré-visualização operacional</h2>
            <p className="mt-0.5 text-sm text-slate-400">
              Divisão por parcela antes de seguir para o motor financeiro.
            </p>
          </div>

          {/* Métricas preview */}
          <div className="grid gap-3 md:grid-cols-2">
            <MetricCard
              label="Bruto do parceiro"
              value={fmt(totaisPreview.parceiroBruto)}
              helper="Soma das parcelas repassadas"
              icon={HandCoins}
            />
            <MetricCard
              label="Imposto parceiro"
              value={fmt(totaisPreview.parceiroImposto)}
              helper="Retenção prevista sobre o repasse"
              icon={ShieldCheck}
            />
            <MetricCard
              label="Líquido do parceiro"
              value={fmt(totaisPreview.parceiroLiquido)}
              helper="Valor líquido do parceiro"
              icon={WalletCards}
            />
            <MetricCard
              label="Líquido da empresa"
              value={fmt(totaisPreview.empresaLiquida)}
              helper="Comissão líquida da organização"
              icon={CircleDollarSign}
            />
          </div>

          <CronogramaPreviewTable items={cronogramaPreview} />

          {/* Métricas operacionais */}
          <div className="grid gap-3 md:grid-cols-2">
            <MetricCard
              label="Previsto"
              value={fmt(totaisOperacionais.previsto)}
              helper={`${totaisOperacionais.previstoCount} parcelas em aberto`}
              icon={ReceiptText}
            />
            <MetricCard
              label="Pago"
              value={fmt(totaisOperacionais.pago)}
              helper={`${totaisOperacionais.pagoCount} parcelas confirmadas`}
              icon={ClipboardCheck}
            />
            <MetricCard
              label="Inadimplente"
              value={fmt(totaisOperacionais.inadimplente)}
              helper={`${totaisOperacionais.inadimplenteCount} parcelas bloqueadas`}
              icon={AlertTriangle}
            />
            <MetricCard
              label="Cancelado"
              value={fmt(totaisOperacionais.cancelado)}
              helper={`${totaisOperacionais.canceladoCount} parcelas interrompidas`}
              icon={ArrowRightLeft}
            />
          </div>

          {/* Banner de confirmação de projeção */}
          {projection && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Cronograma previsto confirmado</p>
                  <p className="mt-0.5 text-sm text-emerald-100/80">
                    {projection.detail ||
                      "A previsão usa a configuração salva da carta e mostra os lançamentos previstos antes da execução por competência."}
                  </p>
                  <p className="mt-1.5 text-xs text-emerald-100/60">
                    {projection.lancamentos?.length || 0} lançamentos projetados
                  </p>
                </div>
                <ClipboardCheck className="mt-0.5 h-5 w-5 flex-shrink-0" />
              </div>
            </div>
          )}

          {/* Abas operacionais */}
          <Tabs defaultValue="operacao">
            <TabsList className="h-10 rounded-xl bg-slate-950/80 p-1">
              <TabsTrigger value="operacao" className="rounded-lg px-3 text-xs">
                Operação mensal
              </TabsTrigger>
              <TabsTrigger value="gerados" className="rounded-lg px-3 text-xs">
                Lançamentos
              </TabsTrigger>
              <TabsTrigger value="resumo" className="rounded-lg px-3 text-xs">
                Resumo
              </TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-lg px-3 text-xs">
                Timeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="operacao" className="grid gap-3 mt-3">
              <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs text-slate-400">
                <p>
                  <strong className="text-slate-300">Operação mensal:</strong>{" "}
                  use o menu <span className="text-slate-200">▾</span> de cada linha para marcar como pago,
                  inadimplente, reverter para previsto, pular ou editar detalhes da parcela.
                </p>
                {pagamentos.length > 0 && (
                  <p className="mt-1">
                    Se precisou ajustar a regra de comissão, use{" "}
                    <strong className="text-emerald-400">Reprocessar cronograma</strong> para atualizar
                    as parcelas futuras sem afetar o que já foi pago.
                  </p>
                )}
              </div>
              <CronogramaOperacionalTable
                pagamentos={pagamentos}
                busyPagamentoId={busyPagamentoId}
                onStatusChange={handlePagamentoStatus}
                onSkip={handleSkipPagamento}
                onCancelFuture={handleCancelFuture}
                onRefresh={() => router.refresh()}
              />
            </TabsContent>

            <TabsContent value="gerados" className="mt-3">
              {lancamentos.length ? (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
                  <div className="grid grid-cols-[2.5rem_1fr_6rem_6rem_5.5rem] gap-2 border-b border-white/10 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <span>#</span>
                    <span>Beneficiário</span>
                    <span>Status</span>
                    <span>Competência</span>
                    <span className="text-right">Valor</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {lancamentos.map((item, i) => (
                      <div
                        key={item.id || `${item.ordem}-${i}`}
                        className="grid grid-cols-[2.5rem_1fr_6rem_6rem_5.5rem] items-center gap-2 px-4 py-2.5 text-sm text-slate-200"
                      >
                        <span className="text-xs text-slate-500">#{item.ordem}</span>
                        <span className="truncate text-xs">
                          {item.beneficiario_tipo === "parceiro"
                            ? (item.parceiros_corretores?.nome ?? "Parceiro")
                            : "Empresa"}
                        </span>
                        <ComissaoStatusBadge status={item.status} />
                        <span className="text-xs text-slate-400">
                          {item.competencia_prevista
                            ? new Date(item.competencia_prevista + "-15").toLocaleDateString(
                                "pt-BR",
                                { month: "short", year: "numeric" }
                              )
                            : "—"}
                        </span>
                        <span className="text-right text-xs font-medium">{fmt(item.valor_liquido)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyBlock text="Ainda não existem lançamentos gerados por competência para este contrato." />
              )}
            </TabsContent>

            <TabsContent value="resumo" className="mt-3">
              {resumoFinanceiro ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <MetricCard
                    label="Total bruto"
                    value={fmt(resumoFinanceiro.totais.total_bruto)}
                    helper={`${resumoFinanceiro.quantidades.lancamentos} lançamentos no total`}
                    icon={CircleDollarSign}
                  />
                  <MetricCard
                    label="Líquido parceiro"
                    value={fmt(resumoFinanceiro.totais.parceiro.liquido)}
                    helper={`Impostos ${fmt(resumoFinanceiro.totais.parceiro.imposto)}`}
                    icon={HandCoins}
                  />
                  <MetricCard
                    label="Líquido empresa"
                    value={fmt(resumoFinanceiro.totais.empresa.liquido)}
                    helper="Valor consolidado da organização"
                    icon={WalletCards}
                  />
                  <MetricCard
                    label="Repasses"
                    value={`${resumoFinanceiro.quantidades.por_repasse_status?.pendente ?? 0} pendentes`}
                    helper={`${resumoFinanceiro.quantidades.por_repasse_status?.pago ?? 0} pagos`}
                    icon={ShieldCheck}
                  />
                </div>
              ) : (
                <EmptyBlock text="Resumo financeiro indisponível. O contrato precisa ter lançamentos reais gerados." />
              )}
            </TabsContent>

            <TabsContent value="timeline" className="mt-3">
              {timeline?.items?.length ? (
                <div className="space-y-2">
                  {timeline.items.map((item, i) => (
                    <div
                      key={`${item.tipo}-${i}`}
                      className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{item.titulo}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {item.tipo} · {fmtDate(item.data_ref || item.timestamp)}
                        </p>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0 border-white/10 text-slate-400 text-xs">
                        {item.tipo}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyBlock text="Timeline sem eventos financeiros ou de comissão para este contrato." />
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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
          tipo_evento: "adesao",
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
      ? regras.map((r) => ({ ...r, percentual_comissao: Number(r.percentual_comissao || 0) }))
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
    parceiros: parceiros.map((p) => ({
      ...p,
      percentual_parceiro: Number(p.percentual_parceiro || 0),
      imposto_retido_pct: Number(p.imposto_retido_pct || 0),
    })),
  };
}

function buildCronogramaPreview(
  payload: CotaComissaoPayload,
  valorCarta: number
): FinanceiroCronogramaPreviewItem[] {
  const totalPercentual = Number(payload.percentual_total || 0);
  const parceirosAtivos = payload.parceiros.filter((p) => p.ativo);
  const totalParceiro = parceirosAtivos.reduce(
    (s, p) => s + Number(p.percentual_parceiro || 0), 0
  );
  const partnerRatio = totalPercentual > 0 ? totalParceiro / totalPercentual : 0;
  const partnerTaxRatio =
    totalParceiro > 0
      ? parceirosAtivos.reduce((s, p) => {
          const pct = Number(p.percentual_parceiro || 0);
          const imp = Number(p.imposto_retido_pct || 0);
          return s + pct * (imp / 100);
        }, 0) / totalParceiro
      : 0;

  return payload.regras.map((r) => {
    const pct = Number(r.percentual_comissao || 0);
    const valorTotal = round2(valorCarta * (pct / 100));
    const parceiroBruto = round2(valorTotal * partnerRatio);
    const parceiroImposto = round2(parceiroBruto * partnerTaxRatio);
    const parceiroLiquido = round2(parceiroBruto - parceiroImposto);
    const empresaLiquida = round2(valorTotal - parceiroBruto);
    return {
      ordem: r.ordem,
      tipo_evento: r.tipo_evento,
      offset_meses: r.offset_meses,
      percentual_comissao: pct,
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
    { parceiroBruto: 0, parceiroImposto: 0, parceiroLiquido: 0, empresaLiquida: 0 }
  );
}

function summarizePagamentosOperacionais(items: PagamentoItem[]) {
  return items.reduce(
    (acc, item) => {
      const v = Number(item.valor || 0);
      switch (item.status) {
        case "pago": acc.pago += v; acc.pagoCount++; break;
        case "inadimplente": acc.inadimplente += v; acc.inadimplenteCount++; break;
        case "cancelado": acc.cancelado += v; acc.canceladoCount++; break;
        default: acc.previsto += v; acc.previstoCount++; break;
      }
      return acc;
    },
    { previsto: 0, previstoCount: 0, pago: 0, pagoCount: 0, inadimplente: 0, inadimplenteCount: 0, cancelado: 0, canceladoCount: 0 }
  );
}

function round2(v: number) { return Math.round(v * 100) / 100; }
function labelStatus(v?: string | null) { return v ? v.replaceAll("_", " ") : "Não informado"; }

// ── Sub-componentes ───────────────────────────────────────────────────────────

function ContextCard({
  icon: Icon, label, value, description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; description: string;
}) {
  return (
    <div className="grid gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">
        <Icon className="h-3.5 w-3.5 text-emerald-300" />
        {label}
      </div>
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}

function MetricCard({
  label, value, helper, icon: Icon,
}: {
  label: string; value: string; helper: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="grid gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">
        <Icon className="h-3.5 w-3.5 text-emerald-300" />
        {label}
      </div>
      <p className="text-base font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
      {text}
    </div>
  );
}
