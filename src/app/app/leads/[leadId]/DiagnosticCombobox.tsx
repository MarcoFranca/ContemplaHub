"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Option = {
  value: string;
  label: string;
  description?: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
  options: Option[];
};

export function DiagnosticCombobox({
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Buscar...",
  emptyText = "Nenhuma opção encontrada.",
  options,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const selected = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto min-h-10 w-full justify-between border-white/10 bg-background px-3 py-2 text-left"
        >
          <div className="min-w-0">
            {selected ? (
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{selected.label}</div>
                {selected.description ? (
                  <div className="truncate text-xs text-muted-foreground">
                    {selected.description}
                  </div>
                ) : null}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">{placeholder}</span>
            )}
          </div>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[380px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.description ?? ""}`}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="items-start py-3"
                >
                  <Check
                    className={cn(
                      "mr-2 mt-0.5 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{option.label}</div>
                    {option.description ? (
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    ) : null}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}