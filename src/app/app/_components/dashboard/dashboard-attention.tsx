import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert } from "lucide-react";
import type { PendenciaGrupo } from "../../_data/dashboard/get-pendencias";

export function DashboardAttention({ grupos }: { grupos: PendenciaGrupo[] }) {
    return (
        <section id="pendencias" className="scroll-mt-6 space-y-4">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Precisa da sua atenção</h2>
                <p className="text-sm text-muted-foreground">
                    Itens com impacto direto no comercial, na operação e no financeiro.
                </p>
            </div>

            {grupos.length === 0 ? (
                <div className="flex items-center gap-3 rounded-2xl border bg-card p-5 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <p className="text-sm text-muted-foreground">Tudo em dia, nenhuma pendência no momento.</p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {grupos.map((g) => (
                        <Link
                            key={g.categoria}
                            href={`/app/pendencias?cat=${g.categoria}`}
                            className="flex items-start justify-between gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-muted/40"
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`mt-0.5 rounded-lg p-2 ${
                                        g.severity === "high"
                                            ? "bg-rose-500/10 text-rose-500"
                                            : "bg-amber-500/10 text-amber-500"
                                    }`}
                                >
                                    <CircleAlert className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium leading-none">{g.label}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {g.items.length} {g.items.length === 1 ? "item" : "itens"} · {g.descricao}
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
