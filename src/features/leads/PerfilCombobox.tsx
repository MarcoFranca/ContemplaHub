"use client";

import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// src/features/leads/PerfilCombobox.tsx

type Option = { v: string; l: string; d?: string };

type Props = {
    id?: string;
    name?: string;
    value: string;
    onChange: (v: string) => void;
    options: Option[] | readonly Option[];
    placeholder?: string;
    className?: string;
};


/** Combobox estilo shadcn com descrição em cada item */
export function PerfilCombobox({
                                   id, name = "perfil_psico", value, onChange, options, placeholder = "Selecione", className,
                               }: Props) {
    const [open, setOpen] = React.useState(false);
    const selected = options.find((o) => o.v === value);

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn("h-11 w-full justify-between", className)}
                    >
            <span className="truncate">
              {selected ? selected.l : placeholder}
            </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    sideOffset={6}
                    className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] z-[70]"
                >
                    <Command>
                        <CommandInput placeholder="Buscar perfil..." />
                        <CommandList>
                            <CommandEmpty>Nenhum perfil encontrado.</CommandEmpty>
                            <CommandGroup>
                                {options.map((o) => (
                                    <CommandItem
                                        key={o.v}
                                        value={o.l}
                                        keywords={[o.l, o.v]}
                                        onSelect={() => {
                                            onChange(o.v);
                                            setOpen(false);
                                        }}
                                        className="flex flex-col items-start gap-1"
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <span>{o.l}</span>
                                            <Check
                                                className={cn(
                                                    "h-4 w-4 opacity-0",
                                                    value === o.v && "opacity-100"
                                                )}
                                            />
                                        </div>
                                        {o.d && (
                                            <span className="text-xs text-muted-foreground leading-snug">
                        {o.d}
                      </span>
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {/* hidden para enviar o valor selecionado no submit do formulário */}
            <input type="hidden" name={name} value={value} />
        </>
    );
}
