"use client";

import * as React from "react";
import Link from "next/link";
import { Banknote, RefreshCw, Settings, Sparkles, TrendingUp, Wallet, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompetenciasTable } from "@/app/app/comissoes/components/CompetenciasTable";
import { ContratoTimeline } from "@/app/app/comissoes/components/ContratoTimeline";
import { LancamentosTable } from "@/app/app/comissoes/components/LancamentosTable";
import { LancamentoStatusDialog } from "@/app/app/comissoes/components/LancamentoStatusDialog";
import { RepasseDialog } from "@/app/app/comissoes/components/RepasseDialog";
import {
  CompetenciaStatusBadge,
  ComissaoStatusBadge,
  RepasseStatusBadge,
} from "@/app/app/comissoes/components/status-badges";
import { HistoricoLancesPanel } from "./HistoricoLancesPanel";
import {
  gerarLancamentosContratoAction,
  sincronizarEventosContratoAction,
} from "@/app/app/comissoes/actions";
import type {
  ComissaoLancamento,
  CotaPagamentoCompetencia,
  ResumoFinanceiroContratoResponse,
  TimelineContratoItem,
} from "@/app/app/comissoes/types";

type HistoricoLanceItem = {
  id: string;
  assembleia_data?: string | null;
  tipo?: string | null;
  percentual?: number | null;
  valor?: number | null;
  origem?: string | null;
  resultado?: string | null;
  created_at?: string | null;
};

type Contemplacao = {
  id: string;
  motivo: string;
  lance_percentual?: number | null;
  data: string;
} | null;

type Props = {
  contratoId: string;
  cotaId?: string | null;
  resumoFinanceiro: ResumoFinanceiroContratoResponse["totais"] | null;
  lancamentos: ComissaoLancamento[];
  competencias: CotaPagamentoCompetencia[];
  timeline: TimelineContratoItem[];
  historicoLances?: HistoricoLanceItem[];
  contemplacao?: Contemplacao;
};

