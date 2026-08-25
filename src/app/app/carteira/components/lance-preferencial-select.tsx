"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    normalizePreferencial,
    preferenciaLanceLabel,
    preferenciaLanceIcons,
    preferenciaLanceBadgeClass,
    type PreferenciaLanceValue,
} from "@/app/app/lances/lib/operacao";
import { updateTipoLancePreferencialAction } from "../actions/lance-preferencial";

const OPCOES: PreferenciaLanceValue[] = ["fixo", "livre", "embutido", "sorteio"];

export function LancePreferencialSelect({ cotaId, tipo }: { cotaId: string; tipo: string | null }) {
    const router = useRouter();
    const [pending, start] = React.useTransition();
    const atual = normalizePreferencial(tipo);

    function set(value: PreferenciaLanceValue | null) {
        if ((value ?? "") === atual) return;
        start(async () => {
            const res = await updateTipoLancePreferencialAction(cotaId, value);
            if (!res.ok) {
                toast.error(res.error || "Falha ao salvar.");
                return;
            }
            toast.success("Lance preferencial atualizado.");
            router.refresh();
        });
    }

    const Icon = atual ? preferenciaLanceIcons[atual] : null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    disabled={pending}
                    className="focus:outline-none disabled:opacity-60"
                    title="Alterar lance preferencial"
                >
                    <Badge
                        variant="outline"
                        className={`cursor-pointer gap-1 ${atual ? preferenciaLanceBadgeClass(atual) : "border-white/15 text-muted-foreground"}`}
                    >
                        {Icon ? <Icon className="h-3 w-3" /> : null}
                        {atual ? preferenciaLanceLabel(atual) : "Lance não definido"}
                        <ChevronDown className="h-3 w-3 opacity-70" />
                    </Badge>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuLabel>Lance preferencial</DropdownMenuLabel>
                {OPCOES.map((op) => {
                    const OpIcon = preferenciaLanceIcons[op];
                    return (
                        <DropdownMenuItem key={op} onClick={() => set(op)} className="gap-2">
                            <OpIcon className="h-3.5 w-3.5" />
                            {preferenciaLanceLabel(op)}
                            {atual === op ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                        </DropdownMenuItem>
                    );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => set(null)} className="text-muted-foreground">
                    Não definido
                    {!atual ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
