"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Section } from "@/components/marketing/Section";
import { SectionFX } from "@/components/marketing/SectionFX";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { LeadForm } from "./LeadForm";

type Props = {
    title?: string;
    subtitle?: string;
    waPhone?: string; // ex: "5511999999999"
    showAside?: boolean;
};

export function DiagnosticSection({
                                      title = "Quer saber qual plano combina com você?",
                                      subtitle = "Receba um diagnóstico consultivo pelo WhatsApp — estratégia com previsões responsáveis.",
                                      waPhone = process.env.NEXT_PUBLIC_WA_PHONE ?? "5511999999999",
                                      showAside = true,
                                  }: Props) {
    const [ok, setOk] = useState(false);

    // animações
    const container: Variants = useMemo(
        () => ({
            hidden: { opacity: 0, y: 16 },
            show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.06 },
            },
        }),
        []
    );
    const item: Variants = useMemo(
        () => ({
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
        }),
        []
    );

    // link WA pós-sucesso
    const wa = new URL(`https://wa.me/${waPhone}`);
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
                    {title}
                </motion.h2>
                <motion.p variants={item} className="mt-2 text-slate-200/90">
                    {subtitle}
                </motion.p>
                <motion.div
                    variants={item}
                    aria-hidden
                    className="mx-auto mt-4 h-[2px] w-20 rounded-full bg-gradient-to-r from-emerald-400/60 via-teal-300/50 to-emerald-400/60"
                />
            </motion.div>

            {/* grid: form (ou sucesso) + aside de confiança */}
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className={`mx-auto grid max-w-5xl gap-6 ${showAside ? "md:grid-cols-[1fr_0.9fr]" : "md:grid-cols-1"}`}
            >
                {!ok ? (
                    // formulário (reutilizável)
                    <motion.div
                        variants={item}
                        className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 md:p-8 backdrop-blur-md"
                    >
                        <LeadForm hash="autentika" onSuccess={() => setOk(true)} />
                    </motion.div>
                ) : (
                    // estado de sucesso
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

                {/* aside de confiança (opcional) */}
                {showAside && (
                    <motion.aside
                        variants={item}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
                    >
                        <h4 className="text-base font-semibold text-white">O que você recebe</h4>
                        <ul className="mt-3 space-y-2 text-sm text-slate-300">
                            <li className="inline-flex items-start gap-2">
                                <svg className="mt-[2px] h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z"/></svg>
                                Simulação comparativa e estratégia de lance
                            </li>
                            <li className="inline-flex items-start gap-2">
                                <svg className="mt-[2px] h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z"/></svg>
                                Janelas de assembleia e previsão responsável
                            </li>
                            <li className="inline-flex items-start gap-2">
                                <svg className="mt-[2px] h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z"/></svg>
                                Diagnóstico consultivo por WhatsApp
                            </li>
                        </ul>
                        <div aria-hidden className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
                        <p className="mt-4 text-xs text-slate-500">
                            Administradoras autorizadas pelo Banco Central. Sem promessas de contemplação.
                        </p>
                    </motion.aside>
                )}
            </motion.div>
        </Section>
    );
}
