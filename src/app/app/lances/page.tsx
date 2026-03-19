export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listLancesCartas, listRegrasOperadora } from "./actions/carta-actions";
import { LancesFilters } from "./components/lances-filters";
import { LancesTable } from "./components/lances-table";
import { LancesOperacaoOverview } from "./components/LancesOperacaoOverview";
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

    if (!me?.orgId) {
        return <main className="p-6">Vincule-se a uma organização.</main>;
    }

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
        error =
            e instanceof Error ? e.message : "Erro ao carregar módulo de lances.";
    }

    return (
        <div className="h-full overflow-hidden">
            <div className="h-full px-4 py-4 md:px-6">
                <div className="flex h-full flex-col gap-4 overflow-hidden">
                    {/* MOBILE: página inteira rola */}
                    <div className="md:hidden h-full overflow-y-auto pr-1">
                        <div className="flex flex-col gap-4 pb-4">
                            <div className="flex flex-col gap-3">
                                <div>
                                    <h1 className="text-xl font-semibold">Lances do mês</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Defina o lance, acompanhe a execução e dê baixa no que já foi tratado.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link href="/app/carteira">
                                        <Button variant="outline" size="sm" className="w-full">
                                            Ver Carteira
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <LancesOperacaoOverview items={data?.items ?? []} />

                            <LancesFilters
                                competencia={competencia}
                                statusCota={status_cota}
                                administradoraId={administradora_id}
                                produto={produto}
                                q={q}
                                somenteAutorizadas={somente_autorizadas}
                                regras={regras}
                            />

                            {error ? (
                                <Card className="border-red-500/30 bg-red-500/10">
                                    <CardHeader>
                                        <CardTitle className="text-red-300">Erro</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-red-200">
                                        {error}
                                    </CardContent>
                                </Card>
                            ) : (
                                <LancesTable
                                    items={data?.items ?? []}
                                    competencia={competencia}
                                />
                            )}
                        </div>
                    </div>

                    {/* DESKTOP: topo fixo + somente tabela rola */}
                    <div className="hidden md:flex md:h-full md:min-h-0 md:flex-col md:gap-4">
                        <div className="shrink-0 space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h1 className="text-xl font-semibold md:text-2xl">
                                        Lances do mês
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Defina o lance, acompanhe a execução e dê baixa no que já foi tratado.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link href="/app/carteira">
                                        <Button variant="outline" size="sm" className="sm:h-10">
                                            Ver Carteira
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <LancesOperacaoOverview items={data?.items ?? []} />

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

                        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                            {error ? (
                                <Card className="border-red-500/30 bg-red-500/10">
                                    <CardHeader>
                                        <CardTitle className="text-red-300">Erro</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-red-200">
                                        {error}
                                    </CardContent>
                                </Card>
                            ) : (
                                <LancesTable
                                    items={data?.items ?? []}
                                    competencia={competencia}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}