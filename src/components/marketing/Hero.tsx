"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";
import { Award, Timer, BadgeCheck, ShieldCheck, TrendingUp } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {FounderBadge} from "@/components/marketing/FounderBadge";

export function Hero() {
    const router = useRouter();
    const reduce = useReducedMotion();

    // Variants tipados + easing em bezier (evita TS2322)
    const container: Variants = {
        hidden: { opacity: 0, y: 10 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: reduce ? 0 : 0.6,
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: reduce ? 0 : 0.08,
            },
        },
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 14 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] },
        },
    };

    function StatPill({
                          icon: Icon,
                          title,
                          subtitle,
                          i = 0,
                      }: {
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
        title: string;
        subtitle?: string;
        i?: number;
    }) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: 0.06 * i, ease: [0.16, 1, 0.3, 1] }}
                role="listitem"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left"
            >
                <Icon className="h-5 w-5 text-emerald-400 shrink-0" aria-hidden />
                <div className="leading-tight">
                    <p className="text-sm font-medium text-white">{title}</p>
                    {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
                </div>
            </motion.div>
        );
    }

    function TrustPill({
                           icon: Icon,
                           label,
                           i,
                       }: {
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
        label: string;
        i: number;
    }) {
        return (
            <motion.span
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1"
            >
                <Icon className="h-4 w-4 text-emerald-400" aria-hidden />
                {label}
            </motion.span>
        );
    }

    return (
        <div className="relative isolate overflow-hidden">
            {/* BG animado */}
            <motion.div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(16,185,129,0.24),rgba(16,185,129,0.08)_40%,transparent_70%)]"
                animate={reduce ? {} : { opacity: [0.85, 1, 0.85], scale: [1, 1.03, 1] }}
                transition={reduce ? {} : { duration: 12, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
            />
            <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_30%_at_50%_45%,rgba(16,185,129,0.18),transparent_60%)]"
                animate={reduce ? {} : { opacity: [0.6, 0.8, 0.6], y: [0, -6, 0] }}
                transition={reduce ? {} : { duration: 10, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:12px_12px]"
            />

            <Section className="pt-16">
                {/* JSON-LD */}
                <script
                    type="application/ld+json"
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FinancialService",
                            name: "Autentika Seguros",
                            slogan: "Planeje hoje, conquiste sempre.",
                            areaServed: "BR",
                            serviceType: "Consórcio Imobiliário e Auto",
                        }),
                    }}
                />

                <motion.div
                    className="mx-auto max-w-3xl text-center"
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{once: true, margin: "-80px"}}
                >
                    {/* Selo superior */}
                    <motion.div
                        variants={item}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur md:text-sm"
                    >
                        <span className="font-medium">Autentika Corretora</span>
                        <span aria-hidden>•</span>
                        <span>“Planeje hoje, conquiste sempre.”</span>
                    </motion.div>

                    {/* Headline nova */}
                    <motion.h1 variants={item}
                               className="mt-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
                        <span className="">Consórcio inteligente começa com</span>{" "}
                        <span
                            className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent [text-shadow:0_0_20px_rgba(16,185,129,0.18)]">
              estratégia
            </span>
                        .
                    </motion.h1>

                    {/* Subheadline nova */}
                    <motion.p variants={item} className="mt-4 text-balance text-lg text-slate-300 md:text-xl">
                        O consórcio não é um investimento qualquer, é uma estratégia de construção patrimonial
                        previsível, segura e sem juros.
                        <br className="hidden sm:block"/>
                        Com consultoria personalizada e acompanhamento até a contemplação, você alavanca seu patrimônio
                        com método.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={item}
                                className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        {/* Opção A: animar wrapper (sem nested button) */}
                        <motion.div whileHover={reduce ? {} : {y: -2}} whileTap={reduce ? {} : {scale: 0.98}}
                                    className="inline-flex">
                            <Button
                                size="lg"
                                onClick={() => router.push("#diagnostico")}
                                className="bg-emerald-500 text-black hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                                aria-label="Abrir diagnóstico consultivo"
                            >
                                Simular com especialista
                            </Button>
                        </motion.div>

                        <motion.div whileTap={reduce ? {} : {scale: 0.98}} className="inline-flex">
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => router.push("#como-funciona")}
                                className="border-white/20 text-slate-100 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                                aria-label="Ver como funciona"
                            >
                                Ver como funciona
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Prova social */}
                    <div role="list"
                         className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                        <StatPill i={0} icon={Timer} title="10 anos de experiência" subtitle="Wagner Lisboa Gorgulho"/>
                        <StatPill i={1} icon={Award} title="10 premiações" subtitle="Reconhecido pela Porto Seguro"/>
                        <StatPill i={2} icon={ShieldCheck} title="Administradoras autorizadas"
                                  subtitle="Fiscalização do BACEN"/>
                    </div>
                    <FounderBadge
                        name="Wagner Lisboa Gorgulho"
                        role="Corretor & Fundador"
                        waPhone={process.env.NEXT_PUBLIC_WA_PHONE ?? "5521969639576"}
                        cnpj="25.241.008/0001-70"
                        susep="30QP3J" // se aplicável; senão remova a prop
                        linkedinUrl="https://www.linkedin.com/in/usuario" // opcional
                    />
                    <p className="mt-2 text-[11px] text-slate-500 italic">
                        Atendimento direto com o fundador da Autentika.
                    </p>
                    {/* Trust bar (ajustada p/ reforçar confiança) */}
                    <div
                        className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-400">
                        <TrustPill i={0} icon={BadgeCheck} label="Sem juros"/>
                        <TrustPill i={1} icon={ShieldCheck} label="Sem promessas, só método"/>
                        <TrustPill i={2} icon={TrendingUp} label="Acompanhamento até a contemplação"/>
                    </div>
                </motion.div>
            </Section>
        </div>
    );
}
