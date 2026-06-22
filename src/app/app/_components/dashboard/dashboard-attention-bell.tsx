import Link from "next/link";
import { Bell } from "lucide-react";

export function DashboardAttentionBell({ high, medium }: { high: number; medium: number }) {
    const total = high + medium;

    return (
        <Link
            href="/app/pendencias"
            title="Ver itens que precisam de atenção"
            className="group inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
        >
            <span className="relative">
                <Bell className="h-5 w-5 text-slate-300 group-hover:text-white" />
                {total > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                        {total}
                    </span>
                )}
            </span>

            {total === 0 ? (
                <span className="text-sm text-muted-foreground">Tudo em dia</span>
            ) : (
                <span className="flex items-center gap-2 text-sm">
                    {high > 0 && (
                        <span className="inline-flex items-center gap-1 text-rose-300">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            {high}
                        </span>
                    )}
                    {medium > 0 && (
                        <span className="inline-flex items-center gap-1 text-amber-300">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            {medium}
                        </span>
                    )}
                    <span className="hidden text-muted-foreground sm:inline">pendências</span>
                </span>
            )}
        </Link>
    );
}
