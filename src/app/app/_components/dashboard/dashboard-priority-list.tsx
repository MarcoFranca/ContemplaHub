import Link from "next/link";
import { ArrowRight } from "lucide-react";

type PriorityItem = {
    id: string;
    nome: string;
    etapa: string;
    owner?: string | null;
    readiness?: number | null;
    proximo_passo: string;
    href: string;
};

export function DashboardPriorityList({ items }: { items: PriorityItem[] }) {
    return (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-5">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Fila de prioridade</h2>
                <p className="text-sm text-muted-foreground">
                    Leads e oportunidades que merecem ação agora.
                </p>
            </div>

            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                        Nenhum item crítico no momento.
                    </div>
                ) : (
                    items.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/40"
                        >
                            <div className="space-y-1">
                                <p className="font-medium">{item.nome}</p>
                                <p className="text-sm text-muted-foreground">
                                    Etapa: {item.etapa} • Responsável: {item.owner || "Não definido"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Próximo passo: {item.proximo_passo}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-sm font-medium">
                                    Readiness: {item.readiness ?? "—"}
                                </p>
                                <ArrowRight className="ml-auto mt-1 h-4 w-4 text-muted-foreground" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}