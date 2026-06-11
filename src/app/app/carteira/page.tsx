import { CreateCarteiraCartaSheet, type ClienteCartaOption } from "@/app/app/carteira/ui/CreateCarteiraCartaSheet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { getContratoFormOptions } from "@/features/contratos/server/get-form-options";
import { getCurrentProfile } from "@/lib/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeaderActionsPortal } from "@/components/app/HeaderActionsPortal";

import { listCarteiraCartas, listCarteiraClientes } from "./actions/index";
import { CartasList } from "./components/cartas-list";
import { CarteiraFilters } from "./components/carteira-filters";
import { CarteiraPagination } from "./components/carteira-pagination";
import { CarteiraViewTabs } from "./components/carteira-view-tabs";
import { ClientesCards } from "./components/clientes-cards";
import { ClientesTable } from "./components/clientes-table";
import { ClientesViewModeToggle } from "./components/clientes-view-mode-toggle";
import type {
    CarteiraCartaItem,
    CarteiraCartasResponse,
    CarteiraClienteItem,
    CarteiraClientesResponse,
    ClienteSort,
} from "./lib/types";

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

function parsePositiveInt(value?: string, fallback = 1) {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildBaseHref(params: {
    view: "clientes" | "cartas";
    q: string;
    produto: string;
    statusCarteira: string;
    administradoraId: string;
    semContrato: boolean;
    includeAll: boolean;
    sort: ClienteSort;
}) {
    const qs = new URLSearchParams();

    qs.set("view", params.view);

    if (params.q) qs.set("q", params.q);
    if (params.produto) qs.set("produto", params.produto);
    if (params.statusCarteira) qs.set("status_carteira", params.statusCarteira);
    if (params.administradoraId) qs.set("administradora_id", params.administradoraId);
    if (params.semContrato) qs.set("sem_contrato", "1");
    if (params.includeAll) qs.set("all", "1");
    if (params.sort) qs.set("sort", params.sort);

    return `/app/carteira?${qs.toString()}`;
}

function buildPageHref(baseHref: string, page: number) {
    const url = new URL(baseHref, "http://localhost");
    if (page <= 1) {
        url.searchParams.delete("page");
    } else {
        url.searchParams.set("page", String(page));
    }
    return `${url.pathname}?${url.searchParams.toString()}`;
}

export default async function CarteiraPage({ searchParams }: PageProps) {
    const me = await getCurrentProfile();

    if (!me?.orgId) {
        return <main className="p-6">Vincule-se a uma organizacao.</main>;
    }

    const cookieStore = await cookies();
    const savedView = cookieStore.get("carteira_view")?.value;
    const savedMode = cookieStore.get("carteira_mode")?.value;
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
    const administradoraId = first(sp, "administradora_id") ?? "";
    const semContrato = first(sp, "sem_contrato") === "1";
    const sort = parseSort(first(sp, "sort"));
    const currentPage = parsePositiveInt(first(sp, "page"), 1);

    const logContext = {
        orgId: me.orgId,
        view,
        mode,
        filters: {
            includeAll,
            q: q || null,
            produto: produto || null,
            statusCarteira: statusCarteira || null,
            administradoraId: administradoraId || null,
            semContrato,
            sort,
        },
    };

    let err: string | null = null;

    let clientesData: CarteiraClientesResponse | null = null;
    let clientesBaseData: CarteiraClientesResponse | null = null;
    let cartasData: CarteiraCartasResponse | null = null;
    let administradoras: { id: string; nome: string }[] = [];
    let parceiros: { id: string; nome: string }[] = [];

    try {
        logPageInfo("[carteira-page] load:start", logContext);

        const formOptionsPromise = getContratoFormOptions();

        if (view === "clientes") {
            const [clientesView, formOptions] = await Promise.all([
                listCarteiraClientes({
                    include_all: includeAll,
                    produto: produto || null,
                    q: q || null,
                    status_carteira: statusCarteira || null,
                    administradora_id: administradoraId || null,
                    sem_contrato: semContrato,
                    sort,
                }),
                formOptionsPromise,
            ]);

            clientesData = clientesView;
            clientesBaseData = clientesView;
            administradoras = formOptions.administradoras;
            parceiros = formOptions.parceiros;

            logPageInfo("[carteira-page] load:clientes", {
                ...logContext,
                clientes: clientesView.total,
                administradoras: administradoras.length,
                parceiros: parceiros.length,
            });
        } else {
            const clientesBasePromise = listCarteiraClientes({
                include_all: true,
                produto: null,
                q: null,
                status_carteira: null,
                sort: "nome_asc",
            });

            const [clientesBase, cartasView, formOptions] = await Promise.all([
                clientesBasePromise,
                listCarteiraCartas({
                    include_all: includeAll,
                    produto: produto || null,
                    q: q || null,
                    status_carteira: statusCarteira || null,
                    administradora_id: administradoraId || null,
                    sem_contrato: semContrato,
                }),
                formOptionsPromise,
            ]);

            clientesBaseData = clientesBase;
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
    const clientesOptionsSource = (clientesBaseData?.items ?? clientesItems) as CarteiraClienteItem[];
    const pageSize = view === "cartas" ? 18 : mode === "lista" ? 14 : 12;
    const sourceItems = view === "cartas" ? cartasItems : clientesItems;
    const totalItems = sourceItems.length;
    const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(currentPage, pageCount);
    const sliceStart = (safePage - 1) * pageSize;
    const sliceEnd = sliceStart + pageSize;
    const pagedClientesItems = clientesItems.slice(sliceStart, sliceEnd);
    const pagedCartasItems = cartasItems.slice(sliceStart, sliceEnd);

    const clientesParaCarta: ClienteCartaOption[] = clientesOptionsSource
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
        administradoraId,
        semContrato,
        includeAll,
        sort,
    });

    const cartasHref = buildBaseHref({
        view: "cartas",
        q,
        produto,
        statusCarteira,
        administradoraId,
        semContrato,
        includeAll,
        sort,
    });

    return (
        <div className="h-full w-full overflow-hidden px-4 py-4 md:px-6">
            <main className="flex h-full min-h-0 flex-col gap-3">
                <HeaderActionsPortal>
                    <CreateCarteiraCartaSheet
                        clientes={clientesParaCarta}
                        administradoras={administradoras}
                        parceiros={parceiros}
                        triggerLabel="Cadastrar carta"
                        triggerVariant="outline"
                    />
                </HeaderActionsPortal>

                <section className="sticky top-0 z-20 shrink-0">
                    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.92))] shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-2xl">
                        <div className="flex flex-col gap-3 px-4 py-3 md:px-5">
                            <div className="grid gap-3 xl:grid-cols-[auto,1fr] xl:items-center">
                                <div className="flex items-center gap-2">
                                    <CarteiraViewTabs
                                        current={view}
                                        clientesHref={clientesHref}
                                        cartasHref={cartasHref}
                                    />

                                    {view === "clientes" ? (
                                        <ClientesViewModeToggle
                                            current={mode}
                                            baseHref={clientesHref}
                                        />
                                    ) : null}
                                </div>

                                <div className="min-w-0">
                                    <CarteiraFilters
                                        view={view}
                                        q={q}
                                        produto={produto}
                                        statusCarteira={statusCarteira}
                                        administradoraId={administradoraId}
                                        semContrato={semContrato}
                                        includeAll={includeAll}
                                        sort={sort}
                                        mode={mode}
                                        administradoras={administradoras}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {err ? (
                    <Card className="shrink-0 border-red-500/30 bg-red-500/10">
                        <CardHeader>
                            <CardTitle className="text-red-300">Erro</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-red-200">{err}</CardContent>
                    </Card>
                ) : (
                    <section className="min-h-0 flex-1 overflow-hidden">
                        {view === "clientes" ? (
                            mode === "cards" ? (
                                <div className="h-full overflow-auto pr-1">
                                    <ClientesCards
                                        items={pagedClientesItems}
                                        administradoras={administradoras}
                                        parceiros={parceiros}
                                    />
                                </div>
                            ) : (
                                <div className="h-full overflow-auto pr-1">
                                    <ClientesTable
                                        items={pagedClientesItems}
                                        administradoras={administradoras}
                                        parceiros={parceiros}
                                    />
                                </div>
                            )
                        ) : (
                            <div className="h-full overflow-auto pr-1">
                                <CartasList items={pagedCartasItems} />
                            </div>
                        )}
                    </section>
                )}

                {!err ? (
                    <section className="shrink-0">
                        <CarteiraPagination
                            currentPage={safePage}
                            pageCount={pageCount}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            buildPageHref={(page) =>
                                buildPageHref(view === "cartas" ? cartasHref : clientesHref, page)
                            }
                        />
                    </section>
                ) : null}
            </main>
        </div>
    );
}
