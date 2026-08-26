"use client";

import * as React from "react";
import { Sparkles, Send, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { copilotoChatAction, type CopilotoMsg } from "@/app/app/copiloto/actions";

const SUGESTOES = [
    "Quantas cartas o Lucas tem?",
    "Alertas que vencem hoje",
    "Cadastrar um novo cliente",
];

export function CopilotoWidget() {
    const [open, setOpen] = React.useState(false);
    const [messages, setMessages] = React.useState<CopilotoMsg[]>([]);
    const [text, setText] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, loading]);

    async function enviar(msg: string) {
        const conteudo = msg.trim();
        if (!conteudo || loading) return;
        const novo: CopilotoMsg[] = [...messages, { role: "user", content: conteudo }];
        setMessages(novo);
        setText("");
        setLoading(true);
        try {
            const res = await copilotoChatAction(novo);
            setMessages([
                ...novo,
                { role: "assistant", content: res.ok ? res.reply || "..." : `⚠️ ${res.error || "Falha."}` },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* Botão flutuante */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
                title="Copiloto"
                aria-label="Abrir copiloto"
            >
                {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </button>

            {open ? (
                <div className="fixed bottom-20 right-5 z-50 flex h-[540px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117]/95 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                        <Bot className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-semibold">Copiloto</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">interno</span>
                    </div>

                    <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                        {messages.length === 0 ? (
                            <div className="space-y-3">
                                <p className="text-xs text-muted-foreground">
                                    Pergunte sobre seus clientes, cartas e alertas, ou peça pra cadastrar um cliente.
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    {SUGESTOES.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => enviar(s)}
                                            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/[0.06]"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {messages.map((m, i) => (
                            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                                <div
                                    className={
                                        "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm " +
                                        (m.role === "user"
                                            ? "rounded-br-sm bg-emerald-500/15 text-emerald-50"
                                            : "rounded-bl-sm bg-white/5 text-foreground")
                                    }
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}

                        {loading ? (
                            <div className="flex justify-start">
                                <div className="rounded-2xl rounded-bl-sm bg-white/5 px-3 py-2 text-sm text-muted-foreground">
                                    <span className="dot" />
                                    <span className="dot dot2" />
                                    <span className="dot dot3" />
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="border-t border-white/10 p-3">
                        <div className="flex gap-2">
                            <Input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Pergunte ou peça algo..."
                                disabled={loading}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        enviar(text);
                                    }
                                }}
                            />
                            <Button size="icon" disabled={loading || !text.trim()} onClick={() => enviar(text)}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
