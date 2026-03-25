"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ParceiroOption } from "../types/contrato-form.types";

interface Props {
    value: string | null | undefined;
    onChange: (value: string | null) => void;
    options: ParceiroOption[];
    disabled?: boolean;
}

export function ParceiroSelectField({
                                        value,
                                        onChange,
                                        options,
                                        disabled,
                                    }: Props) {
    return (
        <Select
            value={value ?? "__none__"}
            onValueChange={(v) => onChange(v === "__none__" ? null : v)}
            disabled={disabled}
        >
            <SelectTrigger>
                <SelectValue placeholder="Sem parceiro" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="__none__">Sem parceiro</SelectItem>
                {options.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                        {item.nome}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}