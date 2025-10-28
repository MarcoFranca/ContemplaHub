// src/components/form/PlainCurrencyInput.tsx
"use client";
import { Input } from "@/components/ui/input";
import { useId, useState } from "react";
import { maskCurrencyPlain, normalizeCurrencyPlain } from "@/lib/masks";

type Props = {
    id?: string;
    nameDisplay?: string;
    nameNormalized?: string;
    placeholder?: string;
    required?: boolean;
    defaultValue?: string;
    onChangeNormalized?: (v: string) => void;
    className?: string;
};

export function PlainCurrencyInput({
                                       id,
                                       nameDisplay = "valor_carta_visual",
                                       nameNormalized = "valor_carta",
                                       placeholder = "300.000",
                                       required,
                                       defaultValue = "",
                                       onChangeNormalized,
                                       className,
                                   }: Props) {
    const _id = id ?? useId();
    const [value, setValue] = useState(maskCurrencyPlain(defaultValue));
    const normalized = normalizeCurrencyPlain(value);

    return (
        <>
            <Input
                id={_id}
                name={nameDisplay}
                value={value}
                onChange={(e) => {
                    const masked = maskCurrencyPlain(e.target.value);
                    setValue(masked);
                    onChangeNormalized?.(normalizeCurrencyPlain(masked));
                }}
                placeholder={placeholder}
                inputMode="numeric"
                autoComplete="off"
                aria-label="Valor da carta em reais (sem centavos)"
                required={required}
                className={className}
            />
            <input type="hidden" name={nameNormalized} value={normalized} />
        </>
    );
}
