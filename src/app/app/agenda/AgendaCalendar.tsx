"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, dateFnsLocalizer, Views, type View } from "react-big-calendar";
import withDragAndDrop, { type EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./agenda-calendar.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Agendamento } from "./actions";
import { updateAgendamentoAction, updateAgendamentoStatusAction } from "./actions";

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (d: Date) => startOfWeek(d, { locale: ptBR }),
    getDay,
    locales: { "pt-BR": ptBR },
});

const DnDCalendar = withDragAndDrop<CalEvent, object>(Calendar);

type CalEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    tipo: "reuniao" | "feriado";
    ag?: Agendamento;
};

const statusColor: Record<string, string> = {
    agendado: "#0ea5e9",
    confirmado: "#10b981",
    cancelado: "#ef4444",
    realizado: "#64748b",
    no_show: "#f97316",
};

function toLocalInput(d: Date): string {
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 16);
}

export function AgendaCalendar({
    agendamentos,
    feriados,
}: {
    agendamentos: Agendamento[];
    feriados: Map<string, string>;
}) {
    const router = useRouter();
    const [view, setView] = React.useState<View>(Views.WEEK);
    const [date, setDate] = React.useState<Date>(() => new Date());
    const [sel, setSel] = React.useState<Agendamento | null>(null);
    const [pending, start] = React.useTransition();

    const events = React.useMemo<CalEvent[]>(() => {
        const evs: CalEvent[] = agendamentos
            .filter((a) => a.status !== "cancelado")
            .map((a) => {
                const ini = new Date(a.inicio);
                const fim = a.fim ? new Date(a.fim) : new Date(ini.getTime() + 30 * 60000);
                return {
                    id: a.id,
                    title: `${a.lead_nome || a.titulo}`,
                    start: ini,
                    end: fim,
                    tipo: "reuniao" as const,
                    ag: a,
                };
            });
        // feriados como eventos all-day
        for (const [iso, nome] of feriados) {
            const [y, m, d] = iso.split("-").map(Number);
            const dia = new Date(y, m - 1, d);
            evs.push({
                id: `feriado-${iso}`,
                title: `🎉 ${nome}`,
                start: dia,
                end: dia,
                allDay: true,
                tipo: "feriado",
            });
        }
        return evs;
    }, [agendamentos, feriados]);

    function onDropOrResize({ event, start: s, end: e }: EventInteractionArgs<CalEvent>) {
        if (event.tipo === "feriado" || !event.ag) return;
        const ini = s instanceof Date ? s : new Date(s);
        const fim = e instanceof Date ? e : new Date(e);
        start(async () => {
            const res = await updateAgendamentoAction(event.ag!.id, {
                inicio: ini.toISOString(),
                fim: fim.toISOString(),
            });
            if (!res.ok) {
                toast.error(res.error || "Falha ao remarcar.");
                return;
            }
            toast.success("Reunião remarcada.");
            router.refresh();
        });
    }

    return (
        <div className="flex-1 overflow-hidden">
            <div className="h-[72vh] rounded-xl border border-white/10 bg-white/5 p-2">
                <DnDCalendar
                    localizer={localizer}
                    culture="pt-BR"
                    events={events}
                    view={view}
                    onView={(v) => setView(v)}
                    date={date}
                    onNavigate={(d) => setDate(d)}
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    step={30}
                    timeslots={2}
                    popup
                    draggableAccessor={(e) => (e as CalEvent).tipo === "reuniao"}
                    onEventDrop={onDropOrResize}
                    onEventResize={onDropOrResize}
                    onSelectEvent={(e) => {
                        const ev = e as CalEvent;
                        if (ev.tipo === "reuniao" && ev.ag) setSel(ev.ag);
                    }}
                    eventPropGetter={(e) => {
                        const ev = e as CalEvent;
                        if (ev.tipo === "feriado") {
                            return { style: { backgroundColor: "transparent", color: "#f59e0b", fontWeight: 600 } };
                        }
                        const bg = statusColor[ev.ag?.status ?? "agendado"] ?? "#0ea5e9";
                        return { style: { backgroundColor: bg, borderColor: bg } };
                    }}
                    dayPropGetter={(d) => {
                        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                        if (feriados.has(iso)) return { style: { backgroundColor: "rgba(245,158,11,0.07)" } };
                        return {};
                    }}
                    messages={{
                        today: "Hoje",
                        previous: "Anterior",
                        next: "Próximo",
                        month: "Mês",
                        week: "Semana",
                        day: "Dia",
                        agenda: "Lista",
                        date: "Data",
                        time: "Hora",
                        event: "Reunião",
                        noEventsInRange: "Nenhuma reunião neste período.",
                        showMore: (t) => `+${t} mais`,
                    }}
                />
            </div>

            <EditDialog
                sel={sel}
                pending={pending}
                onClose={() => setSel(null)}
                onSave={(patch) => {
                    if (!sel) return;
                    start(async () => {
                        const res = await updateAgendamentoAction(sel.id, patch);
                        if (!res.ok) {
                            toast.error(res.error || "Falha ao salvar.");
                            return;
                        }
                        toast.success("Reunião atualizada.");
                        setSel(null);
                        router.refresh();
                    });
                }}
                onStatus={(status) => {
                    if (!sel) return;
                    start(async () => {
                        const res = await updateAgendamentoStatusAction(sel.id, status);
                        if (!res.ok) {
                            toast.error(res.error || "Falha.");
                            return;
                        }
                        toast.success("Reunião atualizada.");
                        setSel(null);
                        router.refresh();
                    });
                }}
            />
        </div>
    );
}

