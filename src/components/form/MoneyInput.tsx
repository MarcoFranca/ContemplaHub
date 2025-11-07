"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { maskMoneyBRCents } from "@/lib/masks";

type Props = Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
    value?: string;                 // "1.234,56"
    onChange?: (formatted: string) => void;
};

export function MoneyInput({ value, onChange, ...rest }: Props) {
    const [local, setLocal] = React.useState<string>(value ?? "");

    React.useEffect(() => {
        setLocal(value ?? "");
    }, [value]);

    return (
        <Input
            inputMode="numeric"
            value={local}
            onChange={(e) => {
                const masked = maskMoneyBRCents(e.target.value);
                setLocal(masked);
                onChange?.(masked);
            }}
            placeholder="0,00"
            {...rest}
        />
    );
}
