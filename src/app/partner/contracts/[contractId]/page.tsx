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
    };
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

                    <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                        Contrato {contrato.numero || "—"}
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
                        <Info label="Status" value={contrato.status || "—"} />
                        <Info
                            label="Data assinatura"
                            value={contrato.data_assinatura || "—"}
                        />
                        <Info
                            label="Data contemplação"
                            value={contrato.data_contemplacao || "—"}
                        />
                        <Info label="PDF" value={contrato.pdf_status || "pendente"} />
                        <Info label="Número da cota" value={cota?.numero_cota || "—"} />
                        <Info label="Grupo" value={cota?.grupo_codigo || "—"} />
                        <Info
                            label="Prazo"
                            value={cota?.prazo ? `${cota.prazo} meses` : "—"}
                        />
                        <Info
                            label="Valor da carta"
                            value={
                                cota?.valor_carta != null
                                    ? `R$ ${Number(cota.valor_carta).toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}`
                                    : "—"
                            }
                        />
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
                        <Info label="Etapa" value={cliente?.etapa || "—"} />
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
                    <Metric
                        label="Valor bruto total"
                        value={`R$ ${Number(summary?.valor_bruto_total || 0).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`}
                    />
                    <Metric
                        label="Valor líquido total"
                        value={`R$ ${Number(summary?.valor_liquido_total || 0).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`}
                    />
                    <Metric label="Pagos" value={String(summary?.pagos || 0)} />
                    <Metric label="Pendentes" value={String(summary?.pendentes || 0)} />
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
                                                Ordem {row.ordem ?? "—"} •{" "}
                                                {row.tipo_evento || "—"}
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

                                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
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