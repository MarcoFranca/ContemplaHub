"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { updateContractStatus } from "@/app/app/leads/actions";
import type { ContractStatus } from "@/app/app/leads/types";

const STATUS_OPTIONS: { value: ContractStatus; label: string }[] = [
    { value: "pendente_assinatura", label: "Pendente assinatura" },
    { value: "pendente_pagamento", label: "Pendente pagamento" },
    { value: "alocado", label: "Alocado" },
    { value: "contemplado", label: "Contemplado" },
    { value: "cancelado", label: "Cancelado" },
];

export function ContratoStatusEditor({
    contratoId,
    status,
}: {
    contratoId: string;
    status: string;
}) {
    const [value, setValue] = useState<ContractStatus>(
        (STATUS_OPTIONS.find((opt) => opt.value === status)?.value ?? "pendente_assinatura")
    );
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleChange(next: ContractStatus) {
        const previous = value;
        setValue(next);
        setError(null);

        startTransition(async () => {
            try {
                await updateContractStatus(contratoId, next);
            } catch {
                setValue(previous);
                setError("Não foi possível atualizar o status.");
            }
        });
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> : null}
                <select
                    value={value}
                    disabled={isPending}
                    onChange={(e) => handleChange(e.target.value as ContractStatus)}
                    className="h-8 rounded-xl border border-white/10 bg-black/20 px-2.5 text-xs capitalize text-foreground outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10 disabled:opacity-60"
                >
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
            {error ? <span className="text-[11px] text-red-300">{error}</span> : null}
        </div>
    );
}
