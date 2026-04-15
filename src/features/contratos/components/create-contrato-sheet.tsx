"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ContratoFormShellV2 } from "./contrato-form-shell-v2";
import type {
    AdministradoraOption,
    ContratoFormMode,
    ParceiroOption,
} from "../types/contrato-form.types";

interface CreateContratoSheetProps {
    mode: ContratoFormMode;
    leadId: string;
    dealId?: string | null;
    administradoras: AdministradoraOption[];
    parceiros?: ParceiroOption[];
    trigger: React.ReactNode;
    leadName?: string | null;
}

export function CreateContratoSheet({
                                        mode,
                                        leadId,
                                        dealId,
                                        administradoras,
                                        parceiros = [],
                                        trigger,
                                        leadName,
                                    }: CreateContratoSheetProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>

            <SheetContent
                side="right"
                className="w-full border-l border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.10),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(37,99,235,0.14),_transparent_30%),linear-gradient(180deg,_#07111f_0%,_#091427_42%,_#08111d_100%)] p-0 text-white sm:max-w-[1240px]"
            >
                <div className="flex h-full min-h-0 flex-col">
                    <div className="border-b border-white/10 px-8 py-7 backdrop-blur-xl">
                        <SheetHeader className="space-y-4 text-left">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-3">
                                    <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-slate-300">
                                        {mode === "fromLead" ? "VENDA NOVA" : "CARTEIRA / EXISTENTE"}
                                    </div>

                                    <div className="space-y-2">
                                        <SheetTitle className="text-4xl font-semibold tracking-tight text-white">
                                            {mode === "fromLead"
                                                ? "Cadastrar carta / contrato"
                                                : "Cadastro operacional premium"}
                                        </SheetTitle>

                                        <SheetDescription className="max-w-3xl text-base leading-7 text-slate-300">
                                            {leadName
                                                ? `Cadastro para ${leadName}. Preenchimento guiado, revisão em tempo real e experiência visual premium.`
                                                : "Formalize a operação com contexto, clareza e fluidez."}
                                        </SheetDescription>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                        Experiência
                                    </div>
                                    <div className="mt-1 text-sm font-medium text-slate-100">
                                        Premium • Guiada • Operacional
                                    </div>
                                </div>
                            </div>
                        </SheetHeader>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
                        <ContratoFormShellV2
                            mode={mode}
                            leadId={leadId}
                            dealId={dealId}
                            administradoras={administradoras}
                            parceiros={parceiros}
                            insideSheet
                            onSuccess={() => setOpen(false)}
                        />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}