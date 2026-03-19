import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Banknote,
    CalendarDays,
    CircleGauge,
    ShieldCheck,
    Target,
    Wallet,
} from "lucide-react";
import type { LancesCartaDetalhe } from "../../types";

type Props = {
    data: LancesCartaDetalhe;
    temPendenciaConfiguracao: boolean;
};

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

function statusMesVariant(status?: string) {
    switch (status) {
        case "feito":
        case "contemplada":
            return "default";
        case "planejado":
            return "secondary";
        case "pendente":
            return "outline";
        case "sem_lance":
        case "cancelada":
            return "destructive";
        default:
            return "outline";
    }
}

function statusMesLabel(status?: string) {
    switch (status) {
        case "pendente":
            return "Pendente";
        case "planejado":
            return "Planejado";
        case "feito":
            return "Baixado";
        case "sem_lance":
            return "Sem lance";
        case "contemplada":
            return "Contemplada";
        case "cancelada":
            return "Cancelada";
        default:
            return status || "—";
    }
}

export function LanceDetailHero({ data, temPendenciaConfiguracao }: Props) {
    return (
        <Card className="border-white/10 bg-white/5 shadow-sm">
            <CardContent className="space-y-5 p-4 md:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-primary">Carta estratégica</p>
                            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                                {data.lead?.nome || "Cliente sem nome"} · Grupo {data.cota.grupo_codigo} · Cota{" "}
                                {data.cota.numero_cota}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {data.administradora?.nome || "Operadora não informada"} •{" "}
                                {data.cota.produto || "Produto não informado"}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge variant={statusVariant(data.cota.status)}>{data.cota.status}</Badge>

                            <Badge variant={statusMesVariant(data.controle_mes_atual.status_mes)}>
                                {statusMesLabel(data.controle_mes_atual.status_mes)}
                            </Badge>

                            {data.cota.autorizacao_gestao ? (
                                <Badge variant="secondary" className="inline-flex items-center gap-1.5">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Gestão autorizada
                                </Badge>
                            ) : (
                                <Badge variant="outline">Sem autorização</Badge>
                            )}

                            {data.cota.embutido_permitido && <Badge variant="outline">Permite embutido</Badge>}
                            {data.cota.fgts_permitido && <Badge variant="outline">Permite FGTS</Badge>}

                            {temPendenciaConfiguracao && (
                                <Badge variant="destructive">Pendência de configuração</Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Wallet className="h-3.5 w-3.5" />
                            Valor da carta
                        </p>
                        <p className="mt-2 text-base font-semibold text-white">
                            {money(data.cota.valor_carta)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Banknote className="h-3.5 w-3.5" />
                            Parcela
                        </p>
                        <p className="mt-2 text-base font-semibold text-white">
                            {money(data.cota.valor_parcela)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Assembleia
                        </p>
                        <p className="mt-2 text-base font-semibold text-white">
                            {fmtDate(data.regra_assembleia?.assembleia_prevista)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <CircleGauge className="h-3.5 w-3.5" />
                            Readiness
                        </p>
                        <p className="mt-2 text-base font-semibold text-white">
                            {data.diagnostico?.readiness_score ?? "—"}
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <Target className="h-3.5 w-3.5" />
                            Último lance
                        </p>
                        <p className="mt-2 text-base font-semibold text-white">
                            {fmtDate(data.cota.data_ultimo_lance)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}