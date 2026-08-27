"use client";

import * as React from "react";
import { Sparkles, Send, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { copilotoChatAction, type CopilotoMsg } from "@/app/app/copiloto/actions";

const NOME = "Cora";
const POS_KEY = "copiloto-pos";

const SUGESTOES = [
    "Quantas cartas o Lucas tem?",
    "Alertas que vencem hoje",
    "Cadastrar um novo cliente",
];

// --- Render de markdown simples (negrito, itálico, quebras e bullets) ---
function renderInline(text: string, keyBase: string) {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((p, i) => {
        if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={`${keyBase}-${i}`}>{p.slice(2, -2)}</strong>;
        if (/^\*[^*]+\*$/.test(p)) return <em key={`${keyBase}-${i}`}>{p.slice(1, -1)}</em>;
        return <React.Fragment key={`${keyBase}-${i}`}>{p}</React.Fragment>;
    });
}

function RichText({ text }: { text: string }) {
    const lines = text.split("\n");
    return (
        <>
            {lines.map((line, i) => {
                const bullet = /^\s*[-*]\s+/.test(line);
                const content = bullet ? line.replace(/^\s*[-*]\s+/, "") : line;
                if (line.trim() === "") return <div key={i} className="h-2" />;
                return (
                    <div key={i} className={bullet ? "flex gap-1.5" : ""}>
                        {bullet ? <span className="mt-[2px] text-emerald-400">•</span> : null}
                        <span>{renderInline(content, String(i))}</span>
                    </div>
                );
            })}
        </>
    );
}

export function CopilotoWidget() {
    const [open, setOpen] = React.useState(false);
    const [messages, setMessages] = React.useState<CopilotoMsg[]>([]);
    const [text, setText] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
    const scrollRef = React.useRef<HTMLDivElement | null>(null);
    const drag = React.useRef<{ startX: number; startY: number; moved: boolean } | null>(null);

    // posição salva / default no canto inferior direito
    React.useEffect(() => {
        try {
            const raw = localStorage.getItem(POS_KEY);
            if (raw) {
                const p = JSON.parse(raw);
                if (typeof p?.x === "number" && typeof p?.y === "number") {
                    setPos(p);
                    return;
                }
            }
        } catch {
            /* ignore */
        }
        setPos({ x: window.innerWidth - 68, y: window.innerHeight - 68 });
    }, []);

    React.useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, loading]);

    function onPointerDown(e: React.PointerEvent) {
        drag.current = { startX: e.clientX, startY: e.clientY, moved: false };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
    function onPointerMove(e: React.PointerEvent) {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.startX;
        const dy = e.clientY - drag.current.startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.current.moved = true;
        if (drag.current.moved) {
            const x = Math.min(Math.max(e.clientX - 24, 8), window.innerWidth - 56);
            const y = Math.min(Math.max(e.clientY - 24, 8), window.innerHeight - 56);
            setPos({ x, y });
        }
    }
    function onPointerUp(e: React.PointerEvent) {
        const wasDrag = drag.current?.moved;
        drag.current = null;
        try {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
            /* ignore */
        }
        if (wasDrag) {
            if (pos) localStorage.setItem(POS_KEY, JSON.stringify(pos));
        } else {
            setOpen((v) => !v);
        }
    }

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

    if (!pos) return null;

    const painelSobe = pos.y > window.innerHeight / 2;
    const painelStyle: React.CSSProperties = { right: 0 };
    if (painelSobe) painelStyle.bottom = 60;
    else painelStyle.top = 60;

    return (
        <div className="fixed z-50" style={{ left: pos.x, top: pos.y }}>
            <button
                type="button"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="flex h-12 w-12 touch-none items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
                title={`${NOME} (arraste para mover)`}
                aria-label={open ? "Fechar assistente" : "Abrir assistente"}
            >
                {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </button>

            {open ? (
                <div
                    className="absolute flex h-[540px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117]/95 shadow-2xl backdrop-blur-xl"
                    style={painelStyle}
                >
                    <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                        <Bot className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-semibold">{NOME}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">copiloto interno</span>
                    </div>

                    <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                        {messages.length === 0 ? (
                            <div className="space-y-3">
                                <p className="text-xs text-muted-foreground">
                                    Olá! Sou o {NOME}. Pergunte sobre seus clientes, cartas e alertas, ou peça pra cadastrar um cliente.
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
                                        "max-w-[85%] break-words rounded-2xl px-3 py-2 text-sm " +
                                        (m.role === "user"
                                            ? "rounded-br-sm bg-emerald-500/15 text-emerald-50"
                                            : "rounded-bl-sm bg-white/5 text-foreground")
                                    }
                                >
                                    {m.role === "assistant" ? <RichText text={m.content} /> : m.content}
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
        </div>
    );
}
