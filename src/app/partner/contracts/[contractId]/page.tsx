// src/app/partner/contracts/[contractId]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentPartnerAccess } from "@/lib/auth/partner-server";
import { partnerBackendFetch } from "@/lib/backend-partner";

type Params = Promise<{
    contractId: string;
}>;

type PartnerContractDetailResponse = {
    ok: boolean;
    item?: {
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
            pdf_path?: string | null;
            pdf_status?: string | null;
            data_assinatura?: string | null;
            data_contemplacao?: string | null;
        };
        cota?: {
            id?: string;
            numero_cota?: string | null;
            grupo_codigo?: string | null;
            prazo?: number | null;
            valor_carta?: number | string | null;
            tipo_lance_preferencial?: string | null;
            estrategia?: string | null;
        } | null;
        cliente?: {
            id?: string;
            nome?: string | null;
            telefone?: string | null;
            email?: string | null;
            etapa?: string | null;
            masked?: boolean;
        } | null;
        commission_summary?: {
            total_lancamentos?: number;
            valor_bruto_total?: number;
            valor_liquido_total?: number;
            pagos?: number;
            pendentes?: number;
            repasses_pendentes?: number;
            repasse_pago?: number;
        } | null;
        commission_items?: PartnerCommissionItem[];
        lances?: PartnerLanceItem[];
    };
};

type PartnerLanceItem = {
    id: string;
    assembleia_data?: string | null;
    tipo?: string | null;
    percentual?: number | string | null;
    valor?: number | string | null;
    origem?: string | null;
    resultado?: string | null;
    created_at?: string | null;
};

type PartnerCommissionItem = {
    id: string;
    ordem?: number | null;
    tipo_evento?: string | null;
    competencia_prevista?: string | null;
    status?: string | null;
    repasse_status?: string | null;
    valor_bruto?: number | string | null;
    valor_liquido?: number | string | null;
    repasse_previsto_em?: string | null;
};

const brl = (v: number | string | null | undefined) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

function dataLabel(iso?: string | null) {
    if (!iso) return "Não informado";
    const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR").format(new Date(y, m - 1, d));
}

function mesLabel(iso?: string | null) {
    if (!iso) return "Sem competência";
    const [y, m] = iso.slice(0, 10).split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(y, m - 1, 1));
}

function statusBadgeClass(status?: string | null) {
    const s = (status || "").toLowerCase();
    if (s.includes("ativ")) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    if (s.includes("cancel")) return "border-rose-500/30 bg-rose-500/10 text-rose-400";
    if (s.includes("pend")) return "border-amber-500/30 bg-amber-500/10 text-amber-400";
    return "border-border/60 bg-muted/40 text-muted-foreground";
}

