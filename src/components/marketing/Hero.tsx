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
            {/* BG animado */}
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

            <Section
                className={cn(
                    "relative min-h-[100svh] flex flex-col items-center",
                    // default (telas normais)
                    "justify-center pt-24",
                    // RESPIRO GARANTIDO p/ ScrollCue (altura dele + margem)
                    "pb-[9.5rem]",
                    // telas baixas (laptop): não centraliza, reduz espaçamentos e fonte
                    "max-[820px]:justify-start max-[820px]:pt-20 max-[820px]:pb-[8.5rem]"
                )}
            >
                <motion.div
                    className="mx-auto w-full max-w-3xl text-center"
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
                        <span>Estratégia real, sem juros.</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={item}
                        className={cn(
                            "mt-6 text-balance font-bold tracking-tight text-foreground",
                            "text-4xl md:text-5xl",
                            // telas baixas: segura um pouco
                            "max-[820px]:text-[2.25rem] max-[820px]:leading-[1.05]"
                        )}
                    >
                        Pare de adiar a sua conquista.
                        <br />
                        <span className="text-emerald-500 dark:text-emerald-400">
              Use consórcio como estratégia,
            </span>{" "}
                        não como esperança.
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        variants={item}
                        className={cn(
                            "mt-4 text-balance text-lg md:text-xl",
                            "text-muted-foreground dark:text-slate-300",
                            "max-[820px]:text-base"
                        )}
                    >
                        Enquanto o banco cobra juros e o aluguel sobe, você precisa de um plano.
                        Aqui você recebe um <strong>diagnóstico consultivo</strong> para escolher o consórcio certo
                        (imóvel ou auto) e executar com previsibilidade.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        variants={item}
                        className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row max-[820px]:mt-6"
                    >
                        <motion.div whileHover={reduce ? {} : { y: -2 }} whileTap={reduce ? {} : { scale: 0.98 }} className="inline-flex">
                            <Button
                                size="lg"
                                onClick={() => router.push("#diagnostico")}
                                className={cn(
                                    "bg-emerald-500 text-black hover:bg-emerald-400",
                                    "focus-visible:ring-2 focus-visible:ring-emerald-400",
                                    "focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                )}
                            >
                                Quero meu diagnóstico agora
                            </Button>
                        </motion.div>

                        <motion.div whileTap={reduce ? {} : { scale: 0.98 }} className="inline-flex">
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
                                Ver como funciona (2 min)
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Observação curta */}
                    <motion.p
                        variants={item}
                        className="mt-3 text-[12px] text-muted-foreground/80 dark:text-slate-500"
                    >
                        Sem ligação indesejada. Você fala direto com um especialista pelo WhatsApp.
                    </motion.p>

                    {/* Disclaimer */}
                    <motion.p
                        variants={item}
                        className="mt-6 text-[11px] text-muted-foreground/70 dark:text-slate-500 text-center max-[820px]:mt-4"
                    >
                        Estimativas de contemplação são projeções baseadas em histórico e sazonalidade. Não há garantia de contemplação.
                    </motion.p>
                </motion.div>

                {/* ScrollCue com margem maior e “blindagem” contra overlap */}
                <ScrollCue
                    targetId="como-funciona"
                    className={cn(
                        // sobe um pouco em relação ao padrão
                        "bottom-6",
                        // em telas baixas, sobe mais ainda
                        "max-[820px]:bottom-4"
                    )}
                />
            </Section>
        </div>
    );
}