function EditDialog({
    sel,
    pending,
    onClose,
    onSave,
    onStatus,
}: {
    sel: Agendamento | null;
    pending: boolean;
    onClose: () => void;
    onSave: (patch: { titulo: string; inicio: string; fim: string | null; observacao: string | null }) => void;
    onStatus: (status: "confirmado" | "cancelado" | "realizado" | "no_show") => void;
}) {
    const [titulo, setTitulo] = React.useState("");
    const [inicio, setInicio] = React.useState("");
    const [fim, setFim] = React.useState("");
    const [obs, setObs] = React.useState("");

    React.useEffect(() => {
        if (!sel) return;
        setTitulo(sel.titulo);
        setInicio(toLocalInput(new Date(sel.inicio)));
        setFim(sel.fim ? toLocalInput(new Date(sel.fim)) : "");
        setObs(sel.observacao ?? "");
    }, [sel]);

    return (
        <Dialog open={!!sel} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar reunião</DialogTitle>
                </DialogHeader>
                {sel ? (
                    <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                            {sel.lead_nome || "Lead"}
                            {sel.lead_telefone ? ` • ${sel.lead_telefone}` : ""}
                        </p>
                        <div>
                            <Label className="text-xs text-muted-foreground">Título</Label>
                            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs text-muted-foreground">Início</Label>
                                <Input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Fim</Label>
                                <Input type="datetime-local" value={fim} onChange={(e) => setFim(e.target.value)} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Observação</Label>
                            <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} className="mt-1" />
                        </div>
                    </div>
                ) : null}
                <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                            disabled={pending}
                            onClick={() => onStatus("cancelado")}
                        >
                            Cancelar reunião
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                            disabled={pending}
                            onClick={() => onStatus("no_show")}
                        >
                            Não compareceu
                        </Button>
                        <Button variant="outline" size="sm" disabled={pending} onClick={() => onStatus("realizado")}>
                            Realizada
                        </Button>
                    </div>
                    <Button
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                            onSave({
                                titulo: titulo.trim() || "Reunião",
                                inicio: new Date(inicio).toISOString(),
                                fim: fim ? new Date(fim).toISOString() : null,
                                observacao: obs.trim() || null,
                            })
                        }
                    >
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
