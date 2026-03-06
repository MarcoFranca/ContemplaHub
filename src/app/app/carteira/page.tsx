export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import { ClientesViewModeToggle } from "./components/clientes-view-mode-toggle";
import { CarteiraFilters } from "./components/carteira-filters";
import { ClientesCards } from "./components/clientes-cards";
import { ClientesTable } from "./components/clientes-table";
import { CartasList } from "./components/cartas-list";

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
    searchParams?: Promise<SearchParams>;
};

function first(sp: SearchParams, k: string): string | undefined {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
}

function buildHref(params: {
    view: "clientes" | "cartas";
    mode?: "cards" | "lista";
    includeAll: boolean;
    produto: string;
    statusCarteira: string;
    q: string;
    sort?: string;
}) {
    const qp = new URLSearchParams({
        view: params.view,
        all: params.includeAll ? "1" : "0",
        produto: params.produto,
        status_carteira: params.statusCarteira,
        q: params.q,
    });

    if (params.mode && params.view === "clientes") {
        qp.set("mode", params.mode);
    }

    if (params.sort && params.view === "clientes") {
        qp.set("sort", params.sort);
    }

    return `/app/carteira?${qp.toString()}`;
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

    const sp: SearchParams = (await searchParams) ?? {};

    const view = first(sp, "view") === "cartas" ? "cartas" : "clientes";
    const cookieStore = await cookies();
    const savedMode = cookieStore.get("carteira_clientes_mode")?.value;

    const mode =
        first(sp, "mode") === "lista"
            ? "lista"
            : first(sp, "mode") === "cards"
                ? "cards"
                : savedMode === "lista"
                    ? "lista"
                    : "cards";    const includeAll = first(sp, "all") === "1";
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
                sort: sort || "entrada_desc",
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
            <div className="h-full overflow-auto">
                <main className="space-y-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
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

                    <CarteiraFilters
                        view={view}
                        q={q}
                        produto={produto}
                        statusCarteira={statusCarteira}
                        includeAll={includeAll}
                        sort={sort}
                        mode={mode}
                    />

                    {err && (
                        <Card className="bg-red-500/10 border-red-500/30">
                            <CardHeader>
                                <CardTitle className="text-red-300">Erro</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-red-200">{err}</CardContent>
                        </Card>
                    )}

                    {!err && (
                        <Tabs defaultValue={view} className="space-y-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <TabsList>
                                    <TabsTrigger value="clientes" asChild>
                                        <Link
                                            href={buildHref({
                                                view: "clientes",
                                                mode,
                                                includeAll,
                                                produto,
                                                statusCarteira,
                                                q,
                                                sort,
                                            })}
                                        >
                                            Clientes
                                        </Link>
                                    </TabsTrigger>

                                    <TabsTrigger value="cartas" asChild>
                                        <Link
                                            href={buildHref({
                                                view: "cartas",
                                                includeAll,
                                                produto,
                                                statusCarteira,
                                                q,
                                            })}
                                        >
                                            Cartas
                                        </Link>
                                    </TabsTrigger>
                                </TabsList>

                                {view === "clientes" && <ClientesViewModeToggle currentMode={mode} />}
                            </div>

                            <TabsContent value="clientes">
                                {mode === "cards" ? (
                                    <ClientesCards items={(clientesData?.items ?? []) as CarteiraClienteItem[]} />
                                ) : (
                                    <ClientesTable items={(clientesData?.items ?? []) as CarteiraClienteItem[]} />
                                )}
                            </TabsContent>

                            <TabsContent value="cartas">
                                <CartasList items={(cartasData?.items ?? []) as CarteiraCartaItem[]} />
                            </TabsContent>
                        </Tabs>
                    )}
                </main>
            </div>
        </div>
    );
}