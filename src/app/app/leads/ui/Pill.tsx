// src/app/app/leads/ui/Pill.tsx
"use client";
import * as React from "react";

export function Pill({ children, title }: { children: React.ReactNode; title?: string }) {
    return (
        <span title={title} className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/10 px-2 py-0.5 text-[11px] leading-none max-w-full whitespace-nowrap overflow-hidden text-ellipsis">
      {children}
    </span>
    );
}
