import Link from "next/link";

type OperationalItem = {
    id: string;
    title: string;
    subtitle: string;
    dateLabel: string;
    href: string;
};

export function DashboardOperational({ items }: { items: OperationalItem[] }) {
    return (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-5">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Agenda operacional</h2>
                <p className="text-sm text-muted-foreground">
                    Assembleias, pendências de carta e tarefas que travam a operação.
                </p>
            </div>

            <div className="space-y-3">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className="flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/40"
                    >
                        <div className="space-y-1">
                            <p className="font-medium leading-none">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">{item.dateLabel}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}