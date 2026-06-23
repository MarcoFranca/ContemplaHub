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
    contrato_numero?: string | null;
    cliente_nome?: string | null;
    numero_cota?: string | null;
    grupo_codigo?: string | null;
    competencia_prevista?: string | null;
    status?: string | null;
    repasse_status?: string | null;
    tipo_evento?: string | null;
    valor_bruto?: number | string | null;
    valor_liquido?: number | string | null;
    repasse_previsto_em?: string | null;
};

const EVENTO_LABEL: Record<string, string> = {
    adesao: "Adesão",
    primeira_cobranca_valida: "1ª cobrança",
    proxima_cobranca: "Cobrança",
    contemplacao: "Contemplação",
    manual: "Manual",
};

const REPASSE_LABEL: Record<string, { label: string; cls: string }> = {
    pendente: { label: "A receber", cls: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
    pago: { label: "Recebido", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    cancelado: { label: "Cancelado", cls: "border-rose-500/30 bg-rose-500/10 text-rose-300" },
};

function mesLabel(iso?: string | null) {
    if (!iso) return "Sem competência";
    const [y, m] = iso.slice(0, 10).split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(y, m - 1, 1));
}

function dataLabel(iso?: string | null) {
    if (!iso) return "Não informado";
    const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR").format(new Date(y, m - 1, d));
}

const brl = (v: number | string | null | undefined) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

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
        valor_liquido_pendente?: number;
        valor_liquido_pago?: number;
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
                    <Metric label="A receber" value={brl(resumo.valor_liquido_pendente)} />
                    <Metric label="Recebido" value={brl(resumo.valor_liquido_pago)} />
                    <Metric label="Líquido total" value={brl(resumo.valor_liquido_total)} />
                    <Metric label="Lançamentos" value={String(resumo.total_lancamentos || 0)} />
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
                                        <div className="min-w-0">
                                            <div className="font-medium">
                                                {row.cliente_nome
                                                    || (row.contrato_numero
                                                        ? `Contrato ${row.contrato_numero}`
                                                        : "Cliente sem nome")}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {row.contrato_numero ? `Contrato ${row.contrato_numero}` : "Contrato pendente"}
                                                {row.grupo_codigo ? ` · Grupo ${row.grupo_codigo}` : ""}
                                                {row.numero_cota ? ` · Cota ${row.numero_cota}` : ""}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {(() => {
                                                const r = REPASSE_LABEL[row.repasse_status ?? ""];
                                                return r ? (
                                                    <Badge variant="outline" className={r.cls}>{r.label}</Badge>
                                                ) : (
                                                    <Badge variant="outline">{row.repasse_status || "Sem repasse"}</Badge>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="mt-3 grid gap-3 md:grid-cols-4 text-sm">
                                        <Info label="Competência" value={mesLabel(row.competencia_prevista)} />
                                        <Info label="Evento" value={EVENTO_LABEL[row.tipo_evento ?? ""] || row.tipo_evento || "Não informado"} />
                                        <Info label="Valor líquido" value={brl(row.valor_liquido)} />
                                        <Info label="Repasse previsto" value={dataLabel(row.repasse_previsto_em)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {meta && (
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm text-muted-foreground">
                            <div>
                                Página {meta.page} de {meta.total_pages} · {meta.total} registro(s)
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