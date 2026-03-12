export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLanceCartaDetalhe } from "../actions";

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
    params: Promise<{ cotaId: string }>;
    searchParams?: Promise<SearchParams>;
};

function first(sp: SearchParams, key: string) {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
}

function money(v?: number | null) {
    if (v == null) return "—";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(v);
}

function fmtDate(v?: string | null) {
    if (!v) return "—";
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: "UTC",
    }).format(new Date(`${v}T00:00:00`));
}

export default async function LanceCartaDetalhePage({ params, searchParams }: Props) {
    const { cotaId } = await params;
    const sp = (await searchParams) ?? {};
    const competencia = first(sp, "competencia") ?? new Date().toISOString().slice(0, 7) + "-01";

    let data;
    try {
        data = await getLanceCartaDetalhe(cotaId, competencia);
    } catch {
        notFound();
    }

    return (
        <div className="px-4 md:px-6 py-4 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold">Detalhe da carta</h1>
                    <p className="text-sm text-muted-foreground">
                        Grupo {data.cota.grupo_codigo} • Cota {data.cota.numero_cota}
                    </p>
                </div>

                <Link href={`/app/lances?competencia=${competencia}`}>
                    <Button variant="outline">Voltar</Button>
                </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Dados da carta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div><strong>Cliente:</strong> {data.lead?.nome || "—"}</div>
                        <div><strong>Operadora:</strong> {data.administradora?.nome || "—"}</div>
                        <div><strong>Produto:</strong> {data.cota.produto}</div>
                        <div><strong>Grupo:</strong> {data.cota.grupo_codigo}</div>
                        <div><strong>Cota:</strong> {data.cota.numero_cota}</div>
                        <div><strong>Status:</strong> {data.cota.status}</div>
                        <div><strong>Valor da carta:</strong> {money(data.cota.valor_carta)}</div>
                        <div><strong>Prazo:</strong> {data.cota.prazo ?? "—"}</div>
                        <div><strong>Parcela:</strong> {money(data.cota.valor_parcela)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Regra operacional</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div><strong>Origem:</strong> {data.regra_assembleia.origem || "—"}</div>
                        <div><strong>Dia base:</strong> {data.regra_assembleia.dia_base_assembleia ?? "—"}</div>
                        <div><strong>Assembleia prevista:</strong> {fmtDate(data.regra_assembleia.assembleia_prevista)}</div>
                        <div><strong>Tipo ajuste:</strong> {data.regra_assembleia.tipo_ajuste || "—"}</div>
                        <div><strong>Autorização gestão:</strong> {data.cota.autorizacao_gestao ? "Sim" : "Não"}</div>
                        <div><strong>Embutido:</strong> {data.cota.embutido_permitido ? "Sim" : "Não"}</div>
                        <div><strong>FGTS:</strong> {data.cota.fgts_permitido ? "Sim" : "Não"}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Competência atual</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div><strong>Competência:</strong> {fmtDate(data.controle_mes_atual.competencia)}</div>
                        <div><strong>Status do mês:</strong> {data.controle_mes_atual.status_mes}</div>
                        <div><strong>Observações:</strong> {data.controle_mes_atual.observacoes || "—"}</div>
                        <div><strong>Último lance:</strong> {fmtDate(data.cota.data_ultimo_lance)}</div>
                        {data.contemplacao && (
                            <div><strong>Contemplada em:</strong> {fmtDate(data.contemplacao.data)}</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Diagnóstico / estratégia</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 md:grid-cols-4 text-sm">
                    <div><strong>Estratégia:</strong> {data.diagnostico?.estrategia_lance || data.cota.estrategia || "—"}</div>
                    <div><strong>Lance base %:</strong> {data.diagnostico?.lance_base_pct ?? "—"}</div>
                    <div><strong>Lance max %:</strong> {data.diagnostico?.lance_max_pct ?? "—"}</div>
                    <div><strong>Readiness:</strong> {data.diagnostico?.readiness_score ?? "—"}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de lances</CardTitle>
                </CardHeader>
                <CardContent>
                    {!data.historico_lances.length ? (
                        <div className="text-sm text-muted-foreground">Nenhum lance registrado ainda.</div>
                    ) : (
                        <div className="space-y-3">
                            {data.historico_lances.map((item) => (
                                <div key={item.id} className="rounded-lg border p-3 text-sm">
                                    <div className="grid gap-2 md:grid-cols-6">
                                        <div><strong>Assembleia:</strong> {fmtDate(item.assembleia_data)}</div>
                                        <div><strong>Tipo:</strong> {item.tipo || "—"}</div>
                                        <div><strong>%:</strong> {item.percentual ?? "—"}</div>
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