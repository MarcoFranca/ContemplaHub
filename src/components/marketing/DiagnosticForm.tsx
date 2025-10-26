// ============================
// FILE: components/marketing/DiagnosticForm.tsx
// ============================
"use client";
import { useState, useTransition } from "react";
import { Section } from "./Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";


export function DiagnosticForm() {
    const [pending, start] = useTransition();
    const [ok, setOk] = useState(false);
    const [err, setErr] = useState<string | null>(null);


    async function onSubmit(formData: FormData) {
        setErr(null);
        setOk(false);
        start(async () => {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: String(formData.get("nome") || ""),
                    telefone: String(formData.get("telefone") || ""),
                    email: String(formData.get("email") || ""),
                    objetivo: String(formData.get("objetivo") || ""),
                    perfil_psico: String(formData.get("perfil_psico") || ""),
                    consentimento: Boolean(formData.get("consentimento")),
                    origem: "lp-home",
                    utm_source: String((formData.get("utm_source") || "") as string),
                    utm_campaign: String((formData.get("utm_campaign") || "") as string),
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setErr(data?.error ?? "Falha ao enviar. Tente novamente.");
                return;
            }
            setOk(true);
        });
    }


    return (
        <Section id="diagnostico">
            <div className="mx-auto mb-8 max-w-2xl text-center">
                <h2 className="text-3xl font-semibold md:text-4xl">Quer saber qual plano combina com você?</h2>
                <p className="mt-2 text-muted-foreground">Receba um diagnóstico consultivo pelo WhatsApp com estratégia de contemplação.</p>
            </div>


            <form
                className="mx-auto grid max-w-2xl gap-4 rounded-2xl border bg-card p-6 md:p-8"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(new FormData(e.currentTarget));
                }}
            >
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" name="nome" placeholder="Seu nome" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="telefone">WhatsApp</Label>
                        <Input id="telefone" name="telefone" placeholder="(11) 9 9999-9999" required />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="objetivo">Objetivo</Label>
                        <Input id="objetivo" name="objetivo" placeholder="Ex.: Casa, carro, investimento" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="perfil_psico">Seu perfil</Label>
                        <Input id="perfil_psico" name="perfil_psico" placeholder="Ex.: Disciplinado, Sonhador, Corporativo…" />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea id="observacoes" name="observacoes" placeholder="Conte-nos mais sobre seu objetivo" />
                </div>


                {/* UTM (preenchidos via script simples se desejar) */}
                <input type="hidden" name="utm_source" />
                <input type="hidden" name="utm_campaign" />


                <label className="mt-1 flex items-start gap-3 text-sm">
                    <Checkbox id="consentimento" name="consentimento" required />
                    <span>
Autorizo o contato da Autentika via WhatsApp e e-mail. Li e aceito a
<a href="/privacidade" className="ml-1 underline">Política de Privacidade</a>.
</span>
                </label>


                <div className="mt-2 flex gap-3">
                    <Button type="submit" size="lg" disabled={pending}>
                        {pending ? "Enviando…" : "Receber meu diagnóstico"}
                    </Button>
                    {ok && <p className="self-center text-sm text-emerald-600">Recebido! Vamos te chamar no WhatsApp 👋</p>}
                    {err && <p className="self-center text-sm text-red-600">{err}</p>}
                </div>
            </form>
        </Section>
    );
}
