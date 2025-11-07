"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { maskPhoneBR, unformatPhoneBR } from "@/lib/masks";

type Props = Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
    value?: string;                 // dígitos SEM DDI (ex: "11912345678")
    onChange?: (digits: string) => void;
};

export function PhoneInput({ value, onChange, ...rest }: Props) {
    const [local, setLocal] = React.useState(maskPhoneBR(value || ""));

    React.useEffect(() => {
        setLocal(maskPhoneBR(value || ""));
    }, [value]);

    return (
        <Input
            inputMode="tel"
            value={local}
            onChange={(e) => {
                const masked = maskPhoneBR(e.target.value);
                setLocal(masked);
                onChange?.(unformatPhoneBR(masked));
            }}
            placeholder="(11) 91234-5678"
            {...rest}
        />
    );
}
