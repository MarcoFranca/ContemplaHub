import { CalendarClock } from "lucide-react";

type ActivityItem = {
    id: string;
    tipo?: string | null;
    titulo: string;
    descricao?: string | null;
    data?: string | null;
    lead_id?: string | null;
    lead_nome?: string | null;
};

function formatDate(value?: string | null) {
    if (!value) return "Sem data";
    return new Date(value).toLocaleString("pt-BR");
}

export function DashboardActivities({ items }: { items: ActivityItem[] }) {
    return (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-5">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Agenda comercial</h2>
                <p className="text-sm text-muted-foreground">
                    Próximas atividades da operação comercial.
                </p>
            </div>

            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                        Nenhuma atividade pendente no momento.
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="rounded-xl border p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <p className="font-medium">{item.titulo}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.lead_nome ? `Lead: ${item.lead_nome}` : "Sem lead vinculado"}
                                    </p>
                                    {item.descricao ? (
                                        <p className="text-sm text-muted-foreground">{item.descricao}</p>
                                    ) : null}
                                </div>

                                <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <CalendarClock className="h-4 w-4" />
                                    {formatDate(item.data)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}