// src/app/app/page.tsx
import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { SectionFX } from "@/components/marketing/SectionFX";
import {
    MessageSquare,
    ClipboardList,
    HandCoins,
    FileCheck2,
    CheckCircle2,
    XCircle,
    CalendarDays,
    Sparkles,
} from "lucide-react";

// helpers
type Stage = "novo" | "diagnostico" | "proposta" | "negociacao" | "fechamento" | "ativo" | "perdido";
const STAGES: Stage[] = ["novo", "diagnostico", "proposta", "negociacao", "fechamento", "ativo"];

const STAGE_META: Record<
    Stage,
    { label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }
> = {
    novo: { label: "Novos", icon: MessageSquare },
    diagnostico: { label: "Diagnóstico", icon: ClipboardList },
    proposta: { label: "Proposta", icon: HandCoins },
    negociacao: { label: "Negociação", icon: FileCheck2 },
    fechamento: { label: "Fechamento", icon: CheckCircle2 },
    ativo: { label: "Ativos", icon: Sparkles },
    perdido: { label: "Perdidos", icon: XCircle },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AppHome() {
    const profile = await getCurrentProfile();

    // Estado: sem org vinculada
    if (!profile?.orgId) {
        return (
            <main className="relative">
                <SectionFX preset="mesh" variant="neutral" className="absolute inset-0" />
                <div className="relative p-6 space-y-6">
                    <h1 className="text-2xl font-semibold">Bem-vindo!</h1>
                    <p className="text-sm text-muted-foreground">
                        Finalize seu cadastro para acessar o painel.
                    </p>
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle>Sem organização vinculada</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Peça a um administrador para vincular seu usuário a uma organização em{" "}
                                <code className="text-emerald-300">/app/usuarios</code> ou crie uma organização.
                            </p>
                            <div className="flex gap-2">
                                <Button asChild><Link href="/app/organizacao">Ir para Organização</Link></Button>
                                <Button variant="outline" asChild><Link href="/app">Voltar ao painel</Link></Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        );
    }

    const { orgId, userId, isManager, nome: meNome = "", role = "vendedor" } = profile;

    // Pegar avatar/nome do Supabase user
    // (Server-safe; usa o client normal porque estamos em RSC)
    const supa = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );
    const { data: { user } } = await supa.auth.getUser();
    const avatarUrl =
        (user?.user_metadata as any)?.avatar_url ||
        (user?.user_metadata as any)?.picture ||
        null;
    const displayName =
        meNome ||
        (user?.user_metadata as any)?.full_name ||
        user?.email?.split("@")[0] ||
        "consultor";

    // Service Role para leituras agregadas (server only)
    const srv = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    // ---------- KPIs por etapa (org / meu) ----------
    let { data: kRows, error: kErr } = await srv
        .from("leads")
        .select("etapa, owner_id")
        .eq("org_id", orgId);

    if (kErr) {
        console.error("kpi leads service error:", kErr);
        kRows = [];
    }

    const countMap = new Map<Stage, number>(STAGES.map((s) => [s, 0]));
    (kRows ?? [])
        .filter((r: any) => (isManager ? true : r.owner_id === userId))
        .forEach((r: any) => {
            const s = (r.etapa as Stage) ?? "novo";
            if (countMap.has(s)) countMap.set(s, (countMap.get(s) ?? 0) + 1);
        });

    // ---------- Próximas assembleias (30 dias) ----------
    const today = new Date();
    const in30d = new Date(today);
    in30d.setDate(today.getDate() + 30);

    const start = today.toISOString().slice(0, 10); // YYYY-MM-DD
    const end = in30d.toISOString().slice(0, 10);

    const { data: assems, error: aErr } = await srv
        .from("assembleias")
        .select("id, data, grupo_id")
        .eq("org_id", orgId)
        .gte("data", start)
        .lte("data", end)
        .order("data", { ascending: true })
        .limit(6);

    if (aErr) console.error("assembleias service error:", aErr);

    let proximas: { id: string; data: string; grupoCodigo: string | null }[] = [];
    if (assems && assems.length) {
        const ids = [...new Set(assems.map((a: any) => a.grupo_id).filter(Boolean))] as string[];
        const codigos = new Map<string, string>();
        if (ids.length) {
            const { data: gs } = await srv.from("grupos").select("id, codigo").in("id", ids);
            (gs ?? []).forEach((g: any) => codigos.set(g.id, g.codigo));
        }
        proximas = assems.map((a: any) => ({
            id: a.id as string,
            data: a.data as unknown as string,
            grupoCodigo: a.grupo_id ? codigos.get(a.grupo_id as string) ?? null : null,
        }));
    }

    // ---------- Atividades recentes ----------
    const { data: actsRows, error: actErr } = await srv
        .from("activities")
        .select("id, tipo, assunto, due_at, done, created_by, created_at")
        .eq("org_id", orgId)
        .order("due_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(20);

    if (actErr) console.error("activities service error:", actErr);
    const acts = (actsRows ?? [])
        .filter((r: any) => (isManager ? true : r.created_by === userId))
        .slice(0, 8);

    // -------------------- Render --------------------
    return (
        <main className="relative">
            <div className="relative p-6 space-y-6">

                {/* Barra de contexto do usuário */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={avatarUrl ?? ""} />
                            <AvatarFallback className="bg-emerald-500/20 text-emerald-300">
                                {displayName[0]?.toUpperCase() ?? "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{displayName}</p>
                            <p className="text-xs text-slate-400">
                                {isManager ? "admin/gestor" : role} • sua organização
                            </p>
                        </div>
                    </div>

                </div>

                {/* KPIs por etapa com ícones */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                    {STAGES.map((stage) => {
                        const Icon = STAGE_META[stage].icon;
                        const label = STAGE_META[stage].label;
                        return (
                            <Card key={stage} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm">{label}</CardTitle>
                                    <Icon className="h-4 w-4 text-emerald-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold tabular-nums">
                                        {countMap.get(stage) ?? 0}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </section>

                {/* Próximas assembleias & Atividades */}
                <section className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Próximas assembleias (30 dias)</CardTitle>
                            <CalendarDays className="h-4 w-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            {proximas.length === 0 ? (
                                <p className="text-sm text-slate-400">Sem assembleias no período.</p>
                            ) : (
                                <ul className="space-y-2 text-sm">
                                    {proximas.map((a) => (
                                        <li key={a.id} className="flex items-center justify-between">
                                            <span className="truncate">{a.grupoCodigo ?? "Grupo"}</span>
                                            <span className="tabular-nums">
                        {new Date(a.data as unknown as string).toLocaleDateString("pt-BR")}
                      </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle>Atividades recentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {acts.length === 0 ? (
                                <p className="text-sm text-slate-400">Nenhuma atividade registrada.</p>
                            ) : (
                                <ul className="space-y-2 text-sm">
                                    {acts.map((a: any) => (
                                        <li key={a.id} className="flex items-center justify-between">
                      <span className="truncate capitalize">
                        {a.tipo} — {a.assunto ?? "Sem assunto"}
                      </span>
                                            <span className="text-slate-400 tabular-nums">
                        {a.due_at ? new Date(a.due_at).toLocaleString("pt-BR") : "sem prazo"}
                      </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    );
}
