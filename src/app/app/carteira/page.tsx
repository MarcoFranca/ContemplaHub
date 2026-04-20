import { CreateCarteiraCartaSheet, type ClienteCartaOption } from "@/app/app/carteira/ui/CreateCarteiraCartaSheet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContratoFormOptions } from "@/features/contratos/server/get-form-options";
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
import { CreateCarteiraClienteSheet } from "./ui/CreateCarteiraClienteSheet";

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
    searchParams?: Promise<SearchParams>;
};

function serializePageError(error: unknown) {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }

    if (typeof error === "object" && error !== null) {
        return error;
    }

    return { message: String(error) };
}

function logPageInfo(event: string, payload: unknown) {
    console.info(`${event} ${JSON.stringify(payload)}`);
}

function logPageError(event: string, payload: unknown) {
    console.error(`${event} ${JSON.stringify(payload)}`);
}

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

function buildBaseHref(params: {
    view: "clientes" | "cartas";
    q: string;
    produto: string;
    statusCarteira: string;
    includeAll: boolean;
    sort: ClienteSort;
}) {
    const qs = new URLSearchParams();

    qs.set("view", params.view);

    if (params.q) qs.set("q", params.q);
    if (params.produto) qs.set("produto", params.produto);
    if (params.statusCarteira) qs.set("status_carteira", params.statusCarteira);
    if (params.includeAll) qs.set("all", "1");
    if (params.sort) qs.set("sort", params.sort);

    return `/app/carteira?${qs.toString()}`;
}

export default async function CarteiraPage({ searchParams }: PageProps) {
    const me = await getCurrentProfile();

    if (!me?.orgId) {
        return <main className="p-6">Vincule-se a uma organização.</main>;
    }

    const cookieStore = await cookies();
    const savedView = cookieStore.get("carteira_view")?.value;

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
                : "cards";

    const includeAll = first(sp, "all") === "1";
    const q = first(sp, "q") ?? "";
    const produto = first(sp, "produto") ?? "";
    const statusCarteira = first(sp, "status_carteira") ?? "";
    const sort = parseSort(first(sp, "sort"));
    const logContext = {
        orgId: me.orgId,
        view,
        mode,
        filters: {
            includeAll,
            q: q || null,
            produto: produto || null,
            statusCarteira: statusCarteira || null,
            sort,
        },
    };

    let err: string | null = null;

    let clientesData: CarteiraClientesResponse | null = null;
    let cartasData: CarteiraCartasResponse | null = null;
    let administradoras: { id: string; nome: string }[] = [];
    let parceiros: { id: string; nome: string }[] = [];

    try {
        logPageInfo("[carteira-page] load:start", logContext);
        const clientesBasePromise = listCarteiraClientes({
            include_all: true,
            produto: null,
            q: null,
            status_carteira: null,
            sort: "nome_asc",
        });

        const formOptionsPromise = getContratoFormOptions();

        if (view === "clientes") {
            const [, clientesView, formOptions] = await Promise.all([
                clientesBasePromise,
                listCarteiraClientes({
                    include_all: includeAll,
                    produto: produto || null,
                    q: q || null,
                    status_carteira: statusCarteira || null,
                    sort,
                }),
                formOptionsPromise,
            ]);

            clientesData = clientesView;
            administradoras = formOptions.administradoras;
            parceiros = formOptions.parceiros;
            logPageInfo("[carteira-page] load:clientes", {
                ...logContext,
                clientes: clientesView.total,
                administradoras: administradoras.length,
                parceiros: parceiros.length,
            });
        } else {
            const [clientesBase, cartasView, formOptions] = await Promise.all([
                clientesBasePromise,
                listCarteiraCartas({
                    include_all: includeAll,
                    produto: produto || null,
                    q: q || null,
                    status_carteira: statusCarteira || null,
                }),
                formOptionsPromise,
            ]);

            clientesData = clientesBase;
            cartasData = cartasView;
            administradoras = formOptions.administradoras;
            parceiros = formOptions.parceiros;
            logPageInfo("[carteira-page] load:cartas", {
                ...logContext,
                clientes: clientesBase.total,
                cartas: cartasView.total,
                administradoras: administradoras.length,
                parceiros: parceiros.length,
            });
        }
    } catch (e: unknown) {
        logPageError("[carteira-page] load:error", {
            ...logContext,
            error: serializePageError(e),
        });
        err = e instanceof Error ? e.message : "Erro ao carregar carteira.";
    }

    const clientesItems = (clientesData?.items ?? []) as CarteiraClienteItem[];
    const cartasItems = (cartasData?.items ?? []) as CarteiraCartaItem[];

    const clientesParaCarta: ClienteCartaOption[] = clientesItems
        .map((item) => ({
            id: String(item.cliente?.lead_id ?? "").trim(),
            nome: String(item.cliente?.nome ?? "Cliente sem nome"),
            telefone: item.cliente?.telefone ?? undefined,
            email: item.cliente?.email ?? undefined,
        }))
        .filter((item) => item.id !== "");

    const clientesHref = buildBaseHref({
        view: "clientes",
        q,
        produto,
        statusCarteira,
        includeAll,
        sort,
    });

    const cartasHref = buildBaseHref({
        view: "cartas",
        q,
        produto,
        statusCarteira,
        includeAll,
        sort,
    });

    return (
        <div className="h-full w-full overflow-hidden px-4 py-4 md:px-6">
            <div className="h-full overflow-hidden">
                <main className="flex h-full flex-col gap-4">
                    <div className="flex shrink-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Carteira</h1>
                            <p className="text-sm text-muted-foreground">
                                Clientes da carteira com ou sem contrato, com visão por cliente e por carta.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Link href="/app/leads">
                                <Button variant="outline">Ver Leads</Button>
                            </Link>

                            <CreateCarteiraCartaSheet
                                clientes={clientesParaCarta}
                                administradoras={administradoras}
                                parceiros={parceiros}
                                triggerLabel="Cadastrar carta"
                                triggerVariant="outline"
                            />

                            <CreateCarteiraClienteSheet />
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
                        <Card className="shrink-0 border-red-500/30 bg-red-500/10">
                            <CardHeader>
                                <CardTitle className="text-red-300">Erro</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-red-200">{err}</CardContent>
                        </Card>
                    )}

                    {!err && (
                        <>
                            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <CarteiraViewTabs
                                    current={view}
                                    clientesHref={clientesHref}
                                    cartasHref={cartasHref}
                                />

                                {view === "clientes" && (
                                    <ClientesViewModeToggle
                                        current={mode}
                                        baseHref={clientesHref}
                                        explicitMode={Boolean(first(sp, "mode"))}
                                    />
                                )}
                            </div>

                            <div className="min-h-0 flex-1 overflow-hidden">
                                {view === "clientes" ? (
                                    mode === "cards" ? (
                                        <div className="h-full overflow-auto pr-1">
                                            <ClientesCards
                                                items={clientesItems}
                                                administradoras={administradoras}
                                                parceiros={parceiros}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-full overflow-auto pr-1">
                                            <ClientesTable
                                                items={clientesItems}
                                                administradoras={administradoras}
                                                parceiros={parceiros}
                                            />
                                        </div>
                                    )
                                ) : (
                                    <div className="h-full overflow-auto pr-1">
                                        <CartasList items={cartasItems} />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
