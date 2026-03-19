export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Building2,
    CalendarDays,
    Clock3,
    FileClock,
    History,
    Sparkles,
    Trophy,
    UserRound,
    Wallet,
} from "lucide-react";
import { getLanceCartaDetalhe } from "../actions/carta-actions";
import { LanceDetailHero } from "./components/LanceDetailHero";
import { LanceExecutiveSummary } from "./components/LanceExecutiveSummary";
import { LanceActionRail } from "./components/LanceActionRail";
import { LanceReadinessChecklist } from "./components/LanceReadinessChecklist";
import { LanceStrategyCard } from "./components/LanceStrategyCard";
import {
    getTimelineItems,
    getStatusMesLabel,
} from "./components/lance-detail-helpers";

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

function fmtDateTime(v?: string | null) {
    if (!v) return "—";
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(v));
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

function getResultadoVariant(resultado?: string | null) {
    switch ((resultado ?? "").toLowerCase()) {
        case "contemplado":
            return "default";
        case "nao_contemplado":
        case "não_contemplado":
            return "outline";
        case "desclassificado":
            return "destructive";
        case "pendente":
            return "secondary";
        default:
            return "outline";
    }
}

export default async function LanceCartaDetalhePage({ params, searchParams }: Props) {
    const { cotaId } = await params;
    const sp = (await searchParams) ?? {};
    const competencia =
        first(sp, "competencia") ?? `${new Date().toISOString().slice(0, 7)}-01`;

    let data;
    try {
        data = await getLanceCartaDetalhe(cotaId, competencia);
    } catch {
        notFound();
    }

    const temPendenciaConfiguracao =
        data.tem_pendencia_configuracao ?? !data.regra_assembleia?.assembleia_prevista;

    const timeline = getTimelineItems(data);

    return (
        <div className="h-full overflow-hidden">
            <div className="h-full overflow-y-auto">
                <div className="px-4 py-4 md:px-6">
                    <div className="flex flex-col gap-4 pb-6">
                        <LanceDetailHero
                            data={data}
                            temPendenciaConfiguracao={temPendenciaConfiguracao}
                        />

                        <LanceExecutiveSummary data={data} />

                        <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
                            <div className="space-y-4">
                                <Card className="border-white/10 bg-white/5 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="inline-flex items-center gap-2 text-base">
                                            <Sparkles className="h-4 w-4" />
                                            Painel executivo
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="grid gap-3 md:grid-cols-2">
                                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                <UserRound className="h-3.5 w-3.5" />
                                                Cliente
                                            </p>
                                            <p className="mt-2 text-sm font-medium text-slate-100">
                                                {data.lead?.nome || "—"}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {data.lead?.telefone || "Sem telefone"} • {data.lead?.email || "Sem e-mail"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                <Building2 className="h-3.5 w-3.5" />
                                                Operadora
                                            </p>
                                            <p className="mt-2 text-sm font-medium text-slate-100">
                                                {data.administradora?.nome || "—"}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Produto {data.cota.produto || "—"} • Prazo {data.cota.prazo ?? "—"} meses
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                Assembleia & regra
                                            </p>
                                            <p className="mt-2 text-sm font-medium text-slate-100">
                                                {fmtDate(data.regra_assembleia.assembleia_prevista)}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Origem {data.regra_assembleia.origem || "—"} • dia base{" "}
                                                {data.regra_assembleia.dia_base_assembleia ?? "—"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                <Wallet className="h-3.5 w-3.5" />
                                                Situação financeira
                                            </p>
                                            <p className="mt-2 text-sm font-medium text-slate-100">
                                                Carta {money(data.cota.valor_carta)}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Parcela {money(data.cota.valor_parcela)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <LanceStrategyCard data={data} />

                                <Card className="border-white/10 bg-white/5 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="inline-flex items-center gap-2 text-base">
                                            <FileClock className="h-4 w-4" />
                                            Competência atual
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="grid gap-3 md:grid-cols-3">
                                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                                Competência
                                            </p>
                                            <p className="mt-2 text-sm font-medium text-slate-100">
                                                {fmtDate(data.controle_mes_atual.competencia)}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                                Status do mês
                                            </p>
                                            <p className="mt-2 text-sm font-medium text-slate-100">
                                                {getStatusMesLabel(data.controle_mes_atual.status_mes)}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                                Observações
                                            </p>
                                            <p className="mt-2 text-sm text-slate-100">
                                                {data.controle_mes_atual.observacoes || "Sem observações registradas."}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-white/10 bg-white/5 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="inline-flex items-center gap-2 text-base">
                                            <Clock3 className="h-4 w-4" />
                                            Linha do tempo da carta
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        {!timeline.length ? (
                                            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                                                Ainda não há marcos suficientes para exibir a linha do tempo.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {timeline.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="rounded-xl border border-white/10 bg-black/10 p-3"
                                                    >
                                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                            <p className="text-sm font-medium text-slate-100">{item.title}</p>
                                                            <Badge variant="outline">{fmtDate(item.date)}</Badge>
                                                        </div>
                                                        <p className="mt-2 text-sm text-muted-foreground">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-white/10 bg-white/5 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="inline-flex items-center gap-2 text-base">
                                            <History className="h-4 w-4" />
                                            Histórico de lances
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        {!data.historico_lances?.length ? (
                                            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                                                Nenhum lance registrado até o momento.
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid gap-3 sm:grid-cols-3">
                                                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                                            Total de lances
                                                        </p>
                                                        <p className="mt-2 text-sm font-medium text-slate-100">
                                                            {data.historico_lances.length}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                                            Último registro
                                                        </p>
                                                        <p className="mt-2 text-sm font-medium text-slate-100">
                                                            {fmtDate(data.historico_lances[0]?.assembleia_data)}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                                            Melhor percentual
                                                        </p>
                                                        <p className="mt-2 text-sm font-medium text-slate-100">
                                                            {fmtPercent(
                                                                Math.max(
                                                                    ...data.historico_lances.map((item) => Number(item.percentual ?? 0))
                                                                )
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {data.historico_lances.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="rounded-xl border border-white/10 bg-black/10 p-3"
                                                        >
                                                            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                                                                <div className="space-y-2">
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <Badge variant="outline">
                                                                            {item.tipo || "Tipo não informado"}
                                                                        </Badge>
                                                                        <Badge variant={getResultadoVariant(item.resultado)}>
                                                                            {item.resultado || "Sem resultado"}
                                                                        </Badge>
                                                                    </div>

                                                                    <p className="text-sm text-slate-100">
                                                                        Assembleia {fmtDate(item.assembleia_data)} •{" "}
                                                                        {fmtPercent(item.percentual)} • {money(item.valor)}
                                                                    </p>

                                                                    <p className="text-xs text-muted-foreground">
                                                                        Origem {item.origem || "—"} • registrado em{" "}
                                                                        {fmtDateTime(item.created_at)}
                                                                    </p>
                                                                </div>

                                                                {item.pagamento ? (
                                                                    <div className="rounded-lg border border-white/10 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                                                                        Composição registrada
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                <LanceActionRail
                                    cotaId={cotaId}
                                    competencia={competencia}
                                    data={data}
                                />

                                <LanceReadinessChecklist data={data} />

                                <Card className="border-white/10 bg-white/5 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="inline-flex items-center gap-2 text-base">
                                            <Trophy className="h-4 w-4" />
                                            Contemplação
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        {!data.contemplacao ? (
                                            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                                                A carta ainda não possui contemplação registrada.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                                        Motivo
                                                    </p>
                                                    <p className="mt-2 text-sm font-medium text-slate-100">
                                                        {data.contemplacao.motivo || "—"}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                                        Data
                                                    </p>
                                                    <p className="mt-2 text-sm font-medium text-slate-100">
                                                        {fmtDate(data.contemplacao.data)}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                                        Percentual
                                                    </p>
                                                    <p className="mt-2 text-sm font-medium text-slate-100">
                                                        {fmtPercent(data.contemplacao.lance_percentual)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-white/10 bg-white/5 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="inline-flex items-center gap-2 text-base">
                                            <Wallet className="h-4 w-4" />
                                            Dados da carta
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-3 text-sm">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <span className="text-muted-foreground">Grupo</span>
                                            <strong>{data.cota.grupo_codigo || "—"}</strong>
                                        </div>

                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <span className="text-muted-foreground">Cota</span>
                                            <strong>{data.cota.numero_cota || "—"}</strong>
                                        </div>

                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <span className="text-muted-foreground">Data de adesão</span>
                                            <strong>{fmtDate(data.cota.data_adesao)}</strong>
                                        </div>

                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <span className="text-muted-foreground">Prazo</span>
                                            <strong>{data.cota.prazo ?? "—"} meses</strong>
                                        </div>

                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <span className="text-muted-foreground">Embutido máximo</span>
                                            <strong>{fmtPercent(data.cota.embutido_max_percent)}</strong>
                                        </div>

                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <span className="text-muted-foreground">Último lance</span>
                                            <strong>{fmtDate(data.cota.data_ultimo_lance)}</strong>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="hidden xl:block">
                                    <Link href={`/app/lances?competencia=${competencia}`}>
                                        <Button variant="ghost" className="w-full">
                                            Voltar para a visão operacional
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}