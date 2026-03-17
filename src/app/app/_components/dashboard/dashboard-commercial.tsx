import Link from "next/link";
import { ArrowRight } from "lucide-react";

type FunnelItem = {
    label: string;
    value: number;
};

export function DashboardCommercial({ items }: { items: FunnelItem[] }) {
    const max = Math.max(...items.map((item) => item.value), 1);

    return (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-5">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Funil comercial</h2>
                <p className="text-sm text-muted-foreground">
                    Do lead novo ao contrato fechado, com leitura rápida por etapa.
                </p>
            </div>

            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.label}</span>
                            <span className="text-muted-foreground">{item.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                            <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${(item.value / max) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <Link href="/app/carteira" className="inline-flex items-center gap-1 text-sm text-primary">
                    Abrir carteira <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}