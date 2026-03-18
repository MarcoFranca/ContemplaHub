"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    current: "clientes" | "cartas";
    clientesHref: string;
    cartasHref: string;
};

export function CarteiraViewTabs({
                                     current,
                                     clientesHref,
                                     cartasHref,
                                 }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = React.useTransition();
    const [target, setTarget] = React.useState<"clientes" | "cartas" | null>(null);

    function go(next: "clientes" | "cartas") {
        const href = next === "clientes" ? clientesHref : cartasHref;
        setTarget(next);

        startTransition(() => {
            router.push(href);
        });
    }

    return (
        <div className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 p-1.5">
            <button
                type="button"
                onClick={() => go("clientes")}
                disabled={isPending}
                className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-70",
                    current === "clientes"
                        ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                {isPending && target === "clientes" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Users className="h-4 w-4" />
                )}
                Clientes
            </button>

            <button
                type="button"
                onClick={() => go("cartas")}
                disabled={isPending}
                className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-70",
                    current === "cartas"
                        ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                {isPending && target === "cartas" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <FileText className="h-4 w-4" />
                )}
                Cartas
            </button>
        </div>
    );
}