import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";

type AttentionItem = {
    id: string;
    title: string;
    description: string;
    href: string;
    severity: "high" | "medium";
};

export function DashboardAttention({ items }: { items: AttentionItem[] }) {
    return (
        <section className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Precisa da sua atenção</h2>
                <p className="text-sm text-muted-foreground">
                    Itens com impacto direto no comercial, na operação e no financeiro.
                </p>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="space-y-3">
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/40"
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`mt-0.5 rounded-lg p-2 ${
                                        item.severity === "high"
                                            ? "bg-red-500/10 text-red-600"
                                            : "bg-amber-500/10 text-amber-600"
                                    }`}
                                >
                                    <CircleAlert className="h-4 w-4" />
                                </div>

                                <div className="space-y-1">
                                    <p className="font-medium leading-none">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            </div>

                            <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}