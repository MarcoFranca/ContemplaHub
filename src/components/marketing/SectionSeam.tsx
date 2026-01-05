"use client";

import { cn } from "@/lib/utils";

type Props = {
    position?: "top" | "bottom";
    className?: string;
    heightClassName?: string; // ex: "h-16" | "h-20"
};

/**
 * “Costura” visual entre seções.
 * - Dark: mantém o fade escuro elegante.
 * - Light: adiciona um fade cinza-azulado suave (nada de faixa preta).
 */
export function SectionSeam({
                                position = "top",
                                className,
                                heightClassName = "h-16",
                            }: Props) {
    const isTop = position === "top";

    return (
        <div
            aria-hidden
            className={cn(
                "pointer-events-none absolute left-0 right-0",
                isTop ? "-top-16" : "-bottom-16",
                heightClassName,
                "z-10",
                className
            )}
        >
            {/* LIGHT */}
            <div
                className={cn(
                    "absolute inset-0 dark:hidden",
                    // no light: cinza-azulado + branco, bem leve
                    isTop
                        ? "bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(15,23,42,0.06)_45%,rgba(255,255,255,0.92)_100%)]"
                        : "bg-[linear-gradient(to_top,rgba(255,255,255,0)_0%,rgba(15,23,42,0.06)_45%,rgba(255,255,255,0.92)_100%)]"
                )}
            />

            {/* DARK */}
            <div
                className={cn(
                    "absolute inset-0 hidden dark:block",
                    // no dark: sua “quebra” bonita
                    isTop
                        ? "bg-[linear-gradient(to_bottom,rgba(2,6,23,0)_0%,rgba(2,6,23,0.35)_40%,rgba(0,0,0,1)_100%)]"
                        : "bg-[linear-gradient(to_top,rgba(2,6,23,0)_0%,rgba(2,6,23,0.35)_40%,rgba(0,0,0,1)_100%)]"
                )}
            />
        </div>
    );
}
