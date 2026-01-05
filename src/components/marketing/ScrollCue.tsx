"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollCue({
                              targetId = "como-funciona",
                              className,
                          }: { targetId?: string; className?: string }) {
    const reduce = useReducedMotion();

    function go() {
        const el = document.getElementById(targetId);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return (
        <button
            type="button"
            onClick={go}
            aria-label="Rolar para ver mais"
            className={cn(
                "group absolute bottom-4 left-1/2 -translate-x-1/2 z-20",
                "inline-flex h-20 w-16 flex-col items-center justify-center",
                "rounded-2xl px-2 py-2 select-none touch-manipulation cursor-pointer",
                // LIGHT
                "bg-card/80 text-foreground border border-border shadow-sm backdrop-blur",
                "hover:bg-card hover:border-emerald-300/40",
                // DARK
                "dark:bg-white/[0.02] dark:text-slate-300/80 dark:border-white/15 dark:shadow-none",
                "dark:hover:text-white dark:hover:bg-emerald-400/10 dark:hover:border-emerald-400/40",
                // focus
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                className
            )}
        >
            <motion.span
                aria-hidden
                className={cn(
                    "mb-1 block h-6 w-4 rounded-full border pointer-events-none",
                    "border-foreground/25 group-hover:border-emerald-400/60",
                    "dark:border-white/30 dark:group-hover:border-emerald-300/70"
                )}
                animate={reduce ? {} : { opacity: [0.7, 1, 0.7] }}
                transition={reduce ? {} : { duration: 2.4, repeat: Infinity }}
            >
                <motion.span
                    className={cn(
                        "mx-auto mt-1 block h-1.5 w-1.5 rounded-full pointer-events-none",
                        "bg-foreground/60 group-hover:bg-emerald-500",
                        "dark:bg-white/70 dark:group-hover:bg-emerald-200"
                    )}
                    animate={reduce ? {} : { y: [0, 6, 0], opacity: [1, 0.5, 1] }}
                    transition={reduce ? {} : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.span>

            <motion.div
                aria-hidden
                className="flex items-center justify-center pointer-events-none"
                animate={reduce ? {} : { y: [0, 4, 0] }}
                transition={reduce ? {} : { duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            >
                <ChevronDown className="h-5 w-5 opacity-80 transition-all group-hover:opacity-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-300" />
            </motion.div>
        </button>
    );
}
