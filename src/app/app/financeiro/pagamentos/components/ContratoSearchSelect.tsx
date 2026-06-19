"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { FinanceiroContratoOption } from "../types";

function optionLabel(c: FinanceiroContratoOption) {
    const numero = c.tem_contrato ? c.contrato_numero || "Número pendente" : "Sem contrato";
    return `${numero} · ${c.cliente_nome || "Cliente sem nome"} · Cota ${c.numero_cota || "—"}`;
}

export function ContratoSearchSelect({
    contratos,
    selectedId,
    basePath = "/app/financeiro/pagamentos",
}: {
    contratos: FinanceiroContratoOption[];
    selectedId: string;
    basePath?: string;
}) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const selected = contratos.find((c) => c.selection_id === selectedId) ?? null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-10 w-full justify-between border-white/10 bg-slate-950 text-left text-sm font-normal text-white"
                >
                    <span className="flex min-w-0 items-center gap-2">
                        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">
                            {selected ? optionLabel(selected) : "Selecione a carta / cliente"}
                        </span>
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command
                    filter={(value, search) => (value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)}
                >
                    <CommandInput placeholder="Buscar por cliente, cota ou contrato…" />
                    <CommandList>
                        <CommandEmpty>Nenhuma carta encontrada.</CommandEmpty>
                        <CommandGroup>
                            {contratos.map((c) => {
                                const label = optionLabel(c);
                                return (
                                    <CommandItem
                                        key={c.selection_id}
                                        value={label}
                                        onSelect={() => {
                                            setOpen(false);
                                            router.push(`${basePath}?item_id=${encodeURIComponent(c.selection_id)}`);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                c.selection_id === selectedId ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="truncate">{label}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
