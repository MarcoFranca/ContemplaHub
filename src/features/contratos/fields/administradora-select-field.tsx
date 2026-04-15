"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { AdministradoraOption } from "../types/contrato-form.types";

interface Props {
    value: string;
    onChange: (value: string) => void;
    options: AdministradoraOption[];
    disabled?: boolean;
}

export function AdministradoraSelectField({
                                              value,
                                              onChange,
                                              options,
                                              disabled,
                                          }: Props) {
    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="border-white/10 bg-white/5 text-white">
                <SelectValue placeholder="Selecione a administradora" />
            </SelectTrigger>
            <SelectContent>
                {options.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                        {item.nome}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}