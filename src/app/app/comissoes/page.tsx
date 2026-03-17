import type { ReactNode } from "react";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { CircleDollarSign, Landmark, Wallet2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/server";
import { listComissaoLancamentosAction, listParceirosOptionsAction } from "./actions";
import { ComissoesFilters } from "./components/ComissoesFilters";
import { LancamentosTable } from "./components/LancamentosTable";

export default async function ComissoesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const me = await getCurrentProfile();
  if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

  const params = await searchParams;
  const get = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const [parceiros, data] = await Promise.all([
    listParceirosOptionsAction(),
    listComissaoLancamentosAction({
      parceiro_id: get("parceiro_id"),
      status: (get("status") as never) || "",
      repasse_status: (get("repasse_status") as never) || "",
      competencia_de: get("competencia_de"),
      competencia_ate: get("competencia_ate"),
    }),
  ]);

  const resumo = data.resumo;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Comissões e repasses</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe previsões, pagamentos e repasses de parceiros a partir das cartas e contratos já configurados.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard title="Lançamentos" value={String(resumo?.total_lancamentos ?? 0)} icon={<CircleDollarSign className="h-5 w-5 text-emerald-400" />} />
        <MetricCard title="Empresa (bruto)" value={formatMoney(resumo?.total_bruto_empresa)} icon={<Wallet2 className="h-5 w-5 text-emerald-400" />} />
        <MetricCard title="Parceiros (líquido)" value={formatMoney(resumo?.total_liquido_parceiros)} icon={<Landmark className="h-5 w-5 text-emerald-400" />} />
        <MetricCard title="Repasses pendentes" value={String(resumo?.repasses_pendentes ?? 0)} icon={<Landmark className="h-5 w-5 text-amber-400" />} />
      </div>

      <ComissoesFilters parceiros={parceiros} />
      <LancamentosTable items={data.items} refreshPath="/app/comissoes" title="Financeiro do comissionamento" />
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="flex items-center gap-2 text-2xl font-semibold">{icon}{value}</CardContent>
    </Card>
  );
}

function formatMoney(value: string | number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}
