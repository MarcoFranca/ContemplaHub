"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type PillTone = "neutral" | "emerald" | "sky" | "indigo" | "yellow" | "red" | "slate";

export function Pill({
                         children,
                         title,
                         tone = "neutral",
                         className,
                         onClick,
                     }: {
    children: React.ReactNode;
    title?: string;
    tone?: PillTone;
    className?: string;
    onClick?: () => void;
}) {
    const tones: Record<PillTone, string> = {
        neutral: "bg-white/10 text-white/90 border-white/15",
        emerald: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
        sky:     "bg-sky-500/15 text-sky-200 border-sky-400/20",
        indigo:  "bg-indigo-500/15 text-indigo-200 border-indigo-400/20",
        yellow:  "bg-yellow-500/15 text-yellow-200 border-yellow-400/20",
        red:     "bg-red-500/15 text-red-200 border-red-400/20",
        slate:   "bg-slate-500/15 text-slate-200 border-slate-400/20",
    };

    return (
        <span
            title={title}
            onClick={onClick}
            className={cn(
                "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-0.5",
                "text-[11px] font-medium leading-none select-none",
                "backdrop-blur-sm",
                tones[tone],
                onClick && "cursor-pointer hover:brightness-110",
                className
            )}
        >
      <span className="truncate">{children}</span>
    </span>
    );
}
