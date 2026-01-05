"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ScrollCue } from "@/components/marketing/ScrollCue";
import { cn } from "@/lib/utils";

const container: Variants = {
    hidden: { opacity: 0, y: 10 },
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
    hidden: { opacity: 0, y: 14 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
};

export function Hero() {
    const router = useRouter();
    const reduce = useReducedMotion();

    return (
        <div className="relative isolate overflow-hidden">
            {/* BG animado – funciona em light/dark */}
            <motion.div
                aria-hidden
                className={cn(
                    "absolute inset-0 -z-10",
                    "bg-[radial-gradient(80%_60%_at_50%_0%,rgba(16,185,129,0.18),rgba(16,185,129,0.06)_40%,transparent_70%)]",
                    "dark:bg-[radial-gradient(80%_60%_at_50%_0%,rgba(16,185,129,0.24),rgba(16,185,129,0.08)_40%,transparent_70%)]"
                )}
                animate={reduce ? {} : { opacity: [0.9, 1, 0.9], scale: [1, 1.03, 1] }}
                transition={reduce ? {} : { duration: 12, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
            />

            <motion.div
                aria-hidden
                className={cn(
                    "pointer-events-none absolute inset-0 -z-10",
                    "bg-[radial-gradient(40%_30%_at_50%_45%,rgba(16,185,129,0.08),transparent_60%)]",
                    "dark:bg-[radial-gradient(40%_30%_at_50%_45%,rgba(16,185,129,0.18),transparent_60%)]"
                )}
                animate={reduce ? {} : { opacity: [0.6, 0.8, 0.6], y: [0, -6, 0] }}
                transition={reduce ? {} : { duration: 10, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
            />

            {/* grade de pontos só no dark */}
            <div
                aria-hidden
                className={cn(
                    "pointer-events-none absolute inset-0 -z-10 opacity-[0.06]",
                    "[background-image:radial-gradient(rgba(15,23,42,0.25)_1px,transparent_1px)]",
                    "[background-size:12px_12px]",
                    "dark:[background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)]"
                )}
            />

            <Section className="relative min-h-[100svh] flex flex-col items-center justify-center pt-24 pb-28">
                <motion.div
                    className="mx-auto max-w-3xl text-center"
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-80px" }}
                >
                    {/* Selo superior */}
                    <motion.div
                        variants={item}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs md:text-sm backdrop-blur",
                            "border border-emerald-500/20 bg-emerald-50/80 text-emerald-800 shadow-sm",
                            "dark:border-white/15 dark:bg-white/5 dark:text-slate-300 dark:shadow-none"
                        )}
                    >
                        <span className="font-medium">Autentika Corretora</span>
                        <span aria-hidden>•</span>
                        <span>Planeje hoje, conquiste sempre.</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={item}
                        className={cn(
                            "mt-6 text-balance font-bold tracking-tight text-foreground",
                            "text-4xl md:text-5xl"
                        )}
                    >
                        Já reparou como a vida anda… Mas a sua conquista sempre fica para depois?
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        variants={item}
                        className={cn(
                            "mt-4 text-balance text-lg md:text-xl",
                            "text-muted-foreground dark:text-slate-300"
                        )}
                    >
                        Não é falta de vontade. É o aluguel subindo, é o banco te prendendo nos juros, é o
                        “quando der eu resolvo” que te afasta do que é seu.
                        <br className="hidden sm:block" />
                        Mas quando você muda a estratégia, sua vida começa a avançar de verdade.
                        <br />
                        <br />
                        Com método, zero juros e um plano claro, o consórcio coloca você de volta no caminho da
                        casa própria — com segurança e previsibilidade.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={item} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="inline-flex">
                            <Button
                                size="lg"
                                onClick={() => router.push("#diagnostico")}
                                className={cn(
                                    "bg-emerald-500 text-black hover:bg-emerald-400",
                                    "focus-visible:ring-2 focus-visible:ring-emerald-400",
                                    "focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                )}
                            >
                                Quero meu plano sem juros
                            </Button>
                        </motion.div>

                        <motion.div whileTap={{ scale: 0.98 }} className="inline-flex">
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => router.push("#como-funciona")}
                                className={cn(
                                    "border-border text-foreground hover:bg-muted",
                                    "dark:border-white/20 dark:text-slate-100 dark:hover:bg-white/10",
                                    "focus-visible:ring-2 focus-visible:ring-emerald-400",
                                    "focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                )}
                            >
                                Como funciona na prática?
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Prova social */}
                    <motion.div
                        variants={item}
                        className={cn(
                            "mt-6 flex flex-wrap items-center justify-center gap-3 text-xs",
                            "text-muted-foreground dark:text-slate-400"
                        )}
                    >
                        <span>10 anos de experiência</span>
                        <span aria-hidden className="hidden sm:inline">•</span>
                        <span>Reconhecido pela Porto Seguro</span>
                        <span aria-hidden className="hidden sm:inline">•</span>
                        <span>Administradoras autorizadas pelo BACEN</span>
                    </motion.div>

                    {/* Disclaimer */}
                    <motion.p
                        variants={item}
                        className="mt-3 text-[11px] text-muted-foreground/80 dark:text-slate-500 text-center"
                    >
                        Estimativas de contemplação são projeções, sem garantia de resultados.
                    </motion.p>
                </motion.div>

                <ScrollCue targetId="como-funciona" />
            </Section>
        </div>
    );
}
