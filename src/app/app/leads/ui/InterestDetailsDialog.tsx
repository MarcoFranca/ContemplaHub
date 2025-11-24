"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import { Pill } from "./Pill";
import { SectionFX } from "@/components/marketing/SectionFX";
import { buildWhatsAppLink, formatMoneyBR, parseMoneyBR } from "@/lib/formatters";
import {
    Calendar,
    ClipboardList,
    FileSignature,
    MessageCircle,
    Sparkles,
    Brain,
} from "lucide-react";
import type { Interest, InterestInsight } from "@/app/app/leads/types";

// --- helpers de máscara/parse ---

function toValorNumber(v: string | null | undefined): number | null {
    if (!v) return null;
    const n = parseMoneyBR(v);
    if (n != null) return n;
    const digits = String(v).replace(/[^\d]/g, "");
    if (!digits) return null;
    const asNumber = Number(digits);
    return Number.isFinite(asNumber) ? asNumber : null;
}

function presentValorBR(val: string | null | undefined): string | null {
    const n = toValorNumber(val);
    if (n == null) return null;
    const centsDigits = Math.round(n * 100).toString();
    return formatMoneyBR(centsDigits);
}

// --- heurísticas locais (fallback) ---

function scoreInterestFallback(i: Interest) {
    let s = 0;
    if (i.produto) s += 20;
    if (i.prazoMeses && i.prazoMeses >= 60) s += 15;

    const v = toValorNumber(i.valorTotal);
    if (v != null) {
        if (v >= 200_000) s += 25;
        if (v >= 500_000) s += 10;
    }

    if (i.objetivo) s += 10;
    if (i.perfilDesejado) s += 10;
    if (i.observacao) s += 10;
    return Math.min(100, s);
}

function missingFieldsFallback(i: Interest) {
    const miss: string[] = [];
    if (!i.produto) miss.push("Produto");
    if (!i.prazoMeses) miss.push("Prazo");
    if (!i.valorTotal) miss.push("Valor da carta");
    if (!i.objetivo) miss.push("Objetivo");
    if (!i.perfilDesejado) miss.push("Perfil desejado");
    return miss;
}

function nextBestActionFallback(i: Interest) {
    const v = toValorNumber(i.valorTotal) ?? 0;
    if (i.produto === "imobiliario") {
        if (v >= 300_000 && (i.prazoMeses ?? 0) >= 120) {
            return "Propor diagnóstico consultivo + simulação com 2 prazos (180/200) e lances por FGTS/recursos próprios.";
        }
        return "Confirmar objetivo do imóvel (moradia vs renda), faixa de carta e prazo ideal para caber no fluxo.";
    }
    if (i.produto === "auto") {
        return "Validar uso (trabalho/família), quilometragem anual, e propor carta um degrau acima do veículo alvo.";
    }
    return "Esclarecer produto e objetivo antes da simulação; oferecer call rápida de 10 min.";
}

function suggestedQuestionsFallback(i: Interest) {
    const base = [
        "Qual é o objetivo principal com essa carta?",
        "Qual o prazo ideal de parcelas que você imagina?",
        "Existe recurso para lance (FGTS, poupança)?",
        "Quando pretende utilizar a carta (curto 3–6m / médio 6–12m)?",
        "Preferência por administradora ou já teve experiência anterior?",
    ];
    if (i.produto === "imobiliario") {
        base.splice(
            1,
            0,
            "Imóvel para moradia própria, segunda moradia ou renda (Airbnb/locação)?",
        );
    }
    if (i.produto === "auto") {
        base.splice(
            1,
            0,
            "Uso principal do carro (trabalho/família/app) e modelo/ano pretendido?",
        );
    }
    return base;
}

function likelyObjectionsFallback(i: Interest) {
    return [
        "Valor de parcela vs. orçamento mensal",
        "Prazo percebido como longo",
        "Ansiedade pela contemplação (tempo x lance)",
        "Comparação com financiamento (juros vs. disciplina do consórcio)",
    ];
}

// --- Componente ---

