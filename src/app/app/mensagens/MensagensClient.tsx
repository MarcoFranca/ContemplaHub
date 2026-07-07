"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, CheckCheck, Clock, AlertTriangle, Send, MessageCircle, ExternalLink, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { reativarIaAction, replyConversationAction, type Conversation } from "./actions";

function StatusIcon({ status }: { status: string | null }) {
    switch (status) {
        case "read":
            return <CheckCheck className="h-3 w-3 text-sky-400" />;
        case "delivered":
            return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
        case "sent":
            return <Check className="h-3 w-3 text-muted-foreground" />;
        case "failed":
            return <AlertTriangle className="h-3 w-3 text-rose-400" />;
        default:
            return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
}

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

export function MensagensClient({ initial }: { initial: Conversation[] }) {
    const router = useRouter();
    const [selectedKey, setSelectedKey] = React.useState<string | null>(
        initial[0] ? (initial[0].lead_id ?? initial[0].phone) : null,
    );

    const keyOf = (c: Conversation) => c.lead_id ?? c.phone ?? "?";
    const selected = initial.find((c) => keyOf(c) === selectedKey) ?? null;

    if (!initial.length) {
        return (
            <div className="rounded-xl border border-white/10 p-10 text-center text-muted-foreground">
                <MessageCircle className="mx-auto mb-3 h-8 w-8 text-emerald-500/60" />
                Nenhuma conversa ainda. Quando um lead enviar mensagem no WhatsApp, ela aparece aqui.
            </div>
        );
    }

    return (
        <div className="grid h-[calc(100vh-13rem)] grid-cols-1 overflow-hidden rounded-xl border border-white/10 md:grid-cols-[320px_1fr]">
            {/* Lista de conversas */}
            <div className="overflow-y-auto border-b border-white/10 md:border-b-0 md:border-r">
                {initial.map((c) => {
                    const k = keyOf(c);
                    const active = k === selectedKey;
                    return (
                        <button
                            key={k}
                            onClick={() => setSelectedKey(k)}
                            className={
                                "flex w-full flex-col gap-0.5 border-b border-white/5 px-4 py-3 text-left transition " +
                                (active ? "bg-emerald-500/10" : "hover:bg-white/5")
                            }
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="flex min-w-0 items-center gap-1.5">
                                    <span className="truncate font-medium">{c.nome}</span>
                                    {c.precisaHumano ? (
                                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium text-amber-300">
                                            <UserRound className="h-2.5 w-2.5" /> humano
                                        </span>
                                    ) : null}
                                </span>
                                <span className="shrink-0 text-[10px] text-muted-foreground">{fmt(c.lastAt)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                {c.lastDirection === "out" ? <span className="text-emerald-400">Você:</span> : null}
                                <span className="truncate">{c.lastBody}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Thread */}
            {selected ? (
                <ConversationThread key={keyOf(selected)} conversation={selected} onSent={() => router.refresh()} />
            ) : (
                <div className="flex items-center justify-center text-muted-foreground">Selecione uma conversa</div>
            )}
        </div>
    );
}

function ReativarIaButton({ leadId, onDone }: { leadId: string; onDone: () => void }) {
    const [pending, start] = React.useTransition();
    return (
        <Button
            variant="outline"
            size="sm"
            className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
            disabled={pending}
            onClick={() => {
                start(async () => {
                    const res = await reativarIaAction(leadId);
                    if (!res.ok) {
                        toast.error(res.error || "Falha ao reativar.");
                        return;
                    }
                    toast.success("IA reativada para esta conversa.");
                    onDone();
                });
            }}
        >
            {pending ? "..." : "Reativar IA"}
        </Button>
    );
}

function ConversationThread({
    conversation,
    onSent,
}: {
    conversation: Conversation;
    onSent: () => void;
}) {
    const [text, setText] = React.useState("");
    const [pending, start] = React.useTransition();

    return (
        <div className="flex min-h-0 flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="min-w-0">
                    <p className="truncate font-semibold">{conversation.nome}</p>
                    <p className="text-xs text-muted-foreground">{conversation.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                    {conversation.precisaHumano ? (
                        <Badge variant="outline" className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-300">
                            <UserRound className="h-3 w-3" /> Precisa de humano
                        </Badge>
                    ) : null}
                    {conversation.precisaHumano && conversation.lead_id ? (
                        <ReativarIaButton leadId={conversation.lead_id} onDone={onSent} />
                    ) : null}
                    {conversation.janelaAberta ? (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                            Janela 24h aberta
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="border-white/15 text-muted-foreground">
                            Fora da janela 24h
                        </Badge>
                    )}
                    {conversation.lead_id ? (
                        <Button asChild variant="ghost" size="icon" title="Abrir lead">
                            <Link href={`/app/leads/${conversation.lead_id}`}>
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </Button>
                    ) : null}
                </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {conversation.messages.map((m) => {
                    const out = m.direction === "out";
                    return (
                        <div key={m.id} className={out ? "flex justify-end" : "flex justify-start"}>
                            <div
                                className={
                                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm " +
                                    (out
                                        ? "rounded-br-sm bg-emerald-500/15 text-emerald-50"
                                        : "rounded-bl-sm bg-white/5 text-foreground")
                                }
                            >
                                <p className="whitespace-pre-wrap break-words">
                                    {m.body || (m.msg_type ? `[${m.msg_type}]` : "")}
                                </p>
                                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                                    <span>{fmt(m.created_at)}</span>
                                    {out ? <StatusIcon status={m.status} /> : null}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-white/10 p-3">
                {!conversation.janelaAberta && (
                    <p className="mb-2 text-[11px] text-amber-300/80">
                        Fora da janela de 24h: mensagem livre pode não ser entregue (exige template aprovado).
                    </p>
                )}
                <div className="flex gap-2">
                    <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Escreva uma resposta..."
                        disabled={!conversation.lead_id || pending}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                (e.currentTarget.nextElementSibling as HTMLButtonElement | null)?.click();
                            }
                        }}
                    />
                    <Button
                        className="gap-1.5"
                        disabled={!conversation.lead_id || pending}
                        onClick={() => {
                            const body = text.trim();
                            if (!body) return;
                            if (!conversation.lead_id) {
                                toast.error("Conversa sem lead vinculado.");
                                return;
                            }
                            start(async () => {
                                const res = await replyConversationAction(conversation.lead_id as string, body);
                                if (!res.ok) {
                                    toast.error(res.error || "Falha ao enviar.");
                                    return;
                                }
                                setText("");
                                toast.success("Enviado.");
                                onSent();
                            });
                        }}
                    >
                        <Send className="h-4 w-4" />
                        {pending ? "..." : "Enviar"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
