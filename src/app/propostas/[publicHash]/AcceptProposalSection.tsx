// src/app/propostas/[publicHash]/AcceptProposalSection.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type Props = {
    publicHash: string;
    clienteNome?: string | null;
};

export function AcceptProposalSection({ publicHash, clienteNome }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [consent, setConsent] = useState(false);

    async function handleAccept() {
        if (!consent) {
            toast.error("Confirme que está de acordo em seguir com esta proposta.");
            return;
        }

        try {
            setIsSubmitting(true);
            toast.loading("Registrando seu interesse...");

            const res = await fetch(`/api/propostas/${publicHash}/accept`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    source: "public_proposal_page",
                    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
                    ip: null, // se quiser depois podemos preencher isso via backend
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Erro ao aceitar proposta:", text);
                throw new Error();
            }

            const data = await res.json();

            toast.dismiss();

            // se o backend mandou o link do cadastro, redireciona o cliente pra lá
            if (data.cadastro_url) {
                window.location.href = data.cadastro_url;
                return;
            }

            // fallback (se por algum motivo não veio o link)
            toast.success("Proposta confirmada!", {
                description:
                    "Nossa equipe vai entrar em contato para os próximos passos de formalização.",
            });
        } catch (err) {
            console.error(err);
            toast.dismiss();
            toast.error(
                "Não foi possível registrar o aceite agora. Tente novamente em instantes."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="mt-3 space-y-3 rounded-lg border border-emerald-500/30 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-200">
                {clienteNome ? `${clienteNome}, ` : ""}se este plano faz sentido para você,
                você pode confirmar abaixo que deseja seguir com esta proposta.
            </p>

            <div className="flex items-start gap-2 text-xs text-slate-300">
                <Checkbox
                    id="accept-proposal"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(Boolean(checked))}
                    className="mt-[2px]"
                />
                <label htmlFor="accept-proposal" className="cursor-pointer">
                    Li e estou de acordo em seguir com esta proposta para os próximos
                    passos de contratação. Entendo que a formalização final ocorrerá
                    por meio de contrato específico com a administradora do consórcio.
                </label>
            </div>

            <Button
                type="button"
                onClick={handleAccept}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-xs sm:text-sm"
            >
                {isSubmitting ? "Enviando..." : "Quero seguir com esta proposta"}
            </Button>

            <p className="text-[10px] text-slate-500">
                Seus dados serão utilizados apenas para contato sobre esta proposta,
                conforme nossa política de privacidade.
            </p>
        </div>
    );
}
