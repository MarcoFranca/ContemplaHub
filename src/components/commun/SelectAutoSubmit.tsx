"use client";

import * as React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { setPendingPref } from "@/lib/pendingPref";

type Props = {
    name: string;
    defaultValue: string;
    disabled?: boolean;
    pendingLabel?: string;
    values: string[]; // ["admin","gestor","vendedor","viewer"]
};

export function SelectAutoSubmit({ name, defaultValue, disabled, pendingLabel="Alterando função…", values }: Props) {
    const formRef = React.useRef<HTMLFormElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    // o form pai é injetado de fora; aqui só localizo
    React.useEffect(() => {
        let el: HTMLElement | null = (inputRef.current as any)?.closest?.("form") ?? null;
        formRef.current = el as HTMLFormElement | null;
    }, []);

    return (
        <>
            <input ref={inputRef} type="hidden" name={name} defaultValue={defaultValue} />
            <Select
                defaultValue={defaultValue}
                onValueChange={(v) => {
                    if (inputRef.current) inputRef.current.value = v;
                    setPendingPref("saving", pendingLabel);
                    formRef.current?.requestSubmit();
                }}
                disabled={disabled}
                name={name}
            >
                <SelectTrigger className="w-36">
                    <SelectValue placeholder="Função" />
                </SelectTrigger>
                <SelectContent>
                    {values.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
            </Select>
        </>
    );
}
