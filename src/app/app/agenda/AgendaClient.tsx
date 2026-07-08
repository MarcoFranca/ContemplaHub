"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, Check, X, CheckCheck, ExternalLink, Bot, Clock, CalendarRange, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    type Agendamento,
    type AgendamentoStatus,
    type FeriadoCustom,
    updateAgendamentoStatusAction,
} from "./actions";
import { AgendaCalendar } from "./AgendaCalendar";
import { mapaFeriados } from "./feriados";

function fmt(dt: string | null) {
    if (!dt) return "";
    try {
        return new Intl.DateTimeFormat("pt-BR", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dt));
    } catch {
        return "";
    }
}

const statusCfg: Record<AgendamentoStatus, { label: string; cls: string }> = {
    agendado: { label: "Agendado", cls: "border-sky-500/30 bg-sky-500/10 text-sky-300" },
    confirmado: { label: "Confirmado", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    cancelado: { label: "Cancelado", cls: "border-red-500/30 bg-red-500/10 text-red-300" },
    realizado: { label: "Realizado", cls: "border-white/15 bg-white/5 text-muted-foreground" },
    no_show: { label: "Não compareceu", cls: "border-orange-500/30 bg-orange-500/10 text-orange-300" },
};

function AgendamentoCard({ ag, onChanged }: { ag: Agendamento; onChanged: () => void }) {
    const [pending, start] = React.useTransition();
    const cfg = statusCfg[ag.status];

    function setStatus(status: AgendamentoStatus) {
        start(async () => {
            const res = await updateAgendamentoStatusAction(ag.id, status);
            if (!res.ok) {
                toast.error(res.error || "Falha ao atualizar.");
                return;
            }
            toast.success("Agendamento atualizado.");
            onChanged();
        });
    }

    const encerrado = ag.status === "cancelado" || ag.status === "realizado" || ag.status === "no_show";

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium">
                        <CalendarClock className="h-4 w-4 text-emerald-400" />
                        {fmt(ag.inicio)}
                    </p>
                    <p className="mt-1 truncate text-sm">{ag.titulo}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {ag.lead_nome || "Lead"}
                        {ag.lead_telefone ? ` • ${ag.lead_telefone}` : ""}
                    </p>
                    {ag.observacao ? (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/80">{ag.observacao}</p>
                    ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                    <Badge variant="outline" className={`gap-1 ${cfg.cls}`}>
                        {cfg.label}
                    </Badge>
                    {ag.origem === "ia" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Bot className="h-3 w-3" /> pela IA
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                {ag.lead_id ? (
                    <Button asChild variant="ghost" size="sm" className="gap-1.5">
                        <Link href={`/app/leads/${ag.lead_id}`}>
                            <ExternalLink className="h-3.5 w-3.5" /> Abrir lead
                        </Link>
                    </Button>
                ) : null}

                {!encerrado ? (
                    <>
                        {ag.status !== "confirmado" ? (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pending}
                                className="gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                                onClick={() => setStatus("confirmado")}
                            >
                                <Check className="h-3.5 w-3.5" /> Confirmar
                            </Button>
                        ) : null}
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pending}
                            className="gap-1.5"
                            onClick={() => setStatus("realizado")}
                        >
                            <CheckCheck className="h-3.5 w-3.5" /> Realizada
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pending}
                            className="gap-1.5 border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                            onClick={() => setStatus("no_show")}
                        >
                            <X className="h-3.5 w-3.5" /> Não compareceu
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pending}
                            className="gap-1.5 border-red-500/30 text-red-300 hover:bg-red-500/10"
                            onClick={() => setStatus("cancelado")}
                        >
                            <X className="h-3.5 w-3.5" /> Cancelar
                        </Button>
                    </>
                ) : null}
            </div>
        </div>
    );
}

export function AgendaClient({
    initial,
    feriadosCustom,
}: {
    initial: Agendamento[];
    feriadosCustom: FeriadoCustom[];
}) {
    const router = useRouter();
    const onChanged = () => router.refresh();
    const [now] = React.useState(() => Date.now());
    const [modo, setModo] = React.useState<"calendario" | "lista">("calendario");

    const feriados = React.useMemo(() => {
        const ano = new Date().getFullYear();
        return mapaFeriados([ano, ano + 1], feriadosCustom);
    }, [feriadosCustom]);

    const toggle = (
        <div className="flex gap-1 self-start rounded-lg border border-white/10 p-0.5">
            <Button variant={modo === "calendario" ? "secondary" : "ghost"} size="sm" className="gap-1.5" onClick={() => setModo("calendario")}>
                <CalendarRange className="h-4 w-4" /> Calendário
            </Button>
            <Button variant={modo === "lista" ? "secondary" : "ghost"} size="sm" className="gap-1.5" onClick={() => setModo("lista")}>
                <List className="h-4 w-4" /> Lista
            </Button>
        </div>
    );

    if (modo === "calendario") {
        return (
            <div className="flex min-h-0 flex-1 flex-col gap-3">
                {toggle}
                <AgendaCalendar agendamentos={initial} feriados={feriados} />
            </div>
        );
    }

    if (!initial.length) {
        return (
            <div className="flex flex-col gap-3">
                {toggle}
                <div className="rounded-xl border border-white/10 p-10 text-center text-muted-foreground">
                    <CalendarClock className="mx-auto mb-3 h-8 w-8 text-emerald-500/60" />
                    Nenhuma reunião agendada ainda. Quando a IA marcar uma reunião com um lead, ela aparece aqui.
                </div>
            </div>
        );
    }

    const proximas = initial.filter(
        (a) => a.status !== "cancelado" && a.status !== "realizado" && new Date(a.inicio).getTime() >= now,
    );
    const historico = initial.filter(
        (a) => a.status === "cancelado" || a.status === "realizado" || new Date(a.inicio).getTime() < now,
    );

    return (
        <div className="flex-1 space-y-4 overflow-y-auto">
            {toggle}
            <section>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Clock className="h-4 w-4" /> Próximas ({proximas.length})
                </h2>
                <div className="space-y-3">
                    {proximas.length ? (
                        proximas.map((ag) => <AgendamentoCard key={ag.id} ag={ag} onChanged={onChanged} />)
                    ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma reunião futura.</p>
                    )}
                </div>
            </section>

            {historico.length ? (
                <section>
                    <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                        Histórico ({historico.length})
                    </h2>
                    <div className="space-y-3 opacity-80">
                        {historico
                            .slice()
                            .reverse()
                            .map((ag) => (
                                <AgendamentoCard key={ag.id} ag={ag} onChanged={onChanged} />
                            ))}
                    </div>
                </section>
            ) : null}
        </div>
    );
}
