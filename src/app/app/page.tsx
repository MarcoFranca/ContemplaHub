// src/app/app/page.tsx
import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    MessageSquare,
    HandCoins,
    FileCheck2,
    Sparkles,
    CheckCircle2,
    CalendarDays,
    Star,
} from "lucide-react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AppHome() {
    const profile = await getCurrentProfile();
    if (!profile?.orgId)
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

    const { orgId, userId, isManager, nome: meNome = "" } = profile;
    const supa = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    // --- KPIs gerais ---
    const [{ data: leads }, { data: cotas }, { data: contemps }] = await Promise.all([
        supa.from("leads").select("id, etapa, owner_id, created_at").eq("org_id", orgId),
        supa
            .from("cotas")
            .select("id, valor_carta, situacao, data_adesao, assembleia_dia, grupo_codigo")
            .eq("org_id", orgId),
        supa.from("contemplacoes").select("id, data").eq("org_id", orgId),
    ]);

    const myLeads = (leads ?? []).filter(
        (l) => isManager || l.owner_id === userId
    );

    const novos7d = myLeads.filter(
        (l) => new Date(l.created_at) > new Date(Date.now() - 7 * 86400000)
    ).length;

    const negociando = myLeads.filter(
        (l) => ["proposta", "negociacao"].includes(l.etapa)
    ).length;

    const contratosFechados = myLeads.filter(
        (l) => l.etapa === "fechamento"
    ).length;

    const volumeAtivo =
        (cotas ?? [])
            .filter((c) => c.situacao === "ativa" && c.valor_carta)
            .reduce((acc, c) => acc + Number(c.valor_carta), 0) || 0;

    const contemplacoesRecentes = (contemps ?? []).filter(
        (c) => new Date(c.data) > new Date(Date.now() - 30 * 86400000)
    ).length;

    // --- KPIs visuais ---
    const KPIS = [
        { label: "Novos Leads (7d)", value: novos7d, icon: MessageSquare },
        { label: "Negociações", value: negociando, icon: HandCoins },
        { label: "Contratos Fechados", value: contratosFechados, icon: FileCheck2 },
        { label: "Volume Ativo", value: `R$ ${volumeAtivo.toLocaleString("pt-BR")}`, icon: Sparkles },
        { label: "Contemplações (30d)", value: contemplacoesRecentes, icon: Star },
    ];

    // --- Pega assembleias "previstas" (base no campo assembleia_dia das cotas) ---
    const hoje = new Date().getDate();
    const proximas = (cotas ?? [])
        .filter((c) => c.assembleia_dia && c.situacao === "ativa")
        .filter((c) => {
            const dia = Number(c.assembleia_dia);
            return dia >= hoje && dia <= hoje + 7;
        })
        .sort((a, b) => (a.assembleia_dia ?? 0) - (b.assembleia_dia ?? 0))
        .slice(0, 5);

    // --- Render ---
    return (
        <main className="p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Olá, {meNome || "Consultor"} 👋</h1>
                    <p className="text-sm text-muted-foreground">
                        Aqui está o panorama da sua performance e próximos passos.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/app/leads">+ Novo Lead</Link>
                </Button>
            </div>

            {/* KPIs */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {KPIS.map(({ label, value, icon: Icon }) => (
                    <Card key={label} className="bg-white/5 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm">{label}</CardTitle>
                            <Icon className="h-4 w-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tabular-nums">{value}</div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            {/* Assembleias e Contemplações */}
            <section className="grid gap-4 md:grid-cols-2">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>Assembleias Próximas (7 dias)</CardTitle>
                        <CalendarDays className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        {proximas.length === 0 ? (
                            <p>Nenhuma assembleia prevista.</p>
                        ) : (
                            <ul className="space-y-2">
                                {proximas.map((c: any) => (
                                    <li key={c.id} className="flex justify-between">
                                        <span>{c.grupo_codigo ?? "Grupo"}</span>
                                        <span>{c.assembleia_dia}/mês</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>Últimas Contemplações</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        {contemps?.length ? (
                            <ul className="space-y-2">
                                {contemps.slice(-5).reverse().map((c: any) => (
                                    <li key={c.id}>{new Date(c.data).toLocaleDateString("pt-BR")}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>Nenhuma contemplação recente.</p>
                        )}
                    </CardContent>
                </Card>
            </section>
        </main>
    );
}
