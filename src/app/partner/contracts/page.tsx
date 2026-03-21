// src/app/partner/contracts/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentPartnerAccess } from "@/lib/auth/partner-server";
import { partnerBackendFetch } from "@/lib/backend-partner";

type SearchParams = Promise<{
    page?: string;
    page_size?: string;
    status?: string;
    q?: string;
    sort_by?: string;
    sort_order?: string;
}>;

type PartnerContractItem = {
    link?: {
        id: string;
        contrato_id: string;
        parceiro_id: string;
        origem?: string | null;
        principal?: boolean;
        observacoes?: string | null;
        created_at?: string | null;
        updated_at?: string | null;
    } | null;
    contrato: {
        id: string;
        numero?: string | null;
        status?: string | null;
        pdf_status?: string | null;
    };
    cota?: {
        numero_cota?: string | null;
        grupo_codigo?: string | null;
    } | null;
    cliente?: {
        nome?: string | null;
    } | null;
    commission_summary?: {
        valor_liquido_total?: number;
        total_lancamentos?: number;
    } | null;
};

type PartnerContractsResponse = {
    ok: boolean;
    items: PartnerContractItem[];
    meta?: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
    } | null;
};

export default async function PartnerContractsPage({
                                                       searchParams,
                                                   }: {
    searchParams: SearchParams;
}) {
    const supabase = await supabaseServer();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user || !session?.access_token) {
        redirect("/login");
    }

    const partner = await getCurrentPartnerAccess();
    if (!partner) {
        redirect("/app");
    }

    if (!partner.canViewContracts) {
        notFound();
    }

    const params = await searchParams;

    const qs = new URLSearchParams();
    if (params.page) qs.set("page", params.page);
    if (params.page_size) qs.set("page_size", params.page_size);
    if (params.status) qs.set("status", params.status);
    if (params.q) qs.set("q", params.q);
    if (params.sort_by) qs.set("sort_by", params.sort_by);
    if (params.sort_order) qs.set("sort_order", params.sort_order);

    const data = (await partnerBackendFetch(`/partner/contracts?${qs.toString()}`, {
        method: "GET",
        accessToken: session.access_token,
    })) as PartnerContractsResponse | null;

    const items = data?.items ?? [];
    const meta = data?.meta ?? null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Meus contratos</h1>
                <p className="text-sm text-muted-foreground">
                    Acompanhe contratos vinculados ao seu acesso.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Contratos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {items.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Nenhum contrato encontrado.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {items.map((item: PartnerContractItem) => {
                                const contrato = item.contrato;
                                const cota = item.cota;
                                const cliente = item.cliente;
                                const summary = item.commission_summary;

                                return (
                                    <Link
                                        key={contrato.id}
                                        href={`/partner/contracts/${contrato.id}`}
                                        className="rounded-2xl border border-border/60 p-4 transition-colors hover:bg-muted/40"
                                    >
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-base font-medium">
                                                        Contrato {contrato.numero || "—"}
                                                    </span>
                                                    <Badge variant="secondary">
                                                        {contrato.status || "sem status"}
                                                    </Badge>
                                                    {contrato.pdf_status && (
                                                        <Badge variant="outline">
                                                            PDF: {contrato.pdf_status}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="text-sm text-muted-foreground">
                                                    Cota {cota?.numero_cota || "—"} • Grupo{" "}
                                                    {cota?.grupo_codigo || "—"}
                                                </div>

                                                <div className="text-sm text-muted-foreground">
                                                    Cliente: {cliente?.nome || "Não disponível"}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm md:min-w-[260px]">
                                                <div className="rounded-xl bg-muted/50 p-3">
                                                    <div className="text-muted-foreground">
                                                        Valor líquido
                                                    </div>
                                                    <div className="font-medium">
                                                        R${" "}
                                                        {Number(
                                                            summary?.valor_liquido_total || 0
                                                        ).toLocaleString("pt-BR", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="rounded-xl bg-muted/50 p-3">
                                                    <div className="text-muted-foreground">
                                                        Lançamentos
                                                    </div>
                                                    <div className="font-medium">
                                                        {summary?.total_lancamentos || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {meta && (
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-muted-foreground">
                            <div>
                                Página {meta.page} de {meta.total_pages} • {meta.total} registro(s)
                            </div>
                            <div className="flex items-center gap-2">
                                {meta.has_prev && (
                                    <Link
                                        className="rounded-lg border px-3 py-1.5 hover:bg-muted"
                                        href={`?page=${meta.page - 1}&page_size=${meta.page_size}`}
                                    >
                                        Anterior
                                    </Link>
                                )}
                                {meta.has_next && (
                                    <Link
                                        className="rounded-lg border px-3 py-1.5 hover:bg-muted"
                                        href={`?page=${meta.page + 1}&page_size=${meta.page_size}`}
                                    >
                                        Próxima
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}