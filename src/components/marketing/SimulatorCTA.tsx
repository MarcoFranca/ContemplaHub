"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Home, Car, MessageCircle } from "lucide-react";

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
        <Section id="simular" aria-labelledby="simulador-title" className="relative">
            {/* Glow sutil integrado à paleta */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(16,185,129,0.12),transparent_60%)]"
            />

            <motion.div
                className="mx-auto grid max-w-4xl items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm md:grid-cols-[1fr_auto_auto] md:p-8"
                variants={box}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
            >
                <motion.div variants={item}>
                    <h3 id="simulador-title" className="text-2xl font-semibold text-white md:text-3xl">
                        Simule agora com estratégia
                    </h3>
                    <p className="mt-1 text-slate-400">
                        Definimos objetivo, prazo e tipo de lance para <span className="text-white">alavancar seu patrimônio</span> com previsibilidade.
                    </p>
                </motion.div>

                {/* Botões: animamos o wrapper para evitar nested button */}
                <motion.div variants={item} className="flex w-full items-center justify-center">
                    <div className="inline-flex">
                        <Button
                            size="lg"
                            onClick={() => router.push("/simulador/imobiliario")}
                            className="bg-emerald-500 text-black hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                        >
                            <Home className="mr-2 h-5 w-5" />
                            Imobiliário
                        </Button>
                    </div>
                </motion.div>

                <motion.div variants={item} className="flex w-full items-center justify-center">
                    <div className="inline-flex">
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => router.push("/simulador/auto")}
                            className="border-white/20 text-slate-100 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                        >
                            <Car className="mr-2 h-5 w-5" />
                            Automóvel
                        </Button>
                    </div>
                </motion.div>

                {/* Linha extra (mobile-first): CTA WhatsApp abaixo dos 2 botões em telas menores */}
                <motion.div variants={item} className="md:col-span-3">
                    <div className="mt-2 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button asChild size="lg" variant="secondary" className="bg-white/10 hover:bg-white/15 text-white">
                            <Link href={wa.toString()} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Simular pelo WhatsApp
                            </Link>
                        </Button>
                    </div>

                    {/* Nota de compliance */}
                    <p className="mt-3 text-center text-xs text-slate-500">
                        Administradoras autorizadas pelo Banco Central. Sem promessas de contemplação. LGPD e transparência em todas as etapas.
                    </p>
                </motion.div>
            </motion.div>
        </Section>
    );
}
