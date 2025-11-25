"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, MessageCircle } from "lucide-react";
import { toast } from "sonner";

type Props = {
    publicHash: string;
    clienteNome?: string | null;
    phone?: string | null;
};

function buildWhatsAppLink(phone: string, text: string) {
    const digits = phone.replace(/\D/g, "");
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${digits}?text=${encodedText}`;
}

export function ShareProposalActions({ publicHash, clienteNome, phone }: Props) {
    const [url, setUrl] = React.useState("");

    React.useEffect(() => {
        // origem do front (localhost, vercel, etc.)
        const origin =
            typeof window !== "undefined"
                ? window.location.origin
                : process.env.NEXT_PUBLIC_APP_URL || "";

        setUrl(`${origin}/propostas/${publicHash}`);
    }, [publicHash]);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copiado", {
                description: "Cole no WhatsApp ou e-mail para enviar ao cliente.",
            });
        } catch (e) {
            console.error(e);
            toast.error("Não foi possível copiar o link");
        }
    }

    const waText =
        `Oi${clienteNome ? `, ${clienteNome}` : ""}! ` +
        `Preparei sua proposta de consórcio. ` +
        `Você pode ver todos os detalhes neste link:\n\n${url}`;

    const waLink = phone ? buildWhatsAppLink(phone, waText) : null;

    return (
        <div className="mt-4 flex flex-col gap-2 rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm">
      <span className="text-xs text-slate-400">
        Link público da proposta
      </span>

            <div className="flex gap-2">
                <Input
                    readOnly
                    value={url}
                    className="text-xs"
                    onFocus={(e) => e.currentTarget.select()}
                />
                <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                </Button>
                {waLink && (
                    <Button
                        type="button"
                        size="icon"
                        asChild
                        className="bg-emerald-600 hover:bg-emerald-500"
                    >
                        <a href={waLink} target="_blank" rel="noreferrer">
                            <MessageCircle className="h-4 w-4" />
                        </a>
                    </Button>
                )}
            </div>

            {!phone && (
                <p className="text-[11px] text-slate-500">
                    Preencha o telefone no cadastro do lead para liberar o atalho direto
                    para WhatsApp.
                </p>
            )}
        </div>
    );
}
