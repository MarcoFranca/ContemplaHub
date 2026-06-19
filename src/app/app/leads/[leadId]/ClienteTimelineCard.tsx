import {
    Activity as ActivityIcon,
    CalendarClock,
    FileSignature,
    FileText,
    Target,
} from "lucide-react";

export type TimelineTipo = "atividade" | "lance" | "proposta" | "contrato";

export type TimelineEvento = {
    id: string;
    tipo: TimelineTipo;
    titulo: string;
    descricao?: string | null;
    data: string | null; // ISO
};

const META: Record<
    TimelineTipo,
    { icon: React.ComponentType<{ className?: string }>; cls: string; label: string }
> = {
    atividade: { icon: ActivityIcon, cls: "text-sky-300", label: "Atividade" },
    lance: { icon: Target, cls: "text-emerald-300", label: "Lance" },
    proposta: { icon: FileText, cls: "text-violet-300", label: "Proposta" },
    contrato: { icon: FileSignature, cls: "text-amber-300", label: "Contrato" },
};

function fmt(data: string | null) {
    if (!data) return "—";
    const d = new Date(data);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

export function ClienteTimelineCard({ eventos }: { eventos: TimelineEvento[] }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5 space-y-4">
            <h3 className="inline-flex items-center gap-2 text-base font-semibold">
                <CalendarClock className="h-4 w-4 text-emerald-400" />
                Linha do tempo
            </h3>

            {eventos.length === 0 ? (
                <p className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
                    Sem eventos registrados para este cliente ainda.
                </p>
            ) : (
                <ol className="relative space-y-3 border-l border-white/10 pl-4">
                    {eventos.map((ev) => {
                        const meta = META[ev.tipo];
                        const Icon = meta.icon;
                        return (
                            <li key={`${ev.tipo}-${ev.id}`} className="relative">
                                <span className="absolute -left-[1.42rem] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-background">
                                    <Icon className={`h-3 w-3 ${meta.cls}`} />
                                </span>
                                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                                    <span className="text-sm font-medium text-slate-100">{ev.titulo}</span>
                                    <span className="text-xs text-muted-foreground">{fmt(ev.data)}</span>
                                </div>
                                {ev.descricao ? (
                                    <p className="text-xs text-muted-foreground">{ev.descricao}</p>
                                ) : null}
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
}
