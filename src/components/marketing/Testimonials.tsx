"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "./Section";
import { Quote } from "lucide-react";
import { SectionFX } from "@/components/marketing/SectionFX";

const depoimentos = [
    {
        name: "Thiago R.",
        text: "Consegui ser contemplado em menos de um ano com o plano estratégico da Autentika. Tudo foi calculado com base no histórico do grupo, nada de promessa, só método.",
    },
    {
        name: "Larissa M.",
        text: "Sempre tive receio de consórcio, mas o atendimento consultivo me mostrou como usar o consórcio para construir patrimônio de forma previsível e sem juros.",
    },
    {
        name: "Eduardo V.",
        text: "Paguei tranquilo, entendi cada assembleia e tive suporte em todas as etapas. Hoje recomendo a Autentika para amigos que querem investir com segurança.",
    },
];

const container: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
            staggerChildren: 0.1,
        },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
};

export function Testimonials() {
    return (
        <Section
            id="depoimentos"
            aria-labelledby="testimonials-title"
            className="relative isolate overflow-hidden py-28 md:py-32"
        >
            {/* Fundo: mantém estética no dark; no light deixa premium e legível */}
            <SectionFX preset="fineLines" variant="neutral" beamsTilt={-10} />

            {/* Halos: DARK (como estava) */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
                style={{
                    background:
                        "radial-gradient(60% 60% at 50% 40%, rgba(16,185,129,0.10), transparent 70%), radial-gradient(80% 50% at 90% 20%, rgba(56,189,248,0.06), transparent 80%)",
                }}
            />
            {/* Halos: LIGHT (mais claro, sem “lavar” o texto) */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 dark:hidden"
                style={{
                    background:
                        "radial-gradient(60% 60% at 50% 40%, rgba(16,185,129,0.08), transparent 70%), radial-gradient(80% 50% at 90% 20%, rgba(56,189,248,0.05), transparent 80%)",
                }}
            />

            {/* Título + subtítulo */}
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className="mx-auto mb-12 max-w-2xl text-center"
            >
                <motion.h2
                    variants={item}
                    id="testimonials-title"
                    className="text-3xl font-semibold md:text-4xl text-foreground dark:text-white"
                >
                    Histórias de quem conquistou com método
                </motion.h2>

                <motion.p
                    variants={item}
                    className="mt-3 md:text-lg text-muted-foreground dark:text-slate-200/90"
                >
                    Experiências reais de clientes que planejaram, executaram e conquistaram com estratégia.
                </motion.p>

                <motion.div
                    variants={item}
                    aria-hidden
                    className="mx-auto mt-4 h-[2px] w-20 rounded-full bg-gradient-to-r from-emerald-500/50 via-teal-400/40 to-emerald-500/50 dark:from-emerald-400/60 dark:via-teal-300/50 dark:to-emerald-400/60"
                />
            </motion.div>

            {/* Depoimentos */}
            <motion.div
                className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                role="list"
            >
                {depoimentos.map((d) => (
                    <motion.div key={d.name} variants={item} role="listitem" className="relative group">
                        {/* Halo atrás do card (ok nos dois temas) */}
                        <div
                            aria-hidden
                            className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                            style={{
                                background:
                                    "radial-gradient(70% 70% at 50% 0%, rgba(16,185,129,0.12), transparent 80%)",
                                filter: "blur(18px)",
                            }}
                        />

                        {/* Card: LIGHT usa tokens (bg-card/border-border/text), DARK mantém seu look */}
                        <Card
                            className="
                relative h-full
                border border-border bg-card shadow-sm
                transition-all
                hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(16,185,129,0.10)]
                dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none
                dark:hover:shadow-[0_12px_36px_rgba(16,185,129,0.12)]
                hover:border-emerald-500/30 dark:hover:border-emerald-400/30
              "
                        >
                            <CardContent className="relative px-6 pt-8 pb-6">
                                <Quote
                                    className="absolute left-5 top-5 h-5 w-5 text-emerald-600/70 dark:text-emerald-400 opacity-70"
                                    aria-hidden
                                />

                                <p className="mt-5 text-base leading-relaxed text-foreground/90 dark:text-white/90">
                                    “{d.text}”
                                </p>

                                <p className="mt-4 text-sm font-medium text-muted-foreground dark:text-slate-400">
                                    {d.name}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Compliance */}
            <motion.p
                variants={item}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                className="mx-auto mt-10 max-w-3xl text-center text-xs text-muted-foreground dark:text-slate-500"
            >
                Depoimentos verificados de clientes reais. Resultados podem variar conforme grupo e
                estratégia. Não há promessa de contemplação.
            </motion.p>
        </Section>
    );
}
