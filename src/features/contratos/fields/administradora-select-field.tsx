"use client";

import { Building2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AdministradoraOption } from "../types/contrato-form.types";

interface Props {
    value: string;
    onChange: (value: string) => void;
    options: AdministradoraOption[];
    disabled?: boolean;
    className?: string;
}

export function AdministradoraSelectField({
                                              value,
                                              onChange,
                                              options,
                                              disabled,
                                              className,
                                          }: Props) {
    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className={cn("h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white focus:ring-emerald-400/15", className)}>
                <div className="flex min-w-0 items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-200/70" />
                    <SelectValue placeholder="Selecione a administradora" />
                </div>
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
