"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Pill } from "./Pill";
import { buildWhatsAppLink, formatMoneyBR, parseMoneyBR } from "@/lib/formatters";
import { Calendar, ClipboardList, FileSignature, MessageCircle } from "lucide-react";

/** Mantém compatibilidade com o que já vem do backend */
type Interest = {
    produto?: string | null;
    valorTotal?: string | null;   // "250000" | "250.000" | "250.000,00"
    prazoMeses?: number | null;   // 120 / 180
    objetivo?: string | null;
    perfilDesejado?: string | null;
    observacao?: string | null;
};

// --- helpers de máscara/parse (mesma linha que usamos no restante) ---

/** Converte qualquer entrada (com pontos/virgulas ou só dígitos) para número em REAIS. */
function toValorNumber(v: string | null | undefined): number | null {
    if (!v) return null;
    const n = parseMoneyBR(v);
    if (n != null) return n; // já era "1.234,56" etc.
    // fallback: trata como REAIS inteiros em dígitos ("250000" => 250000.00)
    const digits = String(v).replace(/[^\d]/g, "");
    if (!digits) return null;
    const asNumber = Number(digits);
    return Number.isFinite(asNumber) ? asNumber : null;
}

/** Apresenta em "R$ 250.000,00" sempre. Aproveita o formatMoneyBR (que opera com CENTAVOS). */
function presentValorBR(val: string | null | undefined): string | null {
    const n = toValorNumber(val);
    if (n == null) return null;
    // formatMoneyBR lê dígitos como centavos → multiplicamos por 100 e passamos como string.
    const centsDigits = Math.round(n * 100).toString();
    return formatMoneyBR(centsDigits);
}

// --- heurística/UX ---