function fmtMoney(value?: string | number | null) {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

const compKey = (iso?: string | null) => (iso ?? "").slice(0, 7);

function mesAtualKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function ComissoesContratoCard({
  contratoId,
  cotaId,
  resumoFinanceiro,
  lancamentos,
  competencias,
  timeline,
  historicoLances,
  contemplacao,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = React.useState<"gerar" | "sync" | null>(null);

  const mesAtual = mesAtualKey();
  const competenciaAtual = competencias.find((c) => compKey(c.competencia) === mesAtual);
  const comissaoEmpresaAtual = lancamentos.find(
    (l) => l.beneficiario_tipo === "empresa" && compKey(l.competencia_prevista) === mesAtual
  );
  const repasseParceiroAtual = lancamentos.find(
    (l) => l.beneficiario_tipo === "parceiro" && compKey(l.competencia_prevista) === mesAtual
  );

  async function handleGerar(sobrescrever: boolean) {
    try {
      setLoading("gerar");
      toast.loading(sobrescrever ? "Regenerando lançamentos..." : "Gerando lançamentos...");
      await gerarLancamentosContratoAction(contratoId, sobrescrever);
      toast.dismiss();
      toast.success("Lançamentos atualizados com sucesso.");
      router.refresh();
    } catch (error) {
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : "Erro ao gerar lançamentos.");
    } finally {
      setLoading(null);
    }
  }

  async function handleSync() {
    try {
      setLoading("sync");
      toast.loading("Sincronizando eventos...");
      await sincronizarEventosContratoAction(contratoId);
      toast.dismiss();
      toast.success("Eventos sincronizados com sucesso.");
      router.refresh();
    } catch (error) {
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : "Erro ao sincronizar eventos.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="overflow-hidden border-border/70 bg-card/80 shadow-sm">
      <CardHeader className="gap-4 border-b border-border/60 bg-emerald-500/5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">
              <WalletCards className="h-3.5 w-3.5" />
              Financeiro do contrato
            </div>
            <div>
              <CardTitle className="text-base">Comissões do contrato</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Acompanhe competências, lançamentos, repasses e eventos financeiros com uma leitura mais clara.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-emerald-500/20 hover:bg-emerald-500/5" asChild>
              <Link href={`/app/financeiro/pagamentos?contrato_id=${contratoId}`}>
                <Settings className="mr-2 h-4 w-4 text-emerald-300" />
                Configurar comissão
              </Link>
            </Button>
            <Button variant="outline" className="border-emerald-500/20 hover:bg-emerald-500/5" onClick={() => handleSync()} disabled={loading !== null}>
              <RefreshCw className="mr-2 h-4 w-4 text-emerald-300" />
              Sincronizar
            </Button>
            <Button variant="outline" className="border-emerald-500/20 hover:bg-emerald-500/5" onClick={() => handleGerar(false)} disabled={loading !== null}>
              <Sparkles className="mr-2 h-4 w-4 text-emerald-300" />
              Gerar
            </Button>
            <Button className="bg-emerald-600 text-white hover:bg-emerald-500" onClick={() => handleGerar(true)} disabled={loading !== null}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Regenerar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-5">
        {/* Visão geral — status do mês atual */}
        <div className="grid gap-3 sm:grid-cols-3">
          <StatusPill
            icon={<Banknote className="h-3.5 w-3.5 text-emerald-300" />}
            label="Pagamento do cliente (mês)"
          >
            <div className="flex items-center justify-between gap-2">
              {competenciaAtual ? (
                <CompetenciaStatusBadge status={competenciaAtual.status} />
              ) : (
                <span className="text-sm text-muted-foreground">Sem competência no mês</span>
              )}
              <Link
                href={`/app/financeiro/pagamentos?contrato_id=${contratoId}`}
                className="text-xs text-emerald-300 underline-offset-2 hover:underline"
              >
                Gerenciar
              </Link>
            </div>
          </StatusPill>

          <StatusPill
            icon={<WalletCards className="h-3.5 w-3.5 text-emerald-300" />}
            label="Comissão da empresa (mês)"
          >
            {comissaoEmpresaAtual ? (
              <div className="flex items-center justify-between gap-2">
                <ComissaoStatusBadge status={comissaoEmpresaAtual.status} />
                <LancamentoStatusDialog
                  lancamento={comissaoEmpresaAtual}
                  refreshPath={`/app/contratos/${contratoId}`}
                />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Sem lançamento no mês</span>
            )}
          </StatusPill>

          <StatusPill
            icon={<Wallet className="h-3.5 w-3.5 text-emerald-300" />}
            label="Repasse ao parceiro (mês)"
          >
            {repasseParceiroAtual ? (
              <div className="flex items-center justify-between gap-2">
                <RepasseStatusBadge status={repasseParceiroAtual.repasse_status} />
                <RepasseDialog
                  lancamento={repasseParceiroAtual}
                  refreshPath={`/app/contratos/${contratoId}`}
                />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Sem parceiro no mês</span>
            )}
          </StatusPill>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <ResumoPill label="Total bruto" value={fmtMoney(resumoFinanceiro?.total_bruto)} />
          <ResumoPill label="Empresa bruto" value={fmtMoney(resumoFinanceiro?.empresa.bruto)} />
          <ResumoPill label="Parceiro bruto" value={fmtMoney(resumoFinanceiro?.parceiro.bruto)} />
          <ResumoPill label="Imposto parceiro" value={fmtMoney(resumoFinanceiro?.parceiro.imposto)} />
          <ResumoPill label="Parceiro líquido" value={fmtMoney(resumoFinanceiro?.parceiro.liquido)} highlight />
        </div>

        <Tabs defaultValue="competencias" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-muted/50 p-1 md:w-auto md:min-w-[520px]">
            <TabsTrigger value="competencias">Competências</TabsTrigger>
            <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
            <TabsTrigger value="lances">Lances</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="competencias">
            <CompetenciasTable items={competencias} />
          </TabsContent>

          <TabsContent value="lancamentos">
            <LancamentosTable
              items={lancamentos}
              refreshPath={`/app/contratos/${contratoId}`}
              showContratoLink={false}
            />
          </TabsContent>

          <TabsContent value="lances">
            <HistoricoLancesPanel
              cotaId={cotaId ?? ""}
              historicoLances={historicoLances ?? []}
              contemplacao={contemplacao}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <ContratoTimeline items={timeline} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function StatusPill({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/25 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ResumoPill({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value?: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border px-4 py-3 shadow-sm",
        highlight
          ? "border-emerald-500/20 bg-emerald-500/8"
          : "border-border/70 bg-muted/25",
      ].join(" ")}
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-foreground">{value || "R$ 0,00"}</div>
    </div>
  );
}
