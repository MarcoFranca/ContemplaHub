"use client";

import { motion, type Variants, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "./Section";
import { HandCoins, ShieldCheck, LineChart, Target } from "lucide-react";
import { SectionFX } from "@/components/marketing/SectionFX";

const items = [
    { icon: HandCoins, title: "Construa patrimônio com método", text: "O consórcio é uma ferramenta de alavancagem patrimonial, você troca juros por disciplina e transforma o tempo em aliado." },
    { icon: Target, title: "Planeje com estratégia", text: "Cada plano começa com um diagnóstico consultivo: definimos objetivo, prazo e tipo de lance de forma personalizada ao seu perfil." },
    { icon: LineChart, title: "Previsibilidade real", text: "Simulações inteligentes e acompanhamento contínuo garantem clareza em cada etapa até a contemplação." },
    { icon: ShieldCheck, title: "Segurança e transparência", text: "Administradoras autorizadas pelo Banco Central, curadoria Autentika e comunicação ética garantem previsibilidade e tranquilidade." },
];

const container: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.08 },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
};

export function Benefits() {

    return (
        <Section id="como-funciona" aria-labelledby="benefits-title" className="relative isolate">
            {/* FX de fundo dedicado da seção */}
            <SectionFX variant="emerald" beamsTilt={-20} />

            {/* topo com fade para “colar” no divider acima */}
            <div
                aria-hidden
                className="absolute top-0 left-0 right-0 h-16 -z-10"
                style={{
                    background:
                        "linear-gradient(to top, rgba(2,6,23,0) 0%, rgba(2,6,23,0.35) 30%, rgba(0,0,0,1) 100%)",
                }}
            />

            {/* ⬇️ CONTAINER DE ANIMAÇÃO PARA O TÍTULO + SUB */}
            <motion.div
                className="relative mx-auto mb-10 max-w-2xl text-center"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.35, margin: "-80px" }}
            >
                <motion.h2
                    id="benefits-title"
                    variants={item}
                    className="mt-6 text-balance text-3xl font-bold tracking-tight md:text-4xl"
                >
                    <span>O jeito moderno de conquistar </span>
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent [text-shadow:0_0_20px_rgba(16,185,129,0.18)]">
            com segurança
          </span>
                    .
                </motion.h2>

                <motion.p
                    variants={item}
                    className="mt-3 text-balance text-lg text-slate-300/90 md:text-xl"
                >
                    Consórcio como estratégia de alavancagem patrimonial, método, previsibilidade e
                    disciplina.
                </motion.p>
            </motion.div>
            {/* ⬆️ sem esse container, os variants não “disparam” nos textos */}

            <motion.div
                className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-2"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2, margin: "-60px" }}
                role="list"
            >
                {items.map((it) => (
                    <motion.div key={it.title} variants={item} role="listitem" className="relative">
                        {/* borda luminosa suave (coerente com o BG) */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-2xl"
                            style={{
                                background:
                                    "radial-gradient(60% 60% at 50% 0%, rgba(16,185,129,0.18), transparent 60%)",
                                filter: "blur(18px)",
                                opacity: 0.6,
                            }}
                        />
                        <Card className="relative h-full border-white/10 bg-white/[0.04] backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(16,185,129,0.15)] hover:border-emerald-400/30">
                            <CardHeader>
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/20">
                                    <it.icon className="h-5 w-5 text-emerald-300" />
                                </div>
                                <CardTitle className="text-lg font-semibold text-white">{it.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-300/90 leading-relaxed">{it.text}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* rodapé com fade para preparar o próximo divider */}
            {/* Fade inferior para preparar o próximo divider */}
            <div
                aria-hidden
                className="absolute -bottom-16 left-0 right-0 h-16 -z-10 pointer-events-none"
                style={{
                    background: "linear-gradient(to top, rgba(2,6,23,0) 0%, rgba(2,6,23,0.35) 40%, rgba(2,6,23,1) 100%)",
                }}
            />
        </Section>
    );
}
