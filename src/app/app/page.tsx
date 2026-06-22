import { DashboardShell } from "./_components/dashboard/dashboard-shell";
import { DashboardKpis } from "./_components/dashboard/dashboard-kpis";
import { DashboardVendas } from "./_components/dashboard/dashboard-vendas";
import { DashboardAnalyticsKpis } from "./_components/dashboard/dashboard-analytics-kpis";
import { DashboardAttention } from "./_components/dashboard/dashboard-attention";
import { DashboardAttentionBell } from "./_components/dashboard/dashboard-attention-bell";
import { DashboardEvolucao } from "./_components/dashboard/dashboard-evolucao";
import { DashboardDistribuicao } from "./_components/dashboard/dashboard-distribuicao";
import { DashboardComissaoChart } from "./_components/dashboard/dashboard-comissao-chart";
import { DashboardCommercial } from "./_components/dashboard/dashboard-commercial";
import { DashboardOperational } from "./_components/dashboard/dashboard-operational";
import { DashboardShortcuts } from "./_components/dashboard/dashboard-shortcuts";
import { DashboardActivities } from "./_components/dashboard/dashboard-activities";
import { DashboardRanking } from "./_components/dashboard/dashboard-ranking";
import { DashboardPriorityList } from "./_components/dashboard/dashboard-priority-list";
import { getDashboardData } from "./_data/dashboard/get-dashboard-data";
import { getVendasAnalytics } from "./_data/dashboard/get-vendas-analytics";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(sp: SearchParams, key: string): string | undefined {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
}

export default async function AppHome({
    searchParams,
}: {
    searchParams?: Promise<SearchParams>;
}) {
    const sp = (await searchParams) ?? {};
    const anoAtual = String(new Date().getFullYear());
    const de = firstParam(sp, "de") || `${anoAtual}-01`;
    const ate = firstParam(sp, "ate") || `${anoAtual}-12`;

    const [data, vendas] = await Promise.all([
        getDashboardData(),
        getVendasAnalytics(de, ate),
    ]);

    if (!data.profile?.orgId) {
        return (
            <main className="p-6">
                <h1 className="text-2xl font-semibold">Bem-vindo!</h1>
                <p className="text-sm text-muted-foreground">
                    Finalize seu cadastro para acessar o painel.
                </p>
                <Button asChild className="mt-4">
                    <Link href="/app/organizacao">Ir para Organização</Link>
                </Button>
            </main>
        );
    }

    return (
        <DashboardShell>
            <header className="flex flex-col gap-4 border-b border-white/10 pb-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Painel
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Olá, {data.profile.nome || "Consultor"}
                        </h1>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            Panorama da operação comercial, das cotas e do financeiro da sua organização.
                        </p>
                    </div>

                    <DashboardAttentionBell items={data.attentionItems} />
                </div>

                <DashboardShortcuts />
            </header>

            {vendas && <DashboardVendas data={vendas} />}

            <DashboardKpis summary={data.summary} />
            <DashboardAnalyticsKpis analytics={data.analytics} />
            <DashboardAttention items={data.attentionItems} />

            <DashboardEvolucao data={data.monthlySeries} />

            <section className="grid gap-6 xl:grid-cols-2">
                <DashboardDistribuicao
                    porStatus={data.cotasPorStatus}
                    porProduto={data.cotasPorProduto}
                />
                <DashboardComissaoChart data={data.financialPreview} />
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <DashboardCommercial items={data.commercialFunnel} />
                <DashboardOperational items={data.operationalAgenda} />
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <DashboardActivities items={data.activityItems} />
                <DashboardRanking items={data.sellerRanking} />
            </section>

            <DashboardPriorityList items={data.priorityItems} />
        </DashboardShell>
    );
}