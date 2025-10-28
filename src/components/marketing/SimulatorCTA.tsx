"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Home, Car, MessageCircle } from "lucide-react";
import { SectionFX } from "@/components/marketing/SectionFX";
import {BokehOrbs} from "@/components/marketing/BokehOrbs";
import {SweepHighlight} from "@/components/marketing/SweepHighlight";

export function SimulatorCTA() {
    const router = useRouter();
    const reduce = useReducedMotion();

    const box: Variants = {
        hidden: { opacity: 0, y: 14 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0 : 0.55, ease: [0.16, 1, 0.3, 1], staggerChildren: reduce ? 0 : 0.06 },
        },
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] } },
    };

    // WhatsApp com UTM + mensagem consultiva
    const wa = new URL(`https://wa.me/${process.env.NEXT_PUBLIC_WA_PHONE ?? "5511999999999"}`);
    wa.searchParams.set("text", "Olá! Quero simular meu consórcio com método (imobiliário/auto) e entender a melhor estratégia de lance.");
    wa.searchParams.set("utm_source", "lp_home");
    wa.searchParams.set("utm_medium", "cta_simulador");

    return (
        <Section
            id="simular"
            aria-labelledby="simulador-title"
            className="relative isolate py-28 md:py-32 z-10"
        >
            {/* Mesh continua, mas expandida e menos contraste */}
            <SectionFX
                preset="mesh"
                variant="neutral"
                showGrid={false}
                showLines={false}
                className="[--mesh-a:#0a1822] [--mesh-b:#0d1e2b]"
            />
            {/* Fade superior para costurar com o divider anterior */}
            <div
                aria-hidden
                className="absolute -top-16 left-0 right-0 h-16 z-10 pointer-events-none"
                style={{
                    background: "linear-gradient(to bottom, rgba(2,6,23,0) 0%, rgba(2,6,23,0.35) 40%, rgba(0,0,0,1) 100%)",
                }}
            />
            <BokehOrbs />
            <SweepHighlight />
            {/* nova vinheta geral para reforçar contraste do conteúdo */}

            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    background:
                        "radial-gradient(120% 80% at 50% 40%, rgba(0,0,0,0.45) 0%, transparent 70%)",
                }}
            />

            {/* Wrapper do card (um pouco maior e centralizado) */}
            <motion.div
                variants={box}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px", amount: 0.4 }}
                className="relative mx-auto max-w-5xl"
            >
                <div
                    className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-8 md:p-10 backdrop-blur-md shadow-[0_0_60px_rgba(16,185,129,0.06)]"
                >
                    <motion.div variants={item} className="text-center md:text-left">
                        <h3
                            id="simulador-title"
                            className="text-3xl font-semibold text-white md:text-4xl"
                        >
                            Planeje sua conquista com estratégia
                        </h3>
                        <p className="mt-2 text-slate-200 md:text-lg">
                            Simule gratuitamente e descubra como transformar{" "}
                            <span className="text-emerald-300">disciplina em patrimônio</span>{" "}
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
                                onClick={() => router.push("/simulador/imobiliario")}
                                className="bg-emerald-500 text-black hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
                                onClick={() => router.push("/simulador/auto")}
                                className="border-white/25 text-slate-100 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
                                className="bg-white/10 hover:bg-white/15 text-white border border-white/15"
                            >
                                <Link href={wa.toString()} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="mr-2 h-5 w-5" />
                                    Simular pelo WhatsApp
                                </Link>
                            </Button>
                        </div>

                        <p className="mt-4 text-center text-xs text-slate-500 md:text-left">
                            Administradoras autorizadas pelo Banco Central. Sem promessas de
                            contemplação. LGPD e transparência em todas as etapas.
                        </p>
                    </motion.div>
                </div>
            </motion.div>
            {/* Fade inferior para preparar o próximo divider */}
            <div
                aria-hidden
                className="absolute -bottom-16 left-0 right-0 h-16 -z-10 pointer-events-none"
                style={{
                    background: "linear-gradient(to top, rgba(2,6,23,0) 0%, rgba(2,6,23,0.35) 40%, rgba(0,0,0,1) 100%)",
                }}
            />
        </Section>
    );
}
