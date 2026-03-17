import { DashboardShell } from "./_components/dashboard/dashboard-shell";
import { DashboardKpis } from "./_components/dashboard/dashboard-kpis";
import { DashboardAttention } from "./_components/dashboard/dashboard-attention";
import { DashboardCommercial } from "./_components/dashboard/dashboard-commercial";
import { DashboardOperational } from "./_components/dashboard/dashboard-operational";
import { DashboardFinancial } from "./_components/dashboard/dashboard-financial";
import { DashboardShortcuts } from "./_components/dashboard/dashboard-shortcuts";
import { DashboardActivities } from "./_components/dashboard/dashboard-activities";
import { DashboardRanking } from "./_components/dashboard/dashboard-ranking";
import { DashboardPriorityList } from "./_components/dashboard/dashboard-priority-list";
import { getDashboardData } from "./_data/dashboard/get-dashboard-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AppHome() {
    const data = await getDashboardData();

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
            <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-primary">Painel</p>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Olá, {data.profile.nome || "Consultor"} 👋
                </h1>
                <p className="max-w-3xl text-sm text-muted-foreground">
                    Aqui está o panorama real da operação comercial, das cotas e do financeiro da sua organização.
                </p>
            </div>

            <DashboardKpis summary={data.summary} />
            <DashboardAttention items={data.attentionItems} />

            <section className="grid gap-6 xl:grid-cols-2">
                <DashboardCommercial items={data.commercialFunnel} />
                <DashboardOperational items={data.operationalAgenda} />
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <DashboardActivities items={data.activityItems} />
                <DashboardRanking items={data.sellerRanking} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <DashboardFinancial data={data.financialPreview} />
                <DashboardShortcuts />
            </section>

            <DashboardPriorityList items={data.priorityItems} />
        </DashboardShell>
    );
}