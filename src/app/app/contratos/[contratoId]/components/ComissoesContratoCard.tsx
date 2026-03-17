"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gerarLancamentosContratoAction, sincronizarEventosContratoAction } from "@/app/app/comissoes/actions";
import type { ComissaoLancamento, ComissaoResumo } from "@/app/app/comissoes/types";
import { LancamentosTable } from "@/app/app/comissoes/components/LancamentosTable";

type Props = {
  contratoId: string;
  resumo: ComissaoResumo | null;
  items: ComissaoLancamento[];
};

export function ComissoesContratoCard({ contratoId, resumo, items }: Props) {
  const router = useRouter();
  const [loading, setLoading] = React.useState<"gerar" | "sync" | null>(null);

  async function handleGerar(sobrescrever: boolean) {
    try {
      setLoading("gerar");
      toast.loading(sobrescrever ? "Regenerando lançamentos..." : "Gerando lançamentos...");
      await gerarLancamentosContratoAction(contratoId, sobrescrever);
      toast.dismiss();
      toast.success(sobrescrever ? "Lançamentos regenerados com sucesso." : "Lançamentos gerados com sucesso.");
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
      toast.loading("Sincronizando eventos do contrato...");
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
          <CardTitle className="text-base">Comissionamento do contrato</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Gere os lançamentos após configurar a comissão da carta. Depois, sincronize contemplação e atualize pagamentos/repasses.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => handleSync()} disabled={loading !== null}>
            <RefreshCw className="mr-2 h-4 w-4" />Sincronizar eventos
          </Button>
          <Button variant="outline" onClick={() => handleGerar(false)} disabled={loading !== null}>
            <Sparkles className="mr-2 h-4 w-4" />Gerar lançamentos
          </Button>
          <Button onClick={() => handleGerar(true)} disabled={loading !== null}>
            <Sparkles className="mr-2 h-4 w-4" />Regenerar tudo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <ResumoPill label="Lançamentos" value={String(resumo?.total_lancamentos ?? 0)} />
          <ResumoPill label="Empresa bruto" value={formatMoney(resumo?.total_bruto_empresa)} />
          <ResumoPill label="Parceiros líquido" value={formatMoney(resumo?.total_liquido_parceiros)} />
          <ResumoPill label="Repasses pendentes" value={String(resumo?.repasses_pendentes ?? 0)} />
        </div>

        <LancamentosTable items={items} refreshPath={`/app/contratos/${contratoId}`} title="Lançamentos do contrato" />
      </CardContent>
    </Card>
  );
}

function ResumoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function formatMoney(value: number | string | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}
