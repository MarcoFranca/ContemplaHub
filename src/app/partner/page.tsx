import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, FileText, Wallet, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentPartnerAccess } from "@/lib/auth/partner-server";
import { partnerBackendFetch } from "@/lib/backend-partner";
import { PartnerHomeChart } from "@/components/partner/PartnerHomeChart";

type CommissionRow = {
    id: string;
    contrato_id?: string | null;
    contrato_numero?: string | null;
    cliente_nome?: string | null;
    numero_cota?: string | null;
    grupo_codigo?: string | null;
    competencia_prevista?: string | null;
    valor_liquido?: number | string | null;
    repasse_status?: string | null;
};

type CommissionsResponse = {
    items: CommissionRow[];
    resumo?: {
        valor_liquido_pendente?: number;
        valor_liquido_pago?: number;
        repasse_pendente?: number;
        repasse_pago?: number;
    } | null;
};

const brl = (v: number | string | null | undefined) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

function mesLabel(iso?: string | null) {
    if (!iso) return "Sem competência";
    const [y, m] = iso.slice(0, 10).split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" })
        .format(new Date(y, m - 1, 1))
        .replace(".", "");
}

const REPASSE: Record<string, { label: string; cls: string }> = {
    pendente: { label: "A receber", cls: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
    pago: { label: "Recebido", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    cancelado: { label: "Cancelado", cls: "border-rose-500/30 bg-rose-500/10 text-rose-300" },
};

export default async function PartnerHomePage() {
    const supabase = await supabaseServer();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user || !session.access_token) redirect("/login");

    const partner = await getCurrentPartnerAccess();
    if (!partner) redirect("/app");

    const accessToken = session.access_token;

    const [commissions, contracts] = await Promise.all([
        partner.canViewCommissions
            ? (partnerBackendFetch(`/partner/commissions?page_size=200&sort_by=competencia_prevista&sort_order=desc`, {
                  method: "GET",
                  accessToken,
              }) as Promise<CommissionsResponse | null>)
            : Promise.resolve(null),
        partner.canViewContracts
            ? (partnerBackendFetch(`/partner/contracts?page_size=1`, { method: "GET", accessToken }) as Promise<{
                  meta?: { total?: number } | null;
              } | null>)
            : Promise.resolve(null),
    ]);

    const resumo = commissions?.resumo ?? null;
    const items = commissions?.items ?? [];
    const totalContratos = contracts?.meta?.total ?? 0;

    // Série mensal (líquido por competência), últimos 12 meses
    const porMes = new Map<string, number>();
    for (const it of items) {
        const ym = (it.competencia_prevista ?? "").slice(0, 7);
        if (!ym) continue;
        porMes.set(ym, (porMes.get(ym) ?? 0) + Number(it.valor_liquido || 0));
    }
    const serie = [...porMes.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-12)
        .map(([ym, valor]) => ({ label: mesLabel(`${ym}-01`), valor }));

    const recentes = items.slice(0, 6);

    const kpis = [
        { label: "A receber", value: brl(resumo?.valor_liquido_pendente), icon: Clock, hint: `${resumo?.repasse_pendente ?? 0} repasse(s)`, show: partner.canViewCommissions },
        { label: "Recebido", value: brl(resumo?.valor_liquido_pago), icon: CheckCircle2, hint: `${resumo?.repasse_pago ?? 0} repasse(s)`, show: partner.canViewCommissions },
        { label: "Contratos", value: String(totalContratos), icon: FileText, hint: "vinculados a você", show: partner.canViewContracts },
    ].filter((k) => k.show);

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Início</p>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Olá, {partner.nome || "Parceiro"}
                </h1>
                <p className="text-sm text-muted-foreground">
                    Acompanhe seus repasses, comissões e contratos em um só lugar.
                </p>
            </div>

            {/* KPIs */}
            {kpis.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {kpis.map((k) => {
                        const Icon = k.icon;
                        return (
                            <Card key={k.label}>
                                <CardHeader className="pb-1">
                                    <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                        <Icon className="h-4 w-4 text-emerald-400" />
                                        {k.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-semibold tabular-nums">{k.value}</div>
                                    <p className="text-[11px] text-muted-foreground">{k.hint}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {partner.canViewCommissions && (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                    {/* Gráfico */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Wallet className="h-4 w-4 text-emerald-400" />
                                Comissão líquida por mês
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PartnerHomeChart data={serie} />
                        </CardContent>
                    </Card>

                    {/* Recentes */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Lançamentos recentes</CardTitle>
                            <Link
                                href="/partner/commissions"
                                className="inline-flex items-center gap-1 text-xs text-emerald-300 hover:underline"
                            >
                                Ver tudo <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentes.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    Nenhum lançamento ainda.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {recentes.map((r) => {
                                        const badge = REPASSE[r.repasse_status ?? ""] ?? null;
                                        return (
                                            <div
                                                key={r.id}
                                                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3"
                                            >
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-medium">
                                                        {r.cliente_nome || `Contrato ${r.contrato_numero || "sem número"}`}
                                                    </div>
                                                    <div className="truncate text-xs text-muted-foreground">
                                                        {mesLabel(r.competencia_prevista)}
                                                        {r.numero_cota ? ` · Cota ${r.numero_cota}` : ""}
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 flex-col items-end gap-1">
                                                    <span className="text-sm font-semibold tabular-nums">
                                                        {brl(r.valor_liquido)}
                                                    </span>
                                                    {badge && (
                                                        <Badge variant="outline" className={badge.cls}>
                                                            {badge.label}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
