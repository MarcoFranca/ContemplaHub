"use client";

import * as React from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { AiFalha } from "./actions";

function fmt(dt: string | null) {
    if (!dt) return "";
    try {
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dt));
    } catch {
        return "";
    }
}

/** Resume o erro técnico numa frase amigável. */
function motivoAmigavel(erro: string | null): string {
    const e = (erro || "").toLowerCase();
    if (e.includes("credit") || e.includes("balance")) return "Créditos da IA (Anthropic) esgotados";
    if (e.includes("rate") || e.includes("429")) return "Limite de uso da IA atingido (rate limit)";
    if (e.includes("end with a user message") || e.includes("prefill")) return "Histórico da conversa inválido";
    if (e.includes("model") && e.includes("not") ) return "Modelo de IA indisponível/ inválido";
    if (e.includes("timeout")) return "Tempo esgotado ao gerar a resposta";
    if (e.includes("sem resposta")) return "IA não gerou resposta";
    return "Falha ao gerar resposta";
}

export function AiFalhasBanner({ falhas }: { falhas: AiFalha[] }) {
    const [aberto, setAberto] = React.useState(false);
    if (!falhas.length) return null;

    const ultima = falhas[0];

    return (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100">
            <button
                type="button"
                onClick={() => setAberto((v) => !v)}
                className="flex w-full items-center justify-between gap-3 text-left"
            >
                <span className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    A IA teve {falhas.length} falha{falhas.length > 1 ? "s" : ""} recente{falhas.length > 1 ? "s" : ""}
                    <span className="text-amber-200/80">
                        · última: {motivoAmigavel(ultima.erro)} ({fmt(ultima.created_at)})
                    </span>
                </span>
                {aberto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {aberto ? (
                <div className="mt-3 space-y-1.5">
                    {falhas.map((f) => (
                        <div key={f.id} className="rounded-md border border-amber-500/20 bg-black/10 px-2.5 py-1.5 text-xs">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium">{motivoAmigavel(f.erro)}</span>
                                <span className="text-amber-200/70">
                                    {f.telefone ?? "—"} · {fmt(f.created_at)}
                                </span>
                            </div>
                            {f.erro ? (
                                <p className="mt-1 break-words font-mono text-[10px] text-amber-200/60">{f.erro}</p>
                            ) : null}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
