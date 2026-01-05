"use client";

import { motion, type Variants } from "framer-motion";
import { Section } from "./Section";
import {
    CheckCircle2,
    ShieldCheck,
    LineChart,
    MessagesSquare,
    ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const points = [
    {
        icon: MessagesSquare,
        title: "Consultoria personalizada",
        text: "Não vendemos tabela. Entendemos seu objetivo e perfil para definir prazo, aporte e tipo de lance com método.",
    },
    {
        icon: LineChart,
        title: "Previsão responsável",
        text: "Estimativas a partir de média histórica e sazonalidade do grupo — para guiar sua estratégia, sem promessas de contemplação.",
    },
    {
        icon: ClipboardCheck,
        title: "Acompanhamento até a carta",
        text: "Alertas de assembleia, janelas de lance e revisão de plano — do primeiro contato até a entrega da carta.",
    },
    {
        icon: ShieldCheck,
        title: "Segurança e transparência",
        text: "Administradoras autorizadas pelo Banco Central e curadoria Autentika. Comunicação ética e aderente à LGPD.",
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
            staggerChildren: 0.08,
        },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
};

/**
 * Fundo discreto e legível:
 * - Light: claro, premium, sem “sujar” o branco
 * - Dark: mantém o look original (vinheta mais escura)
 */
function CleanBackdrop({ className }: { className?: string }) {
    return (
        <div aria-hidden className={cn("absolute inset-0 -z-10 isolate", className)}>
            {/* LIGHT */}
            <div className="absolute inset-0 dark:hidden">
                {/* gradiente vertical suave (quase imperceptível) */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(16,185,129,0.06) 0%, rgba(255,255,255,0.00) 45%, rgba(16,185,129,0.04) 100%)",
                    }}
                />
                {/* vinheta CLARA (só para dar profundidade sem escurecer) */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(120% 80% at 50% 35%, rgba(15,23,42,0.06) 0%, transparent 70%)",
                    }}
                />
            </div>

            {/* DARK (mantém o comportamento anterior) */}
            <div className="absolute inset-0 hidden dark:block">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.00) 35%, rgba(255,255,255,0.02) 100%)",
                    }}
                />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(120% 80% at 50% 40%, rgba(0,0,0,0.38) 0%, transparent 70%)",
                    }}
                />
            </div>
        </div>
    );
}

export function WhyAutentika() {
    return (
        <Section
            aria-labelledby="why-title"
            className="relative isolate overflow-hidden py-28 md:py-32"
        >
            <CleanBackdrop />

            {/* container principal com animação */}
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="mx-auto max-w-3xl text-center"
            >
                <motion.h2
                    id="why-title"
                    variants={item}
                    className="text-3xl font-semibold md:text-4xl text-foreground dark:text-white"
                >
                    Mais que consórcio, uma estratégia de vida
                </motion.h2>

                <motion.div
                    variants={item}
                    aria-hidden
                    className="mx-auto mt-3 h-[2px] w-24 rounded-full bg-gradient-to-r from-emerald-500/50 via-teal-400/40 to-emerald-500/50 dark:from-emerald-400/60 dark:via-teal-300/50 dark:to-emerald-400/60"
                />

                <motion.p
                    variants={item}
                    className="mt-4 md:text-lg leading-relaxed text-muted-foreground dark:text-slate-200/90"
                >
                    Alavancagem patrimonial com método, previsibilidade e acompanhamento
                    humano.
                </motion.p>
            </motion.div>

            {/* Cards */}
            <motion.ul
                className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                role="list"
            >
                {points.map((p) => (
                    <motion.li
                        key={p.title}
                        variants={item}
                        role="listitem"
                        className={cn(
                            // BASE (LIGHT): card premium, sólido, bem legível
                            "rounded-2xl border border-border bg-card p-5 shadow-sm transition-all",
                            "hover:-translate-y-1 hover:shadow-[0_10px_36px_rgba(16,185,129,0.12)] hover:border-emerald-500/25",
                            // DARK: mantém a estética original
                            "dark:border-white/8 dark:bg-white/[0.035] dark:shadow-none dark:hover:border-emerald-400/25"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={cn(
                                    "mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                    "bg-emerald-500/10 ring-1 ring-emerald-500/20",
                                    "dark:bg-emerald-500/12 dark:ring-emerald-400/20"
                                )}
                            >
                                <p.icon
                                    className="h-5 w-5 text-emerald-600 dark:text-emerald-300"
                                    aria-hidden
                                />
                            </div>

                            <div>
                                <h3 className="text-base font-semibold text-foreground dark:text-white">
                                    {p.title}
                                </h3>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground dark:text-slate-300">
                                    {p.text}
                                </p>
                            </div>
                        </div>
                    </motion.li>
                ))}
            </motion.ul>

            {/* 3 passos */}
            <motion.ol
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="mx-auto mt-12 max-w-4xl list-none space-y-3 text-sm text-foreground/90 dark:text-slate-200"
                aria-label="Como funciona"
            >
                <motion.li variants={item} className="flex items-start gap-3">
                    <CheckCircle2
                        className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400"
                        aria-hidden
                    />
                    1) Diagnóstico consultivo: objetivo, prazo, perfil e capacidade de
                    aporte.
                </motion.li>

                <motion.li variants={item} className="flex items-start gap-3">
                    <CheckCircle2
                        className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400"
                        aria-hidden
                    />
                    2) Definição de estratégia: tipo de lance, janelas de assembleia e
                    simulação de cenários.
                </motion.li>

                <motion.li variants={item} className="flex items-start gap-3">
                    <CheckCircle2
                        className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400"
                        aria-hidden
                    />
                    3) Acompanhamento até a contemplação: alertas, revisão e orientação no
                    uso da carta.
                </motion.li>
            </motion.ol>

            {/* Compliance */}
            <motion.p
                variants={item}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                className="mx-auto mt-6 max-w-3xl text-center text-[12px] leading-relaxed text-muted-foreground dark:text-slate-500"
            >
                Estimativas de contemplação são projeções baseadas em histórico e
                sazonalidade. Não há garantia de contemplação.
            </motion.p>
        </Section>
    );
}
