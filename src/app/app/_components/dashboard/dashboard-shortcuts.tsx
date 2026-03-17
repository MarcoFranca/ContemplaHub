import Link from "next/link";
import { ArrowRight, BadgeDollarSign, FileSpreadsheet, Target, Users } from "lucide-react";

export function DashboardShortcuts() {
    const items = [
        { href: "/app/carteira", label: "Carteira", icon: <Users className="h-4 w-4" /> },
        { href: "/app/lances", label: "Lances e cotas", icon: <Target className="h-4 w-4" /> },
        { href: "/app/comissoes", label: "Comissões", icon: <BadgeDollarSign className="h-4 w-4" /> },
        { href: "/app/contratos", label: "Contratos", icon: <FileSpreadsheet className="h-4 w-4" /> },
    ];

    return (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-5">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Atalhos úteis</h2>
                <p className="text-sm text-muted-foreground">
                    Acesso rápido para as áreas que mais exigem decisão ao longo do dia.
                </p>
            </div>

            <div className="grid gap-3">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/40"
                    >
            <span className="inline-flex items-center gap-2 font-medium">
              {item.icon}
                {item.label}
            </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                ))}
            </div>
        </div>
    );
}