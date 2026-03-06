export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getCurrentProfile } from "@/lib/auth/server";
import { listCarteiraClientes, listCarteiraCartas } from "./actions";
import type {
    CarteiraClienteItem,
    CarteiraClientesResponse,
    CarteiraCartaItem,
    CarteiraCartasResponse,
} from "./lib/types";
import { CarteiraFilters } from "./components/carteira-filters";
import { ClientesCards } from "./components/clientes-cards";
import { CartasList } from "./components/cartas-list";

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
    searchParams?: Promise<SearchParams>;
};

function first(sp: SearchParams, k: string): string | undefined {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
}

export default async function CarteiraPage({ searchParams }: PageProps) {
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    const sp: SearchParams = (await searchParams) ?? {};

    const view = first(sp, "view") === "cartas" ? "cartas" : "clientes";
    const includeAll = first(sp, "all") === "1";
    const q = first(sp, "q") ?? "";
    const produto = first(sp, "produto") ?? "";
    const statusCarteira = first(sp, "status_carteira") ?? "";

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
                            <TabsList>
                                <TabsTrigger value="clientes" asChild>
                                    <Link
                                        href={`/app/carteira?view=clientes&all=${includeAll ? 1 : 0}&produto=${encodeURIComponent(
                                            produto
                                        )}&status_carteira=${encodeURIComponent(
                                            statusCarteira
                                        )}&q=${encodeURIComponent(q)}`}
                                    >
                                        Clientes
                                    </Link>
                                </TabsTrigger>

                                <TabsTrigger value="cartas" asChild>
                                    <Link
                                        href={`/app/carteira?view=cartas&all=${includeAll ? 1 : 0}&produto=${encodeURIComponent(
                                            produto
                                        )}&status_carteira=${encodeURIComponent(
                                            statusCarteira
                                        )}&q=${encodeURIComponent(q)}`}
                                    >
                                        Cartas
                                    </Link>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="clientes">
                                <ClientesCards items={(clientesData?.items ?? []) as CarteiraClienteItem[]} />
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