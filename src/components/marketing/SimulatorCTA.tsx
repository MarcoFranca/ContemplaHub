"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Home, Car, MessageCircle } from "lucide-react";
import { SectionFX } from "@/components/marketing/SectionFX";
import { BokehOrbs } from "@/components/marketing/BokehOrbs";
import { SweepHighlight } from "@/components/marketing/SweepHighlight";
import { useRouter } from "next/navigation";

export function SimulatorCTA() {
    const reduce = useReducedMotion();
    const router = useRouter();

    const box: Variants = {
        hidden: { opacity: 0, y: 14 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: reduce ? 0 : 0.55,
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: reduce ? 0 : 0.06,
            },
        },
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 10 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] },
        },
    };

    // WhatsApp com UTM + mensagem consultiva
    const waHref = (() => {
        const wa = new URL(
            `https://wa.me/${process.env.NEXT_PUBLIC_WA_PHONE ?? "5511999999999"}`
        );
        wa.searchParams.set(
            "text",
            "Olá! Quero simular meu consórcio (imobiliário/auto) e entender a melhor estratégia de lance."
        );
        wa.searchParams.set("utm_source", "lp_home");
        wa.searchParams.set("utm_medium", "cta_simulador");
        return wa.toString();
    })();

    return (
        <Section
            id="simular"
            aria-labelledby="simulador-title"
            className="relative isolate py-28 md:py-32 z-10"
        >
            {/* Fundo mesh + vinhetas (mantém o dark do jeito que estava; light fica neutro e legível) */}
            <SectionFX
                preset="mesh"
                variant="neutral"
                showGrid={false}
                showLines={false}
                className="dark:[--mesh-a:#0a1822] dark:[--mesh-b:#0d1e2b]"
            />

            {/* Fades/Overlays escuros: SOMENTE no dark (no light isso “suja” o branco) */}
            <div
                aria-hidden
                className="absolute -top-16 left-0 right-0 h-16 z-10 pointer-events-none hidden dark:block"
                style={{
                    background:
                        "linear-gradient(to bottom, rgba(2,6,23,0) 0%, rgba(2,6,23,0.35) 40%, rgba(0,0,0,1) 100%)",
                }}
            />

            <BokehOrbs />
            <SweepHighlight />

            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
                style={{
                    background:
                        "radial-gradient(120% 80% at 50% 40%, rgba(0,0,0,0.45) 0%, transparent 70%)",
                }}
            />

            {/* Card */}
            <motion.div
                variants={box}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px", amount: 0.4 }}
                className="relative mx-auto max-w-5xl"
            >
                <div
                    className="
            relative rounded-3xl p-8 md:p-10 backdrop-blur-md
            border border-border bg-background
            shadow-lg
            dark:border-white/10 dark:bg-white/[0.06]
            dark:shadow-[0_0_60px_rgba(16,185,129,0.06)]
          "
                >
                    <motion.div variants={item} className="text-center md:text-left">
                        <h3
                            id="simulador-title"
                            className="text-3xl font-semibold text-foreground md:text-4xl"
                        >
                            Planeje sua conquista com estratégia
                        </h3>
                        <p className="mt-2 text-muted-foreground md:text-lg">
                            Simule gratuitamente e descubra como transformar{" "}
                            <span className="text-emerald-600 dark:text-emerald-300">
                disciplina em patrimônio
              </span>{" "}
                            com método e previsibilidade.
                        </p>
                    </motion.div>

                    {/* botões */}
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 md:gap-6">
                        <motion.div
                            variants={item}
                            className="flex items-center justify-center sm:justify-start"
                        >
                            <Button
                                size="lg"
                                onClick={() => router.push("#diagnostico")}
                                className="
                  bg-emerald-500 text-black hover:bg-emerald-400
                  focus-visible:ring-2 focus-visible:ring-emerald-400
                  focus-visible:ring-offset-2 focus-visible:ring-offset-background
                  dark:focus-visible:ring-offset-slate-900
                "
                            >
                                <Home className="mr-2 h-5 w-5" />
                                Imobiliário
                            </Button>
                        </motion.div>

                        <motion.div
                            variants={item}
                            className="flex items-center justify-center sm:justify-start"
                        >
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => router.push("#diagnostico")}
                                className="
                  border-border text-foreground hover:bg-muted
                  focus-visible:ring-2 focus-visible:ring-emerald-400
                  focus-visible:ring-offset-2 focus-visible:ring-offset-background
                  dark:border-white/25 dark:text-slate-100 dark:hover:bg-white/10
                  dark:focus-visible:ring-offset-slate-900
                "
                            >
                                <Car className="mr-2 h-5 w-5" />
                                Automóvel
                            </Button>
                        </motion.div>
                    </div>

                    {/* CTA WhatsApp */}
                    <motion.div variants={item} className="mt-6">
                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-start">
                            <Button
                                asChild
                                size="lg"
                                variant="secondary"
                                className="
                  bg-muted text-foreground border border-border
                  hover:bg-muted/80
                  dark:bg-white/10 dark:hover:bg-white/15
                  dark:text-white dark:border-white/15
                "
                            >
                                <Link href={waHref} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="mr-2 h-5 w-5" />
                                    Simular pelo WhatsApp
                                </Link>
                            </Button>
                        </div>

                        <p className="mt-4 text-center text-xs text-muted-foreground md:text-left dark:text-slate-500">
                            Administradoras autorizadas pelo Banco Central. Sem promessas de
                            contemplação. LGPD e transparência em todas as etapas.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Fade inferior: SOMENTE no dark */}
            <div
                aria-hidden
                className="absolute -bottom-16 left-0 right-0 h-16 -z-10 pointer-events-none hidden dark:block"
                style={{
                    background:
                        "linear-gradient(to top, rgba(2,6,23,0) 0%, rgba(2,6,23,0.35) 40%, rgba(0,0,0,1) 100%)",
                }}
            />
        </Section>
    );
}