function scoreInterest(i: Interest) {
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

function missingFields(i: Interest) {
    const miss: string[] = [];
    if (!i.produto) miss.push("Produto");
    if (!i.prazoMeses) miss.push("Prazo");
    if (!i.valorTotal) miss.push("Valor da carta");
    if (!i.objetivo) miss.push("Objetivo");
    if (!i.perfilDesejado) miss.push("Perfil");
    return miss;
}

function nextBestAction(i: Interest) {
    // estratégia simples por produto/valor/prazo
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

function suggestedQuestions(i: Interest) {
    const base = [
        "Qual é o objetivo principal com essa carta?",
        "Qual o prazo ideal de parcelas que você imagina?",
        "Existe recurso para lance (FGTS, poupança)?",
        "Quando pretende utilizar a carta (curto 3–6m / médio 6–12m)?",
        "Preferência por administradora ou já teve experiência anterior?",
    ];
    if (i.produto === "imobiliario") {
        base.splice(1, 0, "Imóvel para moradia própria, segunda moradia ou renda (Airbnb/locação)?");
    }
    if (i.produto === "auto") {
        base.splice(1, 0, "Uso principal do carro (trabalho/família/app) e modelo/ano pretendido?");
    }
    return base;
}

function likelyObjections(i: Interest) {
    return [
        "Valor de parcela vs. orçamento mensal",
        "Prazo percebido como longo",
        "Ansiedade pela contemplação (tempo x lance)",
        "Comparação com financiamento (juros vs. disciplina do consórcio)",
    ];
}

// --- Componente ---

export function InterestDetailsDialog({
                                          interest,
                                          phone,
                                      }: {
    interest: Interest;
    phone?: string | null;
}) {
    const { produto, valorTotal, prazoMeses, objetivo, perfilDesejado, observacao } = interest;

    const valorMasked = presentValorBR(valorTotal); // 👈 sempre “R$ 250.000,00”
    const score = scoreInterest(interest);
    const miss = missingFields(interest);

    const waText =
        `Oi! 😊 Sou da Autentika. Revisei seu interesse: ${produto ?? "—"} • ` +
        `${prazoMeses ? `${prazoMeses}m` : "prazo a definir"} • ` +
        `${valorMasked ?? "valor a definir"}.\n\n` +
        `Para personalizar a proposta, posso confirmar:\n` +
        miss.map((m, idx) => ` ${idx + 1}. ${m}`).join("\n") +
        `\n\nPrefere uma call rápida de 10min hoje ou amanhã?`;

    const waLink = buildWhatsAppLink(phone || "", waText);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Ver interesse</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg md:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Diagnóstico rápido</span>
                        <span className="text-xs text-muted-foreground">
              Fit: <b>{score}</b>/100
            </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 text-sm">
                    {/* Resumo */}
                    <div className="space-y-1">
                        <div className="text-muted-foreground text-xs">Resumo</div>
                        <div className="flex flex-wrap items-center gap-1">
                            {produto && <Pill>{produto}</Pill>}
                            {prazoMeses && <Pill>{prazoMeses}m</Pill>}
                            {valorMasked && <Pill>{valorMasked}</Pill>}
                            {objetivo && <Pill>{objetivo}</Pill>}
                            {perfilDesejado && <Pill>{perfilDesejado}</Pill>}
                        </div>
                    </div>

                    {observacao && (
                        <div className="space-y-1">
                            <div className="text-muted-foreground text-xs">Observação</div>
                            <div className="font-medium whitespace-pre-wrap break-words">{observacao}</div>
                        </div>
                    )}

                    {/* Checklist */}
                    <div className="grid gap-2">
                        <div className="text-muted-foreground text-xs">Checklist pré-reunião</div>
                        <ul className="list-disc ml-5 space-y-1">
                            {miss.length === 0 ? (
                                <li className="text-emerald-300">Tudo pronto para apresentar proposta.</li>
                            ) : (
                                miss.map((m) => <li key={m}>{m} — confirmar com o cliente.</li>)
                            )}
                        </ul>
                    </div>

                    {/* Estratégia sugerida */}
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                        <div className="text-[11px] text-muted-foreground mb-1">Próxima jogada sugerida</div>
                        <div className="text-sm">{nextBestAction(interest)}</div>
                    </div>

                    {/* 5 perguntas-chaves */}
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                        <div className="text-[11px] text-muted-foreground mb-1">Perguntas para qualificar</div>
                        <ol className="list-decimal ml-5 space-y-1">
                            {suggestedQuestions(interest).map((q) => <li key={q}>{q}</li>)}
                        </ol>
                    </div>

                    {/* Objeções prováveis */}
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                        <div className="text-[11px] text-muted-foreground mb-1">Objeções prováveis</div>
                        <ul className="list-disc ml-5 space-y-1">
                            {likelyObjections(interest).map((o) => <li key={o}>{o}</li>)}
                        </ul>
                    </div>

                    {/* Anotações */}
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                        <div className="text-[11px] text-muted-foreground mb-1">Anotações rápidas</div>
                        <textarea
                            className="w-full min-h-[80px] bg-transparent text-sm outline-none"
                            placeholder="Hipóteses de estratégia, riscos, condicionantes…"
                        />
                    </div>

                    {/* Ações */}
                    <div className="grid grid-cols-3 gap-2">
                        <Button asChild variant="secondary" className="justify-start gap-2 text-xs">
                            <a href="/app/agenda/nova"><Calendar className="h-4 w-4" /> Agendar reunião</a>
                        </Button>
                        <Button asChild variant="secondary" className="justify-start gap-2 text-xs">
                            <a href="/app/propostas/nova"><FileSignature className="h-4 w-4" /> Gerar proposta</a>
                        </Button>
                        <Button asChild className="justify-start gap-2 text-xs">
                            <a href={waLink} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline">Fechar</Button>
                    <Button type="button" asChild>
                        <a href="/app/diagnostico" className="inline-flex items-center gap-2 text-sm">
                            <ClipboardList className="h-4 w-4" /> Abrir diagnóstico completo
                        </a>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
