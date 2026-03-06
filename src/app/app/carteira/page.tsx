export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import Link from "next/link";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getCurrentProfile } from "@/lib/auth/server";
import { listCarteiraClientes, listCarteiraCartas } from "./actions/index";

import type {
    ClienteSort,
    CarteiraClienteItem,
    CarteiraClientesResponse,
    CarteiraCartaItem,
    CarteiraCartasResponse,
} from "./lib/types";
import { CarteiraFilters } from "./components/carteira-filters";
import { ClientesCards } from "./components/clientes-cards";
import { ClientesTable } from "./components/clientes-table";
import { CartasList } from "./components/cartas-list";
import { ClientesViewModeToggle } from "./components/clientes-view-mode-toggle";
import { CarteiraViewTabs } from "./components/carteira-view-tabs";

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
    searchParams?: Promise<SearchParams>;
};

function first(sp: SearchParams, k: string): string | undefined {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
}

function parseSort(value?: string): ClienteSort {
    switch (value) {
        case "nome_asc":
        case "total_desc":
        case "qtd_cartas_desc":
        case "maior_carta_desc":
        case "entrada_desc":
            return value;
        default:
            return "entrada_desc";
    }
}

export default async function CarteiraPage({ searchParams }: PageProps) {
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    const cookieStore = await cookies();
    const savedView = cookieStore.get("carteira_view")?.value;
    const savedMode = cookieStore.get("carteira_clientes_mode")?.value;

    const sp: SearchParams = (await searchParams) ?? {};

    const view =
        first(sp, "view") === "cartas"
            ? "cartas"
            : first(sp, "view") === "clientes"
                ? "clientes"
                : savedView === "cartas"
                    ? "cartas"
                    : "clientes";

    const mode =
        first(sp, "mode") === "lista"
            ? "lista"
            : first(sp, "mode") === "cards"
                ? "cards"
                : savedMode === "lista"
                    ? "lista"
                    : "cards";

    const includeAll = first(sp, "all") === "1";
    const q = first(sp, "q") ?? "";
    const produto = first(sp, "produto") ?? "";
    const statusCarteira = first(sp, "status_carteira") ?? "";
    const sort = parseSort(first(sp, "sort"));

    let err: string | null = null;

    let clientesData: CarteiraClientesResponse | null = null;
    let cartasData: CarteiraCartasResponse | null = null;

    try {
        if (view === "clientes") {
            clientesData = await listCarteiraClientes({
                include_all: includeAll,
                produto: produto || null,
                q: q || null,
                status_carteira: statusCarteira || null,
                sort,
            });
        } else {
            cartasData = await listCarteiraCartas({
                include_all: includeAll,
                produto: produto || null,
                q: q || null,
                status_carteira: statusCarteira || null,
            });
        }
    } catch (e: unknown) {
        err = e instanceof Error ? e.message : "Erro ao carregar carteira.";
    }

    return (
        <div className="h-full w-full overflow-hidden px-4 md:px-6 py-4">
            <div className="h-full overflow-hidden">
                <main className="h-full flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap shrink-0">
                        <div>
                            <h1 className="text-2xl font-semibold">Carteira</h1>
                            <p className="text-sm text-muted-foreground">
                                Clientes da carteira com ou sem contrato, com visão por cliente e por carta.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href="/app/leads">
                                <Button variant="outline">Ver Leads</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="shrink-0">
                        <CarteiraFilters
                            view={view}
                            q={q}
                            produto={produto}
                            statusCarteira={statusCarteira}
                            includeAll={includeAll}
                            sort={sort}
                            mode={mode}
                        />
                    </div>

                    {err && (
                        <Card className="bg-red-500/10 border-red-500/30 shrink-0">
                            <CardHeader>
                                <CardTitle className="text-red-300">Erro</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-red-200">{err}</CardContent>
                        </Card>
                    )}

                    {!err && (
                        <Tabs defaultValue={view} className="flex min-h-0 flex-1 flex-col space-y-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap shrink-0">
                                <CarteiraViewTabs currentView={view} />

                                {view === "clientes" && <ClientesViewModeToggle currentMode={mode} />}
                            </div>

                            <div className="min-h-0 flex-1 overflow-hidden">
                                <TabsContent value="clientes" className="h-full mt-0">
                                    <div className="h-full overflow-hidden">
                                        {mode === "cards" ? (
                                            <div className="h-full overflow-auto pr-1">
                                                <ClientesCards items={(clientesData?.items ?? []) as CarteiraClienteItem[]} />
                                            </div>
                                        ) : (
                                            <div className="h-full overflow-hidden">
                                                <ClientesTable items={(clientesData?.items ?? []) as CarteiraClienteItem[]} />
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="cartas" className="h-full mt-0">
                                    <div className="h-full overflow-auto pr-1">
                                        <CartasList items={(cartasData?.items ?? []) as CarteiraCartaItem[]} />
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    )}
                </main>
            </div>
        </div>
    );
}