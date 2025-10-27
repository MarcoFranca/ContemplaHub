"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Section } from "./Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Info } from "lucide-react";

type LeadPayload = {
    nome: string;
    telefone: string;
    email: string;
    objetivo?: string;
    perfil_psico?: string;
    tipo?: "imobiliario" | "auto";
    valor_carta?: string;
    prazo_meses?: string;
    observacoes?: string;
    consentimento: boolean;
    origem: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    // honeypot
    website?: string;
};

export function DiagnosticForm() {
    const reduce = useReducedMotion();
    const [pending, start] = useTransition();
    const [ok, setOk] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // animações suaves
    const container: Variants = useMemo(
        () => ({
            hidden: { opacity: 0, y: 16 },
            show: {
                opacity: 1,
                y: 0,
                transition: { duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: reduce ? 0 : 0.06 },
            },
        }),
        [reduce]
    );
    const item: Variants = useMemo(
        () => ({
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] } },
        }),
        [reduce]
    );

    // pré-preenche UTM (caso existam na URL)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const utmFields = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
        for (const k of utmFields) {
            const v = params.get(k);
            if (v) {
                const el = document.querySelector<HTMLInputElement>(`input[name="${k}"]`);
                if (el) el.value = v;
            }
        }
    }, []);

    async function onSubmit(formData: FormData) {
        setErr(null);
        setOk(false);

        // honeypot: se o campo "website" vier preenchido, bloquear
        if (String(formData.get("website") || "").trim().length > 0) {
            setErr("Falha ao enviar. (HP)");
            return;
        }

        // telefone: sanitiza apenas dígitos
        const rawPhone = String(formData.get("telefone") || "");
        const telefone = rawPhone.replace(/\D+/g, "");

        // payload
        const payload: LeadPayload = {
            nome: String(formData.get("nome") || "").trim(),
            telefone,
            email: String(formData.get("email") || "").trim(),
            objetivo: String(formData.get("objetivo") || "").trim(),
            perfil_psico: String(formData.get("perfil_psico") || "").trim(),
            tipo: (String(formData.get("tipo") || "") as "imobiliario" | "auto") || undefined,
            valor_carta: String(formData.get("valor_carta") || "").replace(/\D+/g, ""), // só dígitos
            prazo_meses: String(formData.get("prazo_meses") || "").replace(/\D+/g, ""),
            observacoes: String(formData.get("observacoes") || "").trim(),
            consentimento: Boolean(formData.get("consentimento")),
            origem: "lp-home",
            utm_source: String(formData.get("utm_source") || ""),
            utm_medium: String(formData.get("utm_medium") || ""),
            utm_campaign: String(formData.get("utm_campaign") || ""),
            utm_term: String(formData.get("utm_term") || ""),
            utm_content: String(formData.get("utm_content") || ""),
            website: "", // honeypot sempre em branco no submit
        };

        // validações mínimas no client
        if (!payload.nome || !payload.telefone || !payload.email) {
            setErr("Preencha nome, WhatsApp e e-mail.");
            return;
        }
        // telefone BR curto (<10 dígitos) não serve
        if (payload.telefone.length < 10) {
            setErr("WhatsApp inválido. Informe DDD + número.");
            return;
        }

        start(async () => {
            try {
                const res = await fetch("/api/leads", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setErr(data?.error ?? "Falha ao enviar. Tente novamente.");
                    return;
                }
                setOk(true);
            } catch {
                setErr("Falha de conexão. Tente novamente.");
            }
        });
    }

    return (
        <Section id="diagnostico" aria-labelledby="diagnostico-title">
            <motion.div
                className="mx-auto mb-8 max-w-2xl text-center"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
            >
                <motion.h2
                    id="diagnostico-title"
                    variants={item}
                    className="text-3xl font-semibold md:text-4xl text-white"
                >
                    Quer saber qual plano combina com você?
                </motion.h2>
                <motion.p variants={item} className="mt-2 text-slate-400">
                    Receba um diagnóstico consultivo pelo WhatsApp, estratégia de alavancagem patrimonial com previsões responsáveis.
                </motion.p>
            </motion.div>

            <motion.form
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="mx-auto grid max-w-2xl gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8 backdrop-blur-sm"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(new FormData(e.currentTarget));
                }}
                noValidate
            >
                {/* Linha 1 */}
                <motion.div variants={item} className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" name="nome" placeholder="Seu nome" required autoComplete="name" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="telefone">WhatsApp</Label>
                        <Input
                            id="telefone"
                            name="telefone"
                            placeholder="(11) 9 9999-9999"
                            required
                            inputMode="tel"
                            autoComplete="tel"
                        />
                    </div>
                </motion.div>

                {/* Linha 2 */}
                <motion.div variants={item} className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" name="email" type="email" placeholder="voce@email.com" required autoComplete="email" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tipo">Tipo de consórcio</Label>
                        <Select name="tipo" defaultValue="imobiliario">
                            <SelectTrigger id="tipo">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="imobiliario">Imobiliário</SelectItem>
                                <SelectItem value="auto">Automóvel</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

                {/* Linha 3 */}
                <motion.div variants={item} className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="valor_carta">Valor da carta (R$)</Label>
                        <Input id="valor_carta" name="valor_carta" inputMode="numeric" placeholder="300000" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="prazo_meses">Prazo (meses)</Label>
                        <Input id="prazo_meses" name="prazo_meses" inputMode="numeric" placeholder="180" />
                    </div>
                </motion.div>

                {/* Linha 4 */}
                <motion.div variants={item} className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="objetivo">Objetivo em 1 frase</Label>
                        <Input id="objetivo" name="objetivo" placeholder="Ex.: primeira casa / renda com aluguel / upgrade do carro" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="perfil_psico">Seu perfil</Label>
                        <Input id="perfil_psico" name="perfil_psico" placeholder="Ex.: Disciplinado, Sonhador, Corporativo…" />
                    </div>
                </motion.div>

                {/* Observações */}
                <motion.div variants={item} className="grid gap-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea id="observacoes" name="observacoes" placeholder="Conte-nos mais sobre seu plano e momento de vida" />
                </motion.div>

                {/* Honeypot invisível */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                {/* UTM */}
                <input type="hidden" name="utm_source" />
                <input type="hidden" name="utm_medium" />
                <input type="hidden" name="utm_campaign" />
                <input type="hidden" name="utm_term" />
                <input type="hidden" name="utm_content" />

                {/* Termo LGPD */}
                <motion.label variants={item} className="mt-1 flex items-start gap-3 text-sm">
                    <Checkbox id="consentimento" name="consentimento" required />
                    <span>
            Autorizo o contato da Autentika via WhatsApp e e-mail. Li e aceito a{" "}
                        <a href="/privacidade" className="underline">
              Política de Privacidade
            </a>
            . Não há promessa de contemplação; trabalhamos com estimativas responsáveis.
          </span>
                </motion.label>

                {/* Botão + mensagens */}
                <motion.div variants={item} className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
                        {pending ? "Enviando…" : "Receber meu diagnóstico"}
                    </Button>

                    {/* mensagens com aria-live */}
                    <div className="min-h-[1.25rem]" aria-live="polite" aria-atomic="true">
                        {ok && <p className="text-sm text-emerald-500">Recebido! Vamos te chamar no WhatsApp 👋</p>}
                        {err && <p className="text-sm text-red-500">{err}</p>}
                    </div>
                </motion.div>

                {/* Dica de segurança/compliance */}
                <motion.p variants={item} className="mt-1 flex items-start gap-2 text-xs text-slate-500">
                    <Info className="mt-[2px] h-4 w-4 text-emerald-400" aria-hidden />
                    Seus dados são utilizados apenas para atendimento consultivo. Administradoras autorizadas pelo Banco Central (BACEN).
                </motion.p>
            </motion.form>
        </Section>
    );
}
