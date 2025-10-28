// src/components/form/BrazilPhoneInput.tsx
"use client";
import { Input } from "@/components/ui/input";
import { useId, useState } from "react";
import { maskPhoneBR, normalizePhoneBR } from "@/lib/masks";

type Props = {
    id?: string;
    nameDisplay?: string;   // exibe máscara
    nameNormalized?: string; // hidden normalizado
    required?: boolean;
    defaultValue?: string;
    onChangeNormalized?: (v: string) => void;
    autoFocus?: boolean;
    className?: string;
};

export function BrazilPhoneInput({
                                     id,
                                     nameDisplay = "telefone_visual",
                                     nameNormalized = "telefone",
                                     required,
                                     defaultValue = "",
                                     onChangeNormalized,
                                     autoFocus,
                                     className,
                                 }: Props) {
    const _id = id ?? useId();
    const [value, setValue] = useState(maskPhoneBR(defaultValue));

    const normalized = normalizePhoneBR(value);

    return (
        <>
            <Input
                id={_id}
                name={nameDisplay}
                value={value}
                onChange={(e) => {
                    const masked = maskPhoneBR(e.target.value);
                    setValue(masked);
                    onChangeNormalized?.(normalizePhoneBR(masked));
                }}
                placeholder="(11) 98765-4321"
                inputMode="tel"
                autoComplete="tel-national"
                aria-label="WhatsApp com DDD"
                required={required}
                autoFocus={autoFocus}
                className={className}
            />
            <input type="hidden" name={nameNormalized} value={normalized} />
        </>
    );
}
