"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
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
}

export function DateField({
                              value,
                              onChange,
                              placeholder = "dd/mm/aaaa",
                              disabled,
                          }: DateFieldProps) {
    const [display, setDisplay] = React.useState(formatISODateToBR(value));

    React.useEffect(() => {
        setDisplay(formatISODateToBR(value));
    }, [value]);

    return (
        <Input
            inputMode="numeric"
            value={display}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => {
                const masked = maskDateBR(e.target.value);
                setDisplay(masked);
                onChange(parseDateBRToISO(masked));
            }}
        />
    );
}