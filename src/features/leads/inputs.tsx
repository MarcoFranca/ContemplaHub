"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { maskPhoneBR, normalizePhoneBR, maskCurrencyPlain, normalizeCurrencyPlain } from "@/lib/masks";

/* ---------- Phone com máscara + hidden normalizado ---------- */
export type PhoneInputProps = {
    id?: string;
    nameDisplay?: string;     // ex.: "telefone_visual"
    nameNormalized?: string;  // ex.: "telefone" (digits c/ 55)
    required?: boolean;
    defaultValue?: string;
    autoFocus?: boolean;
    className?: string;
};

export function BrazilPhoneInput(props: PhoneInputProps) {
    const { id, nameDisplay = "telefone_visual", nameNormalized = "telefone",
        required, defaultValue = "", autoFocus, className } = props;

    const autoId = useId(); // hook sempre chamado
    const _id = id ?? autoId;

    const [value, setValue] = useState(maskPhoneBR(defaultValue));
    const normalized = normalizePhoneBR(value);

    return (
        <>
            <Input
                id={_id}
                name={nameDisplay}
                value={value}
                onChange={(e) => setValue(maskPhoneBR(e.target.value))}
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

/* ---------- Currency simples (milhar, sem centavos) ---------- */
export type CurrencyInputProps = {
    id?: string;
    nameDisplay?: string;
    nameNormalized?: string;
    placeholder?: string;
    required?: boolean;
    defaultValue?: string;
    className?: string;
};

export function PlainCurrencyInput(props: CurrencyInputProps) {
    const { id, nameDisplay = "valor_carta_visual", nameNormalized = "valor_carta",
        placeholder = "300.000", required, defaultValue = "", className } = props;

    const autoId = useId();
    const _id = id ?? autoId;

    const [value, setValue] = useState(maskCurrencyPlain(defaultValue));
    const normalized = normalizeCurrencyPlain(value);

    return (
        <>
            <Input
                id={_id}
                name={nameDisplay}
                value={value}
                onChange={(e) => setValue(maskCurrencyPlain(e.target.value))}
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

/* ---------- Select com “Outro” + campo livre ---------- */
export type SelectWithOtherProps = {
    id: string;
    name: string;
    value: string;
    onValueChange: (v: string) => void;
    label?: string;
    placeholder?: string;
    options: Array<{ v: string; l: string }>;
    otherValue: string;
    onOtherChange: (v: string) => void;
    otherPlaceholder?: string;
    className?: string;
    triggerClassName?: string;
    inputClassName?: string;
};

export function SelectWithOther({
                                    id, name, value, onValueChange,
                                    label, placeholder = "Selecione",
                                    options, otherValue, onOtherChange,
                                    otherPlaceholder = "Descreva",
                                    className, triggerClassName, inputClassName,
                                }: SelectWithOtherProps) {
    return (
        <div className={className}>
            {label && <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>}
            <Select value={value} onValueChange={(v: string) => onValueChange(v)} name={name}>
                <SelectTrigger id={id} className={triggerClassName}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map(o => (<SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>))}
                    <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
            </Select>
            {value === "outro" && (
                <Input
                    name={`${name}_outro`}
                    value={otherValue}
                    onChange={(e) => onOtherChange(e.target.value)}
                    placeholder={otherPlaceholder}
                    className={`mt-2 ${inputClassName ?? ""}`}
                />
            )}
        </div>
    );
}
