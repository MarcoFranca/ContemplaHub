"use client";

import { Input } from "@/components/ui/input";

interface MoneyFieldProps {
    value: number | null | undefined;
    onChange: (value: number | null) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function MoneyField({
                               value,
                               onChange,
                               placeholder,
                               disabled,
                           }: MoneyFieldProps) {
    return (
        <Input
            type="number"
            step="0.01"
            inputMode="decimal"
            value={value ?? ""}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => {
                const raw = e.target.value;
                onChange(raw === "" ? null : Number(raw));
            }}
        />
    );
}