"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    maskMoneyBRCents,
    parseMoneyBRCents,
} from "@/lib/masks";

interface MoneyFieldProps {
    value: number | null | undefined;
    onChange: (value: number | null) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

function formatInitial(value: number | null | undefined) {
    if (value == null || Number.isNaN(value)) return "";
    const cents = Math.round(value * 100);
    return maskMoneyBRCents(String(cents));
}

export function MoneyField({
                               value,
                               onChange,
                               placeholder,
                               disabled,
                               className,
                           }: MoneyFieldProps) {
    const [display, setDisplay] = React.useState(formatInitial(value));

    React.useEffect(() => {
        setDisplay(formatInitial(value));
    }, [value]);

    return (
        <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-200/70">
                R$
            </span>

            <Input
                inputMode="numeric"
                value={display}
                placeholder={placeholder ?? "0,00"}
                disabled={disabled}
                className={cn("h-11 rounded-2xl border-white/10 bg-white/[0.04] pl-14 text-white placeholder:text-slate-500 focus-visible:border-emerald-400/35 focus-visible:ring-emerald-400/15", className)}
                onChange={(e) => {
                    const masked = maskMoneyBRCents(e.target.value);
                    setDisplay(masked);
                    onChange(parseMoneyBRCents(masked));
                }}
            />
        </div>
    );
}
