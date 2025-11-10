// src/features/diagnostic/QuickDiagnosticSheet.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { SectionFX } from "@/components/marketing/SectionFX";
import { ClipboardList, MessageCircle, Sparkles } from "lucide-react";
import { buildWhatsAppLink, formatMoneyBR, parseMoneyBR } from "@/lib/formatters";
import { nextBestActions, toValorNumber, type Interest as InterestT } from "./engine";

export type Interest = InterestT;

export function QuickDiagnosticSheet({
                                         triggerClassName,
                                         interest,
                                         phone,
                                     }: {
    triggerClassName?: string;
    interest: Interest;
    phone?: string | null;
}) {
    const [open, setOpen] = React.useState(false);

    const vNum = toValorNumber(interest.valorTotal);
    const valorMasked = vNum != null ? formatMoneyBR(String(Math.round(vNum * 100))) : null;

    const actions = nextBestActions(interest);

    const waText =
        `Oi! 😊 Sou da Autentika. Revisei seu interesse: ${interest.produto ?? "—"} • ` +
        `${interest.prazoMeses ? `${interest.prazoMeses}m` : "prazo a definir"} • ` +
        `${valorMasked ?? "valor a definir"}.\n\n` +
        `Posso te apresentar rapidamente como chegamos na melhor estratégia e simulações?`;
    const waLink = buildWhatsAppLink(phone || "", waText);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="sm" variant="outline" className={triggerClassName ?? "h-7 px-2 text-xs"}>
                    Ver interesse
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="isolate w-[720px] sm:w-[840px] max-w-[95vw] bg-slate-950/75 backdrop-blur-xl border-l border-white/10 px-0"
            >
                <SectionFX preset="nebula" variant="emerald" showGrid className="absolute inset-0 -z-10" />

                <SheetHeader className="px-6 pt-6 pb-3 border-b border-white/10">
                    <SheetTitle className="flex items-center gap-2 text-base">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/30">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            </span>
                        Diagnóstico rápido
                    </SheetTitle>
                </SheetHeader>

                <div className="flex h-[calc(100dvh-56px-64px)] flex-col overflow-auto px-6 py-5 gap-6">
                    {/* Resumo */}
                    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                        <div className="text-xs text-white/70 mb-2">Resumo</div>
                        <div className="flex flex-wrap items-center gap-1">
                            {interest.produto && (
                                <Badge variant="secondary"
                                       className="rounded-full px-2.5 py-0.5 text-[11px]">{interest.produto}</Badge>
                            )}
                            {interest.prazoMeses && (
                                <Badge variant="secondary"
                                       className="rounded-full px-2.5 py-0.5 text-[11px]">{interest.prazoMeses}m</Badge>
                            )}
                            {valorMasked && (
                                <Badge variant="secondary"
                                       className="rounded-full px-2.5 py-0.5 text-[11px]">R$ {valorMasked}</Badge>
                            )}
                            {interest.objetivo && (
                                <Badge variant="secondary"
                                       className="rounded-full px-2.5 py-0.5 text-[11px]">{interest.objetivo}</Badge>
                            )}
                            {interest.perfilDesejado && (
                                <Badge variant="secondary"
                                       className="rounded-full px-2.5 py-0.5 text-[11px]">{interest.perfilDesejado}</Badge>
                            )}
                        </div>
                    </section>

                    {/* Próxima jogada sugerida (do motor) */}
                    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                        <div className="text-xs text-white/70 mb-2">Próximas jogadas sugeridas</div>
                        <ol className="space-y-3">
                            {actions.map(a => (
                                <li key={a.id} className="rounded-lg bg-white/[0.03] p-3 border border-white/10">
                                    <div className="flex items-start justify-between gap-3">
                                        <h4 className="font-medium">{a.title}</h4>
                                        <span className="text-[10px] text-white/60">score {a.score}</span>
                                    </div>
                                    <p className="text-sm mt-1">{a.detail}</p>
                                    {a.why.length > 0 && (
                                        <ul className="mt-2 text-xs text-white/70 list-disc ml-4">
                                            {a.why.map(w => <li key={w}>{w}</li>)}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </section>

                    {/* (2) Perguntas e (3) Objeções virão AQUI nas próximas etapas */}
                </div>

                <SheetFooter className="sticky bottom-0 w-full bg-slate-950/80 backdrop-blur-xl border-t border-white/10 px-6 py-4">
                    <div className="flex w-full items-center justify-end gap-2">
                        <Button variant="secondary" asChild>
                            <a href={waLink} target="_blank" rel="noreferrer">
                                <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                            </a>
                        </Button>
                        <Button asChild>
                            <a href="/app/diagnostico" className="inline-flex items-center gap-2 text-sm">
                                <ClipboardList className="h-4 w-4" /> Abrir diagnóstico completo
                            </a>
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
