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
import { Info, CheckCircle2, MessageCircle } from "lucide-react";
import { SectionFX } from "@/components/marketing/SectionFX";
import Link from "next/link";

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
    website?: string; // honeypot
};

export function DiagnosticForm() {
    const reduce = useReducedMotion();
    const [pending, start] = useTransition();
    const [ok, setOk] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [consented, setConsented] = useState(false);

    // animações
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

    // pré-preenche UTM
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

    // helpers de formatação leve (sem libs)
    function maskPhone(v: string) {
        const d = v.replace(/\D+/g, "").slice(0, 11);
        if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        return d.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
    }
    function maskCurrency(v: string) {
        const d = v.replace(/\D+/g, "").slice(0, 12);
        if (!d) return "";
        const n = Number(d) / 100;
        return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
    }

    async function onSubmit(formData: FormData) {
        setErr(null);
        setOk(false);

        if (String(formData.get("website") || "").trim().length > 0) {
            setErr("Falha ao enviar. (HP)");
            return;
        }

        const rawPhone = String(formData.get("telefone") || "");
        const telefone = rawPhone.replace(/\D+/g, "");
        const rawCarta = String(formData.get("valor_carta") || "").replace(/\D+/g, "");
        const rawPrazo = String(formData.get("prazo_meses") || "").replace(/\D+/g, "");

        const payload: LeadPayload = {
            nome: String(formData.get("nome") || "").trim(),
            telefone,
            email: String(formData.get("email") || "").trim(),
            objetivo: String(formData.get("objetivo") || "").trim(),
            perfil_psico: String(formData.get("perfil_psico") || "").trim(),
            tipo: (String(formData.get("tipo") || "") as "imobiliario" | "auto") || undefined,
            valor_carta: rawCarta,
            prazo_meses: rawPrazo,
            observacoes: String(formData.get("observacoes") || "").trim(),
            consentimento: Boolean(formData.get("consentimento")),
            origem: "lp-home",
            utm_source: String(formData.get("utm_source") || ""),
            utm_medium: String(formData.get("utm_medium") || ""),
            utm_campaign: String(formData.get("utm_campaign") || ""),
            utm_term: String(formData.get("utm_term") || ""),
            utm_content: String(formData.get("utm_content") || ""),
            website: "",
        };

        if (!payload.nome || !payload.telefone || !payload.email) {
            setErr("Preencha nome, WhatsApp e e-mail.");
            return;
        }
        if (payload.telefone.length < 10) {
            setErr("WhatsApp inválido. Informe DDD + número.");
            return;
        }
        if (!payload.consentimento) {
            setErr("É necessário aceitar a Política de Privacidade.");
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

    // link WA pós-sucesso
    const wa = new URL(`https://wa.me/${process.env.NEXT_PUBLIC_WA_PHONE ?? "5511999999999"}`);
    wa.searchParams.set("text", "Olá! Preenchi o diagnóstico no site e quero avançar com meu plano de consórcio.");
    wa.searchParams.set("utm_source", "lp_home");
    wa.searchParams.set("utm_medium", "cta_diagnostic_success");

    return (
        <Section id="diagnostico" aria-labelledby="diagnostico-title" className="relative isolate overflow-hidden py-28 md:py-32">
            {/* FX: mesh neutro + vinheta para legibilidade */}
            <SectionFX preset="mesh" variant="neutral" showGrid={false} showLines={false} className="[--mesh-a:#0b1822] [--mesh-b:#101827]" />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{ background: "radial-gradient(120% 80% at 50% 40%, rgba(0,0,0,0.40) 0%, transparent 70%)" }}
            />

            {/* título */}
            <motion.div
                className="mx-auto mb-10 max-w-2xl text-center"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
            >
                <motion.h2 id="diagnostico-title" variants={item} className="text-3xl font-semibold md:text-4xl text-white">
                    Quer saber qual plano combina com você?
                </motion.h2>
                <motion.p variants={item} className="mt-2 text-slate-200/90">
                    Receba um diagnóstico consultivo pelo WhatsApp — estratégia com previsões responsáveis.
                </motion.p>
                <motion.div
                    variants={item}
                    aria-hidden
                    className="mx-auto mt-4 h-[2px] w-20 rounded-full bg-gradient-to-r from-emerald-400/60 via-teal-300/50 to-emerald-400/60"
                />
            </motion.div>

            {/* grid: form + confiança (em telas grandes) */}
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1fr_0.9fr]"
            >
                {/* FORM / SUCESSO */}
                {!ok ? (
                    <motion.form
                        variants={item}
                        className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-6 md:p-8 backdrop-blur-md"
                        onSubmit={(e) => {
                            e.preventDefault();
                            onSubmit(new FormData(e.currentTarget));
                        }}
                        noValidate
                    >
                        {/* Linha 1 */}
                        <div className="grid gap-6 md:grid-cols-2">
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
                                    onInput={(e) => (e.currentTarget.value = maskPhone(e.currentTarget.value))}
                                />
                            </div>
                        </div>

                        {/* Linha 2 */}
                        <div className="grid gap-6 md:grid-cols-2">
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
                        </div>

                        {/* Linha 3 */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="valor_carta">Valor da carta (R$)</Label>
                                <Input
                                    id="valor_carta"
                                    name="valor_carta"
                                    inputMode="numeric"
                                    placeholder="300.000"
                                    onInput={(e) => (e.currentTarget.value = maskCurrency(e.currentTarget.value))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="prazo_meses">Prazo (meses)</Label>
                                <Input id="prazo_meses" name="prazo_meses" inputMode="numeric" placeholder="180" />
                            </div>
                        </div>

                        {/* Linha 4 */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="objetivo">Objetivo em 1 frase</Label>
                                <Input id="objetivo" name="objetivo" placeholder="Ex.: primeira casa / renda com aluguel / upgrade do carro" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="perfil_psico">Seu perfil</Label>
                                <Input id="perfil_psico" name="perfil_psico" placeholder="Ex.: Disciplinado, Sonhador, Corporativo…" />
                            </div>
                        </div>

                        {/* Observações */}
                        <div className="grid gap-2">
                            <Label htmlFor="observacoes">Observações</Label>
                            <Textarea id="observacoes" name="observacoes" placeholder="Conte-nos mais sobre seu plano e momento de vida" />
                        </div>

                        {/* Honeypot e UTM */}
                        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                        <input type="hidden" name="utm_source" />
                        <input type="hidden" name="utm_medium" />
                        <input type="hidden" name="utm_campaign" />
                        <input type="hidden" name="utm_term" />
                        <input type="hidden" name="utm_content" />

                        {/* LGPD */}
                        <label className="mt-1 flex items-start gap-3 text-sm">
                            <Checkbox
                                id="consentimento"
                                name="consentimento"
                                required
                                checked={consented}
                                onCheckedChange={(v) => setConsented(Boolean(v))}
                            />
                            <span>
                Autorizo o contato da Autentika via WhatsApp e e-mail. Li e aceito a{" "}
                                <a href="/privacidade" className="underline">Política de Privacidade</a>. Não há promessa de contemplação; trabalhamos
                com estimativas responsáveis.
              </span>
                        </label>

                        {/* Botão + mensagens */}
                        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button type="submit" size="lg" disabled={pending || !consented} className="w-full sm:w-auto">
                                {pending ? "Enviando…" : "Receber meu diagnóstico"}
                            </Button>
                            <div className="min-h-[1.25rem]" aria-live="polite" aria-atomic="true">
                                {ok && <p className="text-sm text-emerald-500">Recebido! Vamos te chamar no WhatsApp 👋</p>}
                                {err && <p className="text-sm text-red-500">{err}</p>}
                            </div>
                        </div>

                        {/* Dica de segurança */}
                        <p className="mt-1 flex items-start gap-2 text-xs text-slate-500">
                            <Info className="mt-[2px] h-4 w-4 text-emerald-400" aria-hidden />
                            Seus dados são utilizados apenas para atendimento consultivo. Administradoras autorizadas pelo Banco Central (BACEN).
                        </p>
                    </motion.form>
                ) : (
                    // Estado de sucesso
                    <motion.div
                        variants={item}
                        className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-8 text-center backdrop-blur-md"
                    >
                        <CheckCircle2 className="h-10 w-10 text-emerald-400" aria-hidden />
                        <h3 className="text-2xl font-semibold text-white">Diagnóstico recebido!</h3>
                        <p className="max-w-md text-slate-200/90">
                            Em instantes um especialista vai te chamar no WhatsApp. Se preferir, pode adiantar por aqui:
                        </p>
                        <Button asChild size="lg" className="bg-emerald-500 text-black hover:bg-emerald-400">
                            <Link href={wa.toString()} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Falar agora no WhatsApp
                            </Link>
                        </Button>
                        <p className="text-[12px] text-slate-500">LGPD e transparência em todas as etapas.</p>
                    </motion.div>
                )}

                {/* Coluna lateral de confiança (só estética/conteúdo, sem distrair) */}
                <motion.aside
                    variants={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
                >
                    <h4 className="text-base font-semibold text-white">O que você recebe</h4>
                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                        <li className="inline-flex items-start gap-2">
                            <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-400" />
                            Simulação comparativa e estratégia de lance
                        </li>
                        <li className="inline-flex items-start gap-2">
                            <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-400" />
                            Janelas de assembleia e previsão responsável
                        </li>
                        <li className="inline-flex items-start gap-2">
                            <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-400" />
                            Diagnóstico consultivo por WhatsApp
                        </li>
                    </ul>
                    <div
                        aria-hidden
                        className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"
                    />
                    <p className="mt-4 text-xs text-slate-500">
                        Administradoras autorizadas pelo Banco Central. Sem promessas de contemplação.
                    </p>
                </motion.aside>
            </motion.div>
        </Section>
    );
}
