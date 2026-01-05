"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "./Section";
import { HandCoins, ShieldCheck, LineChart, Target } from "lucide-react";
import { SectionFX } from "@/components/marketing/SectionFX";
import { cn } from "@/lib/utils";

const items = [
    {
        icon: HandCoins,
        title: "Construa patrimônio com método",
        text: "O consórcio é uma ferramenta de alavancagem patrimonial: você troca juros por disciplina e transforma o tempo em aliado.",
    },
    {
        icon: Target,
        title: "Planeje com estratégia",
        text: "Cada plano começa com um diagnóstico consultivo: definimos objetivo, prazo e tipo de lance de forma personalizada ao seu perfil.",
    },
    {
        icon: LineChart,
        title: "Previsibilidade real",
        text: "Simulações inteligentes e acompanhamento contínuo garantem clareza em cada etapa até a contemplação.",
    },
    {
        icon: ShieldCheck,
        title: "Segurança e transparência",
        text: "Administradoras autorizadas pelo Banco Central, curadoria Autentika e comunicação ética garantem previsibilidade e tranquilidade.",
    },
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
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export function Benefits() {
    return (
        <Section id="como-funciona" aria-labelledby="benefits-title" className="relative isolate">
            {/* FX de fundo dedicado da seção: light e dark */}
            <SectionFX variant="emerald" beamsTilt={-20} preset="aurora" />

            {/* Fade topo: light (claro) vs dark (escuro) */}
            <div
                aria-hidden
                className={cn(
                    "absolute top-0 left-0 right-0 h-16 -z-10 pointer-events-none",
                    "bg-gradient-to-t from-background/0 via-background/60 to-background"
                )}
            />

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
                    className="mt-6 text-balance text-3xl font-bold tracking-tight md:text-4xl text-foreground"
                >
                    <span>O jeito moderno de conquistar </span>
                    <span
                        className={cn(
                            "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent",
                            "dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400",
                            "[text-shadow:0_0_20px_rgba(16,185,129,0.14)] dark:[text-shadow:0_0_20px_rgba(16,185,129,0.18)]"
                        )}
                    >
            com segurança
          </span>
                    .
                </motion.h2>

                <motion.p
                    variants={item}
                    className={cn("mt-3 text-balance text-lg md:text-xl", "text-muted-foreground", "dark:text-slate-300/90")}
                >
                    Consórcio como estratégia de alavancagem patrimonial, método, previsibilidade e disciplina.
                </motion.p>
            </motion.div>

            <motion.div
                className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2, margin: "-60px" }}
                role="list"
            >
                {items.map((it, idx) => (
                    <motion.div key={it.title} variants={item} role="listitem" className="relative">
                        {/* Glow do card: bem mais leve no light */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-2xl"
                            style={{
                                background:
                                    idx % 2 === 0
                                        ? "radial-gradient(60% 60% at 50% 0%, rgba(16,185,129,0.14), transparent 62%)"
                                        : "radial-gradient(60% 60% at 50% 0%, rgba(20,184,166,0.12), transparent 62%)",
                                filter: "blur(18px)",
                                opacity: 0.55,
                            }}
                        />

                        <Card
                            className={cn(
                                "relative h-full border bg-card text-card-foreground",
                                "border-border shadow-sm",
                                "transition-all",
                                "hover:-translate-y-1 hover:shadow-[0_10px_34px_rgba(16,185,129,0.10)] hover:border-emerald-300/40",
                                "dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none",
                                "dark:hover:shadow-[0_8px_32px_rgba(16,185,129,0.15)] dark:hover:border-emerald-400/30"
                            )}
                        >
                            <CardHeader>
                                <div
                                    className={cn(
                                        "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl",
                                        "bg-emerald-600/10 ring-1 ring-emerald-500/20",
                                        "dark:bg-emerald-500/10 dark:ring-emerald-400/20"
                                    )}
                                >
                                    <it.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                                </div>
                                <CardTitle className="text-lg font-semibold text-foreground dark:text-white">
                                    {it.title}
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <p className={cn("text-sm leading-relaxed", "text-muted-foreground", "dark:text-slate-300/90")}>
                                    {it.text}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Fade inferior: light vs dark */}
            <div
                aria-hidden
                className={cn(
                    "absolute -bottom-16 left-0 right-0 h-16 -z-10 pointer-events-none",
                    "bg-gradient-to-b from-background/0 via-background/60 to-background"
                )}
            />
        </Section>
    );
}
