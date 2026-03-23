"use client";

import * as React from "react";
import { RefreshCw, Sparkles } from "lucide-react";
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Comissões do contrato</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Acompanhe competências, lançamentos, repasses e eventos financeiros.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleSync()} disabled={loading !== null}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar
            </Button>
            <Button variant="outline" onClick={() => handleGerar(false)} disabled={loading !== null}>
              <Sparkles className="mr-2 h-4 w-4" />
              Gerar
            </Button>
            <Button onClick={() => handleGerar(true)} disabled={loading !== null}>
              <Sparkles className="mr-2 h-4 w-4" />
              Regenerar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-5">
            <ResumoPill label="Total bruto" value={resumoFinanceiro?.total_bruto} />
            <ResumoPill label="Empresa bruto" value={resumoFinanceiro?.empresa.bruto} />
            <ResumoPill label="Parceiro bruto" value={resumoFinanceiro?.parceiro.bruto} />
            <ResumoPill label="Imposto parceiro" value={resumoFinanceiro?.parceiro.imposto} />
            <ResumoPill label="Parceiro líquido" value={resumoFinanceiro?.parceiro.liquido} />
          </div>

          <Tabs defaultValue="competencias" className="space-y-4">
            <TabsList>
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

function ResumoPill({ label, value }: { label: string; value?: string | null }) {
  return (
      <div className="rounded-xl border bg-muted/30 px-4 py-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold">{value || "R$ 0,00"}</div>
      </div>
  );
}