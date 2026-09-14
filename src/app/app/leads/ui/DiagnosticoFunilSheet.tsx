"use client";

import * as React from "react";
import { Sparkles, Loader2 } from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    getLeadDiagnosticoFunilAction,
    type DiagnosticoFunilRegistro,
} from "@/app/app/leads/actions.diagnostico-funil";
import { LeadDiagnosticoFunilCard } from "@/app/app/leads/[leadId]/LeadDiagnosticoFunilCard";

export function DiagnosticoFunilSheet({ leadId }: { leadId: string }) {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [loaded, setLoaded] = React.useState(false);
    const [registro, setRegistro] = React.useState<DiagnosticoFunilRegistro | null>(null);

    async function handleOpenChange(next: boolean) {
        setOpen(next);
        if (next && !loaded) {
            setLoading(true);
            try {
                const rec = await getLeadDiagnosticoFunilAction(leadId);
                setRegistro(rec);
            } catch {
                setRegistro(null);
            } finally {
                setLoading(false);
                setLoaded(true);
            }
        }
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200 hover:bg-emerald-500/20"
                    title="Ver o diagnóstico respondido pelo cliente"
                >
                    <Sparkles className="h-3 w-3" />
                    Diagnóstico
                </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full overflow-y-auto border-white/10 bg-slate-950/95 sm:max-w-2xl">
                <SheetHeader>
                    <SheetTitle>Diagnóstico do investidor</SheetTitle>
                </SheetHeader>

                <div className="mt-4">
                    {loading ? (
                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Carregando diagnóstico...
                        </div>
                    ) : registro ? (
                        <LeadDiagnosticoFunilCard registro={registro} />
                    ) : (
                        <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-muted-foreground">
                            Este lead ainda não respondeu o diagnóstico do formulário.
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