const REPASSE_LABEL: Record<string, { label: string; cls: string }> = {
    pendente: { label: "A receber", cls: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
    pago: { label: "Recebido", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    cancelado: { label: "Cancelado", cls: "border-rose-500/30 bg-rose-500/10 text-rose-300" },
};

const EVENTO_LABEL: Record<string, string> = {
    adesao: "Adesão",
    primeira_cobranca_valida: "1ª cobrança",
    proxima_cobranca: "Cobrança",
    contemplacao: "Contemplação",
    manual: "Manual",
};

const LANCE_TIPO: Record<string, { label: string; cls: string }> = {
    fixo: { label: "Lance fixo", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    livre: { label: "Lance livre", cls: "border-sky-500/30 bg-sky-500/10 text-sky-300" },
    embutido: { label: "Lance embutido", cls: "border-violet-500/30 bg-violet-500/10 text-violet-300" },
    sorteio: { label: "Sorteio", cls: "border-slate-500/30 bg-slate-500/10 text-slate-300" },
};

function estrategiaInfo(tipo?: string | null) {
    const t = (tipo || "").toLowerCase();
    return LANCE_TIPO[t] ?? { label: "Sorteio", cls: LANCE_TIPO.sorteio.cls };
}

const PCT = (v: number | string | null | undefined) =>
    v == null || v === "" ? "—" : `${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

const RESULTADO_LABEL: Record<string, { label: string; cls: string }> = {
    contemplado: { label: "Contemplado", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    nao_contemplado: { label: "Não contemplado", cls: "border-rose-500/30 bg-rose-500/10 text-rose-300" },
    pendente: { label: "Aguardando", cls: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
};

export default async function PartnerContractDetailPage({
                                                            params,
                                                        }: {
    params: Params;
}) {
    const { contractId } = await params;

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

    const data = (await partnerBackendFetch(`/partner/contracts/${contractId}`, {
        method: "GET",
        accessToken: session.access_token,
    })) as PartnerContractDetailResponse | null;

    const item = data?.item;
    if (!item) {
        notFound();
    }

    const contrato = item.contrato;
    const cota = item.cota;
    const cliente = item.cliente;
    const summary = item.commission_summary;
    const commissionItems = item.commission_items ?? [];
    const lances = item.lances ?? [];
    const estrategia = estrategiaInfo(cota?.tipo_lance_preferencial);

    const aReceber = commissionItems
        .filter((r) => r.repasse_status === "pendente")
        .reduce((s, r) => s + Number(r.valor_liquido || 0), 0);
    const recebido = commissionItems
        .filter((r) => r.repasse_status === "pago")
        .reduce((s, r) => s + Number(r.valor_liquido || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <Link
                        href="/partner/contracts"
                        className="text-sm text-muted-foreground underline"
                    >
                        Voltar para contratos
                    </Link>

                    <h1 className="mt-2 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
                        {cliente?.nome || `Contrato ${contrato.numero || "sem número"}`}
                        <Badge variant="outline" className={statusBadgeClass(contrato.status)}>
                            {contrato.status || "sem status"}
                        </Badge>
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Detalhes do contrato, cota e comissões relacionadas.
                    </p>
                </div>

                {contrato.pdf_path ? (
                    <Link
                        href={`/api/partner/contracts/${contractId}/document`}
                        className="inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium hover:bg-muted"
                    >
                        Baixar contrato
                    </Link>
                ) : (
                    <Button variant="outline" disabled>
                        Sem PDF
                    </Button>
                )}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Resumo do contrato</CardTitle>
                    </CardHeader>

                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Info label="Número do contrato" value={contrato.numero || "Pendente"} />
                        <Info label="Data assinatura" value={dataLabel(contrato.data_assinatura)} />
                        <Info label="Data contemplação" value={dataLabel(contrato.data_contemplacao)} />
                        <Info label="PDF" value={contrato.pdf_status || "pendente"} />
                        <Info label="Número da cota" value={cota?.numero_cota || "Não informado"} />
                        <Info label="Grupo" value={cota?.grupo_codigo || "Não informado"} />
                        <Info label="Prazo" value={cota?.prazo ? `${cota.prazo} meses` : "Não informado"} />
                        <Info
                            label="Valor da carta"
                            value={cota?.valor_carta != null ? brl(cota.valor_carta) : "Não informado"}
                        />
                        <div>
                            <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                Estratégia de lance
                            </div>
                            <div className="mt-1">
                                <Badge variant="outline" className={estrategia.cls}>{estrategia.label}</Badge>
                            </div>
                        </div>
                        {cota?.estrategia && (
                            <Info label="Observação da estratégia" value={cota.estrategia} />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cliente</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2 text-sm">
                        <Info label="Nome" value={cliente?.nome || "Não disponível"} />
                        <Info
                            label="Telefone"
                            value={cliente?.telefone || "Não disponível"}
                        />
                        <Info label="E-mail" value={cliente?.email || "Não disponível"} />
                        <Info label="Etapa" value={cliente?.etapa || "Não informado"} />
                        {cliente?.masked && (
                            <Badge variant="outline">Dados mascarados</Badge>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Resumo financeiro</CardTitle>
                </CardHeader>

                <CardContent className="grid gap-4 md:grid-cols-4">
                    <Metric label="A receber" value={brl(aReceber)} />
                    <Metric label="Recebido" value={brl(recebido)} />
                    <Metric label="Líquido total" value={brl(summary?.valor_liquido_total)} />
                    <Metric label="Lançamentos" value={String(summary?.total_lancamentos || 0)} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lances dados</CardTitle>
                </CardHeader>

                <CardContent>
                    {lances.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Nenhum lance registrado até o momento.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {lances.map((lance: PartnerLanceItem) => {
                                const tipo = LANCE_TIPO[(lance.tipo || "").toLowerCase()];
                                const resultado = RESULTADO_LABEL[(lance.resultado || "").toLowerCase()];
                                return (
                                    <div key={lance.id} className="rounded-xl border border-border/60 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="font-medium">
                                                    Assembleia de {dataLabel(lance.assembleia_data)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {PCT(lance.percentual)}
                                                    {lance.valor != null ? ` · ${brl(lance.valor)}` : ""}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {tipo && (
                                                    <Badge variant="outline" className={tipo.cls}>{tipo.label}</Badge>
                                                )}
                                                {resultado && (
                                                    <Badge variant="outline" className={resultado.cls}>{resultado.label}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lançamentos</CardTitle>
                </CardHeader>

                <CardContent>
                    {commissionItems.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Nenhum lançamento disponível.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {commissionItems.map((row: PartnerCommissionItem) => (
                                <div
                                    key={row.id}
                                    className="rounded-xl border border-border/60 p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <div className="font-medium">
                                                {EVENTO_LABEL[row.tipo_evento ?? ""] || row.tipo_evento || "Lançamento"}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {mesLabel(row.competencia_prevista)}
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

                                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                                        <Info label="Valor líquido" value={brl(row.valor_liquido)} />
                                        <Info label="Repasse previsto" value={dataLabel(row.repasse_previsto_em)} />
                                    </div>
                                </div>
                            ))}
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