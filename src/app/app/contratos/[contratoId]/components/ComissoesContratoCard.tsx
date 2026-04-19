"use client";

import * as React from "react";
import { RefreshCw, Sparkles, TrendingUp, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompetenciasTable } from "@/app/app/comissoes/components/CompetenciasTable";
import { ContratoTimeline } from "@/app/app/comissoes/components/ContratoTimeline";
import { LancamentosTable } from "@/app/app/comissoes/components/LancamentosTable";
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

type Props = {
  contratoId: string;
  resumoFinanceiro: ResumoFinanceiroContratoResponse["totais"] | null;
  lancamentos: ComissaoLancamento[];
  competencias: CotaPagamentoCompetencia[];
  timeline: TimelineContratoItem[];
};

export function ComissoesContratoCard({
  contratoId,
  resumoFinanceiro,
  lancamentos,
  competencias,
  timeline,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = React.useState<"gerar" | "sync" | null>(null);

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
      <CardHeader className="gap-4 border-b border-border/60 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent">
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <ResumoPill label="Total bruto" value={resumoFinanceiro?.total_bruto} />
          <ResumoPill label="Empresa bruto" value={resumoFinanceiro?.empresa.bruto} />
          <ResumoPill label="Parceiro bruto" value={resumoFinanceiro?.parceiro.bruto} />
          <ResumoPill label="Imposto parceiro" value={resumoFinanceiro?.parceiro.imposto} />
          <ResumoPill label="Parceiro líquido" value={resumoFinanceiro?.parceiro.liquido} highlight />
        </div>

        <Tabs defaultValue="competencias" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/50 p-1 md:w-auto md:min-w-[420px]">
            <TabsTrigger value="competencias">Competências</TabsTrigger>
            <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="competencias">
            <CompetenciasTable items={competencias} />
          </TabsContent>

          <TabsContent value="lancamentos">
            <LancamentosTable items={lancamentos} refreshPath={`/app/contratos/${contratoId}`} />
          </TabsContent>

          <TabsContent value="timeline">
            <ContratoTimeline items={timeline} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
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
