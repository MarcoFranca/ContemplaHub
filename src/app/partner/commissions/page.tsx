// src/app/partner/commissions/page.tsx
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
    repasse_status?: string;
    contrato_id?: string;
    competencia_de?: string;
    competencia_ate?: string;
    sort_by?: string;
    sort_order?: string;
}>;

type PartnerCommissionRow = {
    id: string;
    contrato_id?: string | null;
    competencia_prevista?: string | null;
    status?: string | null;
    repasse_status?: string | null;
    tipo_evento?: string | null;
    valor_bruto?: number | string | null;
    valor_liquido?: number | string | null;
    repasse_previsto_em?: string | null;
};

type PartnerCommissionsResponse = {
    ok: boolean;
    items: PartnerCommissionRow[];
    meta?: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
    } | null;
    resumo?: {
        total_lancamentos?: number;
        valor_bruto_total?: number;
        valor_liquido_total?: number;
        pagos?: number;
        pendentes?: number;
    } | null;
};

export default async function PartnerCommissionsPage({
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

    if (!partner.canViewCommissions) {
        notFound();
    }

    const params = await searchParams;

    const qs = new URLSearchParams();
    if (params.page) qs.set("page", params.page);
    if (params.page_size) qs.set("page_size", params.page_size);
    if (params.status) qs.set("status", params.status);
    if (params.repasse_status) qs.set("repasse_status", params.repasse_status);
    if (params.contrato_id) qs.set("contrato_id", params.contrato_id);
    if (params.competencia_de) qs.set("competencia_de", params.competencia_de);
    if (params.competencia_ate) qs.set("competencia_ate", params.competencia_ate);
    if (params.sort_by) qs.set("sort_by", params.sort_by);
    if (params.sort_order) qs.set("sort_order", params.sort_order);

    const data = (await partnerBackendFetch(`/partner/commissions?${qs.toString()}`, {
        method: "GET",
        accessToken: session.access_token,
    })) as PartnerCommissionsResponse | null;

    const items = data?.items ?? [];
    const meta = data?.meta ?? null;
    const resumo = data?.resumo ?? null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Minhas comissões</h1>
                <p className="text-sm text-muted-foreground">
                    Consulte lançamentos, status e repasses.
                </p>
            </div>

            {resumo && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Metric
                        label="Bruto total"
                        value={`R$ ${Number(resumo.valor_bruto_total || 0).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`}
                    />
                    <Metric
                        label="Líquido total"
                        value={`R$ ${Number(resumo.valor_liquido_total || 0).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`}
                    />
                    <Metric label="Pagos" value={String(resumo.pagos || 0)} />
                    <Metric label="Pendentes" value={String(resumo.pendentes || 0)} />
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Lançamentos</CardTitle>
                </CardHeader>

                <CardContent>
                    {items.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Nenhum lançamento encontrado.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((row: PartnerCommissionRow) => (
                                <div
                                    key={row.id}
                                    className="rounded-xl border border-border/60 p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <div className="font-medium">
                                                Contrato {row.contrato_id || "—"}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Competência prevista:{" "}
                                                {row.competencia_prevista || "—"}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary">
                                                {row.status || "—"}
                                            </Badge>
                                            <Badge variant="outline">
                                                {row.repasse_status || "—"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="mt-3 grid gap-3 md:grid-cols-4 text-sm">
                                        <Info label="Evento" value={row.tipo_evento || "—"} />
                                        <Info
                                            label="Valor bruto"
                                            value={`R$ ${Number(row.valor_bruto || 0).toLocaleString("pt-BR", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}`}
                                        />
                                        <Info
                                            label="Valor líquido"
                                            value={`R$ ${Number(row.valor_liquido || 0).toLocaleString("pt-BR", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}`}
                                        />
                                        <Info
                                            label="Repasse previsto"
                                            value={row.repasse_previsto_em || "—"}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {meta && (
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm text-muted-foreground">
                            <div>
                                Página {meta.page} de {meta.total_pages} • {meta.total} registro(s)
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {label}
            </div>
            <div className="mt-1 text-sm font-medium">{value}</div>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-muted/50 p-4">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-1 text-lg font-semibold">{value}</div>
        </div>
    );
}