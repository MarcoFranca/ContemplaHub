export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listLancesCartas, listRegrasOperadora } from "./actions";
import { LancesFilters } from "./components/lances-filters";
import { LancesTable } from "./components/lances-table";
import type { LanceCartaListResponse, RegraOperadora } from "./types";

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
    searchParams?: Promise<SearchParams>;
};

function first(sp: SearchParams, key: string): string | undefined {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
}

function getCompetenciaDefault() {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    return `${ano}-${mes}-01`;
}

export default async function LancesPage({ searchParams }: PageProps) {
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    const sp = (await searchParams) ?? {};
    const competencia = first(sp, "competencia") ?? getCompetenciaDefault();
    const status_cota = first(sp, "status_cota") ?? "ativa";
    const administradora_id = first(sp, "administradora_id") ?? "";
    const produto = first(sp, "produto") ?? "";
    const q = first(sp, "q") ?? "";
    const somente_autorizadas = first(sp, "somente_autorizadas") === "1";

    let error: string | null = null;
    let data: LanceCartaListResponse | null = null;
    let regras: RegraOperadora[] = [];

    try {
        [data, regras] = await Promise.all([
            listLancesCartas({
                competencia,
                status_cota,
                administradora_id: administradora_id || undefined,
                produto: produto || undefined,
                q: q || undefined,
                somente_autorizadas,
                page: 1,
                page_size: 50,
            }),
            listRegrasOperadora(),
        ]);
    } catch (e: unknown) {
        error = e instanceof Error ? e.message : "Erro ao carregar módulo de lances.";
    }

    return (
        <div className="h-full w-full overflow-hidden px-4 md:px-6 py-4">
            <main className="h-full flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3 flex-wrap shrink-0">
                    <div>
                        <h1 className="text-2xl font-semibold">Controle de Lances</h1>
                        <p className="text-sm text-muted-foreground">
                            Acompanhe cartas ativas, organize os lances do mês e registre contemplações.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/app/carteira">
                            <Button variant="outline">Ver Carteira</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4 shrink-0">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Cartas carregadas</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {data?.total ?? 0}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Pendentes do mês</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {data?.items?.filter((i) => i.status_mes === "pendente").length ?? 0}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Feitas</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {data?.items?.filter((i) => i.status_mes === "feito").length ?? 0}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Regras por operadora</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {regras.length}
                        </CardContent>
                    </Card>
                </div>

                <div className="shrink-0">
                    <LancesFilters
                        competencia={competencia}
                        statusCota={status_cota}
                        administradoraId={administradora_id}
                        produto={produto}
                        q={q}
                        somenteAutorizadas={somente_autorizadas}
                        regras={regras}
                    />
                </div>

                {error && (
                    <Card className="bg-red-500/10 border-red-500/30">
                        <CardHeader>
                            <CardTitle className="text-red-300">Erro</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-red-200">
                            {error}
                        </CardContent>
                    </Card>
                )}

                {!error && (
                    <div className="min-h-0 flex-1 overflow-hidden">
                        <div className="h-full overflow-auto pr-1">
                            <LancesTable
                                items={data?.items ?? []}
                                competencia={competencia}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}