"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { maskPhoneBR, normalizePhoneBR, maskMoneyBRCents, parseMoneyBRCents } from "@/lib/masks";

/* ============================================================
   📞 TELEFONE BRASIL
   (mostra formatado, envia hidden normalizado E.164 simplificado)
============================================================ */
export type BrazilPhoneInputProps = {
    id?: string;
    nameDisplay?: string;     // ex.: "telefone_visual"
    nameNormalized?: string;  // ex.: "telefone"
    required?: boolean;
    defaultValue?: string;
    autoFocus?: boolean;
    className?: string;
    onValueChange?: (masked: string, digits: string) => void;
};

export function BrazilPhoneInput({
                                     id,
                                     nameDisplay = "telefone_visual",
                                     nameNormalized = "telefone",
                                     required,
                                     defaultValue = "",
                                     autoFocus,
                                     className,
                                     onValueChange,
                                 }: BrazilPhoneInputProps) {
    const [value, setValue] = React.useState(maskPhoneBR(defaultValue));
    const normalized = normalizePhoneBR(value);

    return (
        <>
            <Input
                id={id}
                name={nameDisplay}
                value={value}
                onChange={(e) => {
                    const masked = maskPhoneBR(e.target.value);
                    const digits = normalizePhoneBR(masked);
                    setValue(masked);
                    onValueChange?.(masked, digits);
                }}
                placeholder="(11) 99999-9999"
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

/* ============================================================
   💰 MOEDA (com centavos)
   (mostra formatado 1.234,56 e envia hidden numérico)
============================================================ */
export type CurrencyCentsInputProps = {
    id?: string;
    nameDisplay?: string;     // campo visível
    nameNormalized?: string;  // hidden normalizado (float)
    placeholder?: string;
    required?: boolean;
    defaultValue?: string;
    className?: string;
    onValueChange?: (masked: string, normalized: string) => void;
};

export function CurrencyCentsInput({
                                       id,
                                       nameDisplay = "valor_visual",
                                       nameNormalized = "valor",
                                       placeholder = "0,00",
                                       required,
                                       defaultValue = "",
                                       className,
                                       onValueChange,
                                   }: CurrencyCentsInputProps) {
    const [value, setValue] = React.useState(maskMoneyBRCents(defaultValue));
    const normalized = parseMoneyBRCents(value)?.toString() ?? "";

    return (
        <>
            <Input
                id={id}
                name={nameDisplay}
                value={value}
                onChange={(e) => {
                    const masked = maskMoneyBRCents(e.target.value);
                    const norm = parseMoneyBRCents(masked)?.toString() ?? "";
                    setValue(masked);
                    onValueChange?.(masked, norm);
                }}
                placeholder={placeholder}
                inputMode="numeric"
                autoComplete="off"
                aria-label="Valor em reais (com centavos)"
                required={required}
                className={className}
            />
            <input type="hidden" name={nameNormalized} value={normalized} />
        </>
    );
}
