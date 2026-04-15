"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
    maskMoneyBRCents,
    parseMoneyBRCents,
} from "@/lib/masks";

interface MoneyFieldProps {
    value: number | null | undefined;
    onChange: (value: number | null) => void;
    placeholder?: string;
    disabled?: boolean;
}

function formatInitial(value: number | null | undefined) {
    if (value == null || Number.isNaN(value)) return "";
    return maskMoneyBRCents(String(Math.round(value * 100)));
}

export function MoneyField({
                               value,
                               onChange,
                               placeholder,
                               disabled,
                           }: MoneyFieldProps) {
    const [display, setDisplay] = React.useState(formatInitial(value));

    React.useEffect(() => {
        setDisplay(formatInitial(value));
    }, [value]);

    return (
        <Input
            inputMode="numeric"
            value={display}
            placeholder={placeholder ?? "0,00"}
            disabled={disabled}
            onChange={(e) => {
                const masked = maskMoneyBRCents(e.target.value);
                setDisplay(masked);
                onChange(parseMoneyBRCents(masked));
            }}
        />
    );
}