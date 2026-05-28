"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    current: "cards" | "lista";
    baseHref: string;
};

const STORAGE_KEY = "carteira:view-mode";
const MODE_COOKIE_KEY = "carteira_mode";

function persistModePreference(next: "cards" | "lista") {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEY, next);
    document.cookie = `${MODE_COOKIE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
}

export function ClientesViewModeToggle({
    current,
    baseHref,
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = React.useTransition();
    const [target, setTarget] = React.useState<"cards" | "lista" | null>(null);

    React.useEffect(() => {
        persistModePreference(current);
    }, [current]);

    function go(next: "cards" | "lista") {
        setTarget(next);
        persistModePreference(next);

        startTransition(() => {
            router.push(`${baseHref}&mode=${next}`);
        });
    }

    return (
        <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] p-1 shadow-inner shadow-black/10">
            <button
                type="button"
                onClick={() => go("cards")}
                disabled={isPending}
                className={cn(
                    "inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm transition disabled:opacity-70",
                    current === "cards"
                        ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                {isPending && target === "cards" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <LayoutGrid className="h-4 w-4" />
                )}
                Cards
            </button>

            <button
                type="button"
                onClick={() => go("lista")}
                disabled={isPending}
                className={cn(
                    "inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm transition disabled:opacity-70",
                    current === "lista"
                        ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                {isPending && target === "lista" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <List className="h-4 w-4" />
                )}
                Lista
            </button>
        </div>
    );
}
