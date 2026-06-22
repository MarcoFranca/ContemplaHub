import Link from "next/link";
import { BadgeDollarSign, FileSpreadsheet, Target, Users } from "lucide-react";

export function DashboardShortcuts() {
    const items = [
        { href: "/app/carteira", label: "Carteira", icon: <Users className="h-3.5 w-3.5" /> },
        { href: "/app/lances", label: "Lances", icon: <Target className="h-3.5 w-3.5" /> },
        { href: "/app/comissoes", label: "Comissões", icon: <BadgeDollarSign className="h-3.5 w-3.5" /> },
        { href: "/app/contratos", label: "Contratos", icon: <FileSpreadsheet className="h-3.5 w-3.5" /> },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Atalhos:</span>
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                    {item.icon}
                    {item.label}
                </Link>
            ))}
        </div>
    );
}
