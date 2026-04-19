"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    formatISODateToBR,
    maskDateBR,
    parseDateBRToISO,
} from "@/lib/masks";

interface DateFieldProps {
    value: string | null | undefined;
    onChange: (value: string | null) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function DateField({
                              value,
                              onChange,
                              placeholder = "dd/mm/aaaa",
                              disabled,
                              className,
                          }: DateFieldProps) {
    const [display, setDisplay] = React.useState(formatISODateToBR(value));

    React.useEffect(() => {
        setDisplay(formatISODateToBR(value));
    }, [value]);

    return (
        <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-200/70" />

            <Input
                inputMode="numeric"
                value={display}
                placeholder={placeholder}
                disabled={disabled}
                className={cn("h-11 rounded-2xl border-white/10 bg-white/[0.04] pl-11 text-white placeholder:text-slate-500 focus-visible:border-emerald-400/35 focus-visible:ring-emerald-400/15", className)}
                onChange={(e) => {
                    const masked = maskDateBR(e.target.value);
                    setDisplay(masked);
                    onChange(parseDateBRToISO(masked));
                }}
            />
        </div>
    );
}
