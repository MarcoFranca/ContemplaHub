"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Pill } from "./Pill";
import { buildWhatsAppLink, parseMoneyBR } from "@/lib/formatters";
import { Calendar, ClipboardList, FileSignature, MessageCircle } from "lucide-react";

type Interest = {
    produto?: string | null;
    valorTotal?: string | null;   // "850.000" ou "850.000,00"
    prazoMeses?: number | null;   // 120 / 180
    objetivo?: string | null;
    perfilDesejado?: string | null;
    observacao?: string | null;
};

function scoreInterest(i: Interest) {
    // Heurística simples para priorização (0–100)
    let s = 0;
    if (i.produto) s += 20;
    if (i.prazoMeses && i.prazoMeses >= 60) s += 15;
    if (i.valorTotal) {
        const v = parseMoneyBR(i.valorTotal) ?? Number(String(i.valorTotal).replace(/[^\d]/g, ""));
        if (v >= 200000) s += 25;
        if (v >= 500000) s += 10;
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

export function InterestDetailsDialog({ interest, phone }: { interest: Interest; phone?: string | null }) {
    const { produto, valorTotal, prazoMeses, objetivo, perfilDesejado, observacao } = interest;
    const score = scoreInterest(interest);
    const miss = missingFields(interest);

    const waText =
        `Oi! 😊 Sou da Autentika. Revisei seu interesse: ${produto ?? "—"} • ` +
        `${prazoMeses ? prazoMeses + "m" : "prazo a definir"} • ` +
        `${valorTotal ? "R$ " + valorTotal : "valor a definir"}.\n\n` +
        `Para personalizar a proposta, posso confirmar:\n` +
        `${miss.map((m, idx) => ` ${idx + 1}. ${m}`).join("\n")}\n\n` +
        `Prefere uma call rápida de 10min hoje ou amanhã?`;

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
                        <span className="text-xs text-muted-foreground">Fit: <b>{score}</b>/100</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-3 text-sm">
                    <div className="space-y-1">
                        <div className="text-muted-foreground text-xs">Resumo</div>
                        <div className="flex flex-wrap items-center gap-1">
                            {produto && <Pill>{produto}</Pill>}
                            {prazoMeses && <Pill>{prazoMeses}m</Pill>}
                            {valorTotal && <Pill>R$ {valorTotal}</Pill>}
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

                    <div className="grid grid-cols-3 gap-2 mt-2">
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

                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                        <div className="text-[11px] text-muted-foreground mb-1">Anotações rápidas</div>
                        <textarea className="w-full min-h-[80px] bg-transparent text-sm outline-none" placeholder="Hipóteses de estratégia, riscos, condicionantes…" />
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
