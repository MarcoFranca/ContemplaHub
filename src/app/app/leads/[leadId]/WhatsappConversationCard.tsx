import { MessageCircle, Check, CheckCheck, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type WhatsappMessage = {
    id: string;
    direction: "in" | "out";
    body: string | null;
    msg_type: string | null;
    status: string | null;
    phone: string | null;
    created_at: string | null;
};

function StatusIcon({ status }: { status: string | null }) {
    switch (status) {
        case "read":
            return <CheckCheck className="h-3 w-3 text-sky-400" aria-label="Lido" />;
        case "delivered":
            return <CheckCheck className="h-3 w-3 text-muted-foreground" aria-label="Entregue" />;
        case "sent":
            return <Check className="h-3 w-3 text-muted-foreground" aria-label="Enviado" />;
        case "failed":
            return <AlertTriangle className="h-3 w-3 text-rose-400" aria-label="Falhou" />;
        default:
            return <Clock className="h-3 w-3 text-muted-foreground" aria-label="Na fila" />;
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

export function WhatsappConversationCard({
    messages,
    janelaAberta,
}: {
    messages: WhatsappMessage[];
    janelaAberta: boolean;
}) {
    if (!messages.length) return null;

    return (
        <Card className="border-emerald-500/15">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-emerald-500" />
                        WhatsApp
                    </span>
                    {janelaAberta ? (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                            Janela de 24h aberta
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="border-white/15 text-muted-foreground">
                            Fora da janela de 24h
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                    {messages.map((m) => {
                        const out = m.direction === "out";
                        return (
                            <div key={m.id} className={out ? "flex justify-end" : "flex justify-start"}>
                                <div
                                    className={
                                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm " +
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
            </CardContent>
        </Card>
    );
}
