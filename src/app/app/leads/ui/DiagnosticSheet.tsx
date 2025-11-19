"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ClipboardList, Sparkles } from "lucide-react";
import { SectionFX } from "@/components/marketing/SectionFX";
import { DiagnosticPanel } from "./DiagnosticPanel";

type Props = {
    leadId: string;
    leadName?: string | null;
};

export function DiagnosticSheet({ leadId, leadName }: Props) {
    return (
        <Sheet>
            {/* Botão que abre o sheet */}
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="lg"
                    className="h-6 px-2 text-[11px] text-emerald-100 hover:bg-emerald-500/10 hover:text-emerald-50"
                >
                    Diagnóstico
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="
          isolate
          w-[420px] sm:w-[560px] lg:w-[720px]
          bg-slate-950/70 backdrop-blur-xl
          border-l border-white/10 shadow-2xl px-0
        "
            >
                {/* FX de fundo igual aos outros sheets */}
                <SectionFX
                    preset="nebula"
                    variant="emerald"
                    showGrid
                    className="absolute inset-0 -z-10"
                />

                {/* HEADER */}
                <SheetHeader className="px-6 pt-6 pb-3 border-b border-white/10">
                    <SheetTitle className="flex items-center justify-between gap-3 text-base">
                        <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/40">
                <ClipboardList className="h-3.5 w-3.5 text-emerald-300" />
              </span>
                            <div className="flex flex-col">
                                <span>Diagnóstico consultivo</span>
                                <span className="text-[11px] text-white/60">
                  Estrutura completa para calibrar prazo, carta e estratégia de
                  lances.
                </span>
                            </div>
                        </div>

                        <span className="ml-2 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/70 ring-1 ring-white/10 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-300" />
                            {leadName ?? "Lead"}
            </span>
                    </SheetTitle>
                </SheetHeader>

                {/* CONTEÚDO SCROLLÁVEL */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <DiagnosticPanel leadId={leadId} />
                </div>

                {/* FOOTER STICKY */}
                <SheetFooter className="sticky bottom-0 w-full bg-slate-950/80 backdrop-blur-xl border-t border-white/10 px-6 py-4 shadow-[0_-12px_24px_-12px_rgba(0,0,0,0.5)]">
                    <div className="flex w-full items-center justify-between gap-2">
            <span className="text-[11px] text-white/50">
              Use este diagnóstico junto com o interesse para desenhar o plano
              final da carta.
            </span>
                        <SheetClose asChild>
                            <Button type="button" variant="ghost">
                                Fechar
                            </Button>
                        </SheetClose>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
