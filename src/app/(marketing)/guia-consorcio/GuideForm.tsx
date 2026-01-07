// app/(marketing)/guia-consorcio/GuideForm.tsx
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { submitGuideLead } from "./api";

export function GuideForm() {
    const sp = useSearchParams();
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");
    const [consent, setConsent] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [referrerUrl, setReferrerUrl] = useState<string>("");
    const [userAgent, setUserAgent] = useState<string>("");

    useEffect(() => {
        setReferrerUrl(document.referrer || "");
        setUserAgent(navigator.userAgent || "");
    }, []);

    const landingHash = useMemo(() => {
        // recomendado: /guia-consorcio?lp=<public_hash>
        return sp.get("lp") ?? "autentika";
    }, [sp]);

    const utm = useMemo(() => {
        const get = (k: string) => sp.get(k) ?? undefined;
        return {
            utm_source: get("utm_source"),
            utm_medium: get("utm_medium"),
            utm_campaign: get("utm_campaign"),
            utm_term: get("utm_term"),
            utm_content: get("utm_content"),
        };
    }, [sp]);

    return (
        <form
            className="mt-6 grid gap-3"
            onSubmit={(e) => {
                e.preventDefault();
                setErrorMsg(null);

                startTransition(async () => {
                    try {
                        if (!consent) return;

                        const { lead_id } = await submitGuideLead({
                            landing_hash: landingHash,
                            nome,
                            telefone,
                            email: email || undefined,
                            consentimento: true,
                            consent_scope: "guia_estrategico_consorcio",
                            referrer_url: referrerUrl || undefined,
                            user_agent: userAgent || undefined,
                            ...utm,
                        });

                        router.push(`/guia-consorcio/obrigado?lead=${lead_id}`);
                    } catch (err: any) {
                        setErrorMsg(err?.message ?? "Não foi possível enviar seus dados. Tente novamente.");
                    }
                });
            }}
        >
            <Input placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <Input
                placeholder="WhatsApp (com DDD)"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
            />
            <Input placeholder="E-mail (opcional)" value={email} onChange={(e) => setEmail(e.target.value)} />

            <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <Checkbox checked={consent} onCheckedChange={(v) => setConsent(Boolean(v))} />
                <span>
          Aceito receber o material e contato sobre consórcio. Consentimento conforme LGPD. Sem promessas de contemplação.
        </span>
            </label>

            {errorMsg ? <p className="text-sm text-destructive">{errorMsg}</p> : null}

            <Button type="submit" size="lg" disabled={pending || !consent}>
                {pending ? "Enviando..." : "Receber e baixar o guia"}
            </Button>

            <p className="text-xs text-muted-foreground">
                Material gratuito e educativo. Envio apenas mediante consentimento (LGPD). Não contém promessa de contemplação.
            </p>
        </form>
    );
}
