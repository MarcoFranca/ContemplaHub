export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLanceCartaDetalhe } from "../actions";
import { DetalheHeaderActions } from "@/app/app/lances/components/detalhe-header-actions";

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
    params: Promise<{ cotaId: string }>;
    searchParams?: Promise<SearchParams>;
};

function first(sp: SearchParams, key: string) {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
}

function money(v?: number | string | null) {
    if (v == null) return "—";
    const num = typeof v === "string" ? Number(v) : v;
    if (!Number.isFinite(num)) return "—";

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(num);
}

function fmtDate(v?: string | null) {
    if (!v) return "—";
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: "UTC",
    }).format(new Date(`${v}T00:00:00`));
}

function fmtPercent(v?: number | string | null) {
    if (v == null) return "—";
    const num = typeof v === "string" ? Number(v) : v;
    if (!Number.isFinite(num)) return "—";
    return `${new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(num)}%`;
}

function statusVariant(status?: string) {
    switch (status) {
        case "ativa":
            return "default";
        case "contemplada":
            return "secondary";
        case "cancelada":
            return "destructive";
        default:
            return "outline";
    }
}

export default async function LanceCartaDetalhePage({ params, searchParams }: Props) {
    const { cotaId } = await params;
    const sp = (await searchParams) ?? {};
    const competencia = first(sp, "competencia") ?? `${new Date().toISOString().slice(0, 7)}-01`;

    let data;
    try {
        data = await getLanceCartaDetalhe(cotaId, competencia);
    } catch {
        notFound();
    }

    const fixos = data.opcoes_lance_fixo ?? [];
    const embutidoMax =
        data.cota.embutido_permitido && data.cota.embutido_max_percent != null
            ? fmtPercent(data.cota.embutido_max_percent)
            : "—";

    const temPendenciaConfiguracao =
        data.tem_pendencia_configuracao ??
        !data.regra_assembleia?.assembleia_prevista;

    return (
        <div className="px-4 py-4 space-y-4 md:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-semibold">Detalhe da carta</h1>

                        <Badge variant={statusVariant(data.cota.status)}>
                            {data.cota.status}
                        </Badge>

                        {temPendenciaConfiguracao && (
                            <Badge variant="destructive">Pendência de configuração</Badge>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {data.administradora?.nome || "Operadora não informada"} • Grupo {data.cota.grupo_codigo} • Cota {data.cota.numero_cota}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <DetalheHeaderActions
                        cotaId={cotaId}
                        cota={data.cota}
                        opcoesLanceFixo={data.opcoes_lance_fixo ?? []}
                    />

                    <Link href={`/app/lances?competencia=${competencia}`}>
                        <Button variant="outline">Voltar</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Resumo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div><strong>Cliente:</strong> {data.lead?.nome || "—"}</div>
                        <div><strong>Operadora:</strong> {data.administradora?.nome || "—"}</div>
                        <div><strong>Produto:</strong> {data.cota.produto || "—"}</div>
                        <div><strong>Grupo:</strong> {data.cota.grupo_codigo || "—"}</div>
                        <div><strong>Cota:</strong> {data.cota.numero_cota || "—"}</div>
                        <div><strong>Status:</strong> {data.cota.status || "—"}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Financeiro</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div><strong>Valor da carta:</strong> {money(data.cota.valor_carta)}</div>
                        <div><strong>Valor da parcela:</strong> {money(data.cota.valor_parcela)}</div>
                        <div><strong>Prazo:</strong> {data.cota.prazo ?? "—"} meses</div>
                        <div><strong>Embutido:</strong> {data.cota.embutido_permitido ? "Sim" : "Não"}</div>
                        <div><strong>Limite embutido:</strong> {embutidoMax}</div>
                        <div><strong>FGTS:</strong> {data.cota.fgts_permitido ? "Sim" : "Não"}</div>
                        <div><strong>Gestão autorizada:</strong> {data.cota.autorizacao_gestao ? "Sim" : "Não"}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Assembleia & regra</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div><strong>Origem:</strong> {data.regra_assembleia.origem || "—"}</div>
                        <div><strong>Dia base:</strong> {data.regra_assembleia.dia_base_assembleia ?? "—"}</div>
                        <div><strong>Tipo ajuste:</strong> {data.regra_assembleia.tipo_ajuste || "—"}</div>
                        <div><strong>Assembleia prevista:</strong> {fmtDate(data.regra_assembleia.assembleia_prevista)}</div>
                        <div><strong>Pendência:</strong> {temPendenciaConfiguracao ? "Sim" : "Não"}</div>
                        <div><strong>Último lance:</strong> {fmtDate(data.cota.data_ultimo_lance)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Competência atual</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div><strong>Competência:</strong> {fmtDate(data.controle_mes_atual.competencia)}</div>
                        <div><strong>Status do mês:</strong> {data.controle_mes_atual.status_mes}</div>
                        <div><strong>Observações:</strong> {data.controle_mes_atual.observacoes || "—"}</div>

                        {data.contemplacao && (
                            <>
                                <div><strong>Contemplada em:</strong> {fmtDate(data.contemplacao.data)}</div>
                                <div><strong>Motivo:</strong> {data.contemplacao.motivo || "—"}</div>
                                <div><strong>% contemplação:</strong> {fmtPercent(data.contemplacao.lance_percentual)}</div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Estratégia & diagnóstico</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-sm md:grid-cols-2">
                        <div><strong>Objetivo:</strong> {data.cota.objetivo || "—"}</div>
                        <div><strong>Estratégia da cota:</strong> {data.cota.estrategia || "—"}</div>
                        <div><strong>Estratégia diagnóstico:</strong> {data.diagnostico?.estrategia_lance || "—"}</div>
                        <div><strong>Lance preferencial:</strong> {data.cota.tipo_lance_preferencial || "—"}</div>
                        <div><strong>Lance base %:</strong> {fmtPercent(data.diagnostico?.lance_base_pct)}</div>
                        <div><strong>Lance max %:</strong> {fmtPercent(data.diagnostico?.lance_max_pct)}</div>
                        <div><strong>Readiness:</strong> {data.diagnostico?.readiness_score ?? "—"}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Modalidades de lance fixo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!fixos.length ? (
                            <div className="text-sm text-muted-foreground">
                                Nenhuma modalidade de lance fixo cadastrada.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {fixos.map((op) => (
                                    <div key={op.id} className="rounded-lg border p-3 text-sm">
                                        <div className="grid gap-2 md:grid-cols-4">
                                            <div><strong>Percentual:</strong> {fmtPercent(op.percentual)}</div>
                                            <div><strong>Ordem:</strong> {op.ordem}</div>
                                            <div><strong>Ativo:</strong> {op.ativo ? "Sim" : "Não"}</div>
                                            <div><strong>Observações:</strong> {op.observacoes || "—"}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Histórico de lances</CardTitle>
                </CardHeader>
                <CardContent>
                    {!data.historico_lances.length ? (
                        <div className="text-sm text-muted-foreground">
                            Nenhum lance registrado ainda.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.historico_lances.map((item) => (
                                <div key={item.id} className="rounded-lg border p-3 text-sm">
                                    <div className="grid gap-2 md:grid-cols-6">
                                        <div><strong>Assembleia:</strong> {fmtDate(item.assembleia_data)}</div>
                                        <div><strong>Tipo:</strong> {item.tipo || "—"}</div>
                                        <div><strong>%:</strong> {fmtPercent(item.percentual)}</div>
                                        <div><strong>Valor:</strong> {money(item.valor)}</div>
                                        <div><strong>Origem:</strong> {item.origem || "—"}</div>
                                        <div><strong>Resultado:</strong> {item.resultado || "—"}</div>
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