export function InterestDetailsDialog({
                                          insight,
                                          interest,
                                          phone,
                                          leadId,
                                      }: {
    interest: Interest;
    insight?: InterestInsight | null;
    phone?: string | null;
    leadId: string;
}) {
    const { produto, valorTotal, prazoMeses, objetivo, perfilDesejado, observacao } =
        interest;

    const valorMasked = presentValorBR(valorTotal);

    // backend + fallback
    const score = insight?.score ?? scoreInterestFallback(interest);
    const miss =
        (insight?.missing_fields?.length ? insight.missing_fields : null) ??
        missingFieldsFallback(interest);
    const nextBest = insight?.next_best_action ?? nextBestActionFallback(interest);
    const questions =
        (insight?.suggested_questions?.length ? insight.suggested_questions : null) ??
        suggestedQuestionsFallback(interest);
    const objections =
        (insight?.likely_objections?.length ? insight.likely_objections : null) ??
        likelyObjectionsFallback(interest);

    const strategyIdeas = insight?.strategy_ideas ?? [];
    const ticketSplits = insight?.suggested_ticket_splits ?? [];

    const waText =
        `Oi! 😊 Sou da Autentika. Revisei seu interesse: ${produto ?? "—"} • ` +
        `${prazoMeses ? `${prazoMeses}m` : "prazo a definir"} • ` +
        `${valorMasked ?? "valor a definir"}.\n\n` +
        `Para personalizar a proposta, posso confirmar com você?\n` +
        miss.map((m, idx) => ` ${idx + 1}. ${m}`).join("\n") +
        `\n\nPrefere uma call rápida de 10min hoje ou amanhã?`;

    const waLink = buildWhatsAppLink(phone || "", waText);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                    Estratégias
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="
          isolate
          w-[400px] sm:w-[540px] lg:w-[640px]
          bg-slate-950/70 backdrop-blur-xl
          border-l border-white/10 shadow-2xl px-0
        "
            >
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
                <Brain className="h-3.5 w-3.5 text-emerald-300" />
              </span>
                            <div className="flex flex-col">
                                <span>Estratégia rápida</span>
                                <span className="text-[11px] text-white/60">
                  Uso tático do interesse para definir a melhor carta.
                </span>
                            </div>
                        </div>

                        <span className="ml-2 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/70 ring-1 ring-white/10 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-300" />
              Fit: <b>{score}</b>/100
            </span>
                    </SheetTitle>

                    {/* “Chips” de contexto */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                        {produto && <Pill>{produto}</Pill>}
                        {prazoMeses && <Pill>{prazoMeses}m</Pill>}
                        {valorMasked && <Pill>{valorMasked}</Pill>}
                        {objetivo && <Pill>{objetivo}</Pill>}
                        {perfilDesejado && <Pill>{perfilDesejado}</Pill>}
                    </div>
                </SheetHeader>

                {/* CONTEÚDO COM ABAS */}
                <div className="flex-1 overflow-y-auto py-3">
                    <div className="px-6">
                        <Tabs defaultValue="resumo" className="space-y-3">
                            <TabsList className="grid grid-cols-3 rounded-2xl bg-slate-900/70 border border-white/10">
                                <TabsTrigger className="text-xs" value="resumo">
                                    Resumo
                                </TabsTrigger>
                                <TabsTrigger className="text-xs" value="estrategia">
                                    Estratégia
                                </TabsTrigger>
                                <TabsTrigger className="text-xs" value="roteiro">
                                    Roteiro
                                </TabsTrigger>
                            </TabsList>

                            {/* TAB: RESUMO */}
                            <TabsContent value="resumo" className="space-y-4 pt-2">
                                {observacao && (
                                    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                                        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70 mb-1">
                                            Observação do cliente
                                        </h3>
                                        <p className="text-sm font-medium whitespace-pre-wrap break-words">
                                            {observacao}
                                        </p>
                                    </section>
                                )}

                                <section className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70 mb-2">
                                        Checklist pré-reunião
                                    </h3>
                                    <ul className="list-disc ml-5 space-y-1 text-sm">
                                        {miss.length === 0 ? (
                                            <li className="text-emerald-300">
                                                Tudo pronto para apresentar proposta.
                                            </li>
                                        ) : (
                                            miss.map((m) => (
                                                <li key={m}>{m} — confirmar com o cliente.</li>
                                            ))
                                        )}
                                    </ul>
                                </section>
                            </TabsContent>

                            {/* TAB: ESTRATÉGIA */}
                            <TabsContent value="estrategia" className="space-y-4 pt-2">
                                <section className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70 mb-1">
                                        Próxima jogada sugerida
                                    </h3>
                                    <p className="text-sm">{nextBest}</p>
                                </section>

                                {(strategyIdeas.length > 0 || ticketSplits.length > 0) && (
                                    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5 space-y-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70">
                                            Estratégias de carta sugeridas
                                        </h3>

                                        {ticketSplits.length > 0 && (
                                            <div>
                                                <div className="text-[11px] text-muted-foreground mb-1">
                                                    Combinações possíveis
                                                </div>
                                                <ul className="list-disc ml-5 space-y-0.5 text-sm">
                                                    {ticketSplits.map((s) => (
                                                        <li key={s}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {strategyIdeas.length > 0 && (
                                            <ul className="list-disc ml-5 space-y-1 text-sm">
                                                {strategyIdeas.map((idea) => (
                                                    <li key={idea}>{idea}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </section>
                                )}

                                {/* Ações táticas */}
                                <section className="grid grid-cols-3 gap-2">
                                    <Button
                                        asChild
                                        variant="secondary"
                                        className="justify-start gap-2 text-xs bg-white/10 hover:bg-white/20 border border-white/20"
                                    >
                                        <a href="/app/agenda/nova">
                                            <Calendar className="h-4 w-4" /> Agendar reunião
                                        </a>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="secondary"
                                        className="justify-start gap-2 text-xs bg-white/10 hover:bg-white/20 border border-white/20"
                                    >
                                        <a href={`/app/leads/${leadId}/propostas/nova`}>
                                            <FileSignature className="h-4 w-4" /> Gerar proposta
                                        </a>
                                    </Button>
                                    <Button
                                        asChild
                                        className="justify-start gap-2 text-xs bg-emerald-600 hover:bg-emerald-500"
                                    >
                                        <a href={waLink} target="_blank" rel="noreferrer">
                                            <MessageCircle className="h-4 w-4" /> WhatsApp
                                        </a>
                                    </Button>
                                </section>
                            </TabsContent>

                            {/* TAB: ROTEIRO */}
                            <TabsContent value="roteiro" className="space-y-4 pt-2">
                                <section className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70 mb-1">
                                        Perguntas para qualificar
                                    </h3>
                                    <ol className="list-decimal ml-5 space-y-1 text-sm">
                                        {questions.map((q) => (
                                            <li key={q}>{q}</li>
                                        ))}
                                    </ol>
                                </section>

                                <section className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70 mb-1">
                                        Objeções prováveis
                                    </h3>
                                    <ul className="list-disc ml-5 space-y-1 text-sm">
                                        {objections.map((o) => (
                                            <li key={o}>{o}</li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70 mb-1">
                                        Anotações rápidas
                                    </h3>
                                    <textarea
                                        className="w-full min-h-[80px] bg-transparent text-sm outline-none resize-none"
                                        placeholder="Hipóteses de estratégia, riscos, condicionantes…"
                                    />
                                </section>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* FOOTER STICKY */}
                <SheetFooter className="sticky bottom-0 w-full bg-slate-950/80 backdrop-blur-xl border-t border-white/10 px-6 py-4 shadow-[0_-12px_24px_-12px_rgba(0,0,0,0.5)]">
                    <div className="flex w-full items-center justify-between gap-2">
            <span className="text-[11px] text-white/50">
              Use este painel como &quot;cola&quot; antes de abrir o diagnóstico completo.
            </span>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost">
                                Fechar
                            </Button>
                            <Button
                                type="button"
                                asChild
                                className="bg-emerald-600 hover:bg-emerald-500 text-sm"
                            >
                                <a
                                    href="/app/diagnostico"
                                    className="inline-flex items-center gap-2"
                                >
                                    <ClipboardList className="h-4 w-4" /> Diagnóstico completo
                                </a>
                            </Button>
                        </div>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
