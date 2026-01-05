"use client";

import Image from "next/image";
import Link from "next/link";
import { Section } from "./Section";
import { Button } from "@/components/ui/button";
import {
    BadgeCheck,
    ShieldCheck,
    LineChart,
    MessageCircle,
    Instagram,
} from "lucide-react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { SectionFX } from "@/components/marketing/SectionFX";
import {SectionSeam} from "@/components/marketing/SectionSeam";

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
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
};

type Props = {
    name?: string;
    waPhone: string; // ex: "5511999999999"
    years?: number; // ex: 12
    cnpj?: string; // ex: "00.000.000/0001-00"
    susep?: string; // se aplicável
    linkedinUrl?: string;
    instagramUrl?: string;
};

export function FounderSection({
                                   name = "Wagner Lisboa Gorgulho",
                                   waPhone,
                                   years = 10,
                                   cnpj,
                                   susep,
                                   linkedinUrl,
                                   instagramUrl,
                               }: Props) {
    const reduce = useReducedMotion();

    const wa = new URL(`https://wa.me/${waPhone}`);
    wa.searchParams.set("text", "Olá, Wagner! Quero meu diagnóstico de consórcio.");
    wa.searchParams.set("utm_source", "lp_home");
    wa.searchParams.set("utm_medium", "cta_founder_section");

    return (
        <Section className="relative isolate py-28 md:py-32">
            {/* FX: mantém o look no dark; no light fica mais suave automaticamente
          (SectionFX já está funcionando bem em dark; aqui vamos “polir” o light via overlays). */}
            <SectionFX
                preset="aurora"
                variant="emerald"
                beamsTilt={-18}
                showGrid={false}
                showLines={false}
            />

            {/* Fade superior: DARK mantém como estava; LIGHT usa background claro */}
            <SectionSeam position="top" />


            {/* Vinheta: DARK escura; LIGHT clara (sem “sujar” branco) */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
                style={{
                    background:
                        "radial-gradient(120% 80% at 60% 40%, rgba(0,0,0,0.40) 0%, transparent 70%)",
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 dark:hidden"
                style={{
                    background:
                        "radial-gradient(120% 80% at 60% 40%, rgba(15,23,42,0.06) 0%, transparent 70%)",
                }}
            />

            {/* JSON-LD Person */}
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Person",
                        name,
                        jobTitle: "Corretor e Fundador",
                        worksFor: { "@type": "Organization", name: "Autentika Seguros" },
                        sameAs: linkedinUrl ? [linkedinUrl] : [],
                    }),
                }}
            />

            <motion.div
                className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
            >
                {/* Retrato */}
                <motion.div
                    variants={item}
                    animate={reduce ? {} : { y: [0, -6, 0] }}
                    transition={reduce ? {} : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative mx-auto w-full max-w-md"
                >
                    {/* Halo fotográfico: mantém; no light fica bem suave */}
                    <div
                        aria-hidden
                        className="absolute -inset-x-10 top-8 h-[60%] -z-10 rounded-[36px]"
                        style={{
                            background:
                                "radial-gradient(60% 70% at 60% 30%, rgba(16,185,129,0.22), transparent 70%), radial-gradient(40% 40% at 30% 70%, rgba(56,189,248,0.18), transparent 70%)",
                            filter: "blur(18px)",
                            opacity: 0.9,
                        }}
                    />

                    {/* Card da imagem: LIGHT usa bg-card/border-border, DARK mantém */}
                    <div className="relative aspect-[4/5] w-full rounded-3xl border border-border bg-card shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none backdrop-blur-sm">
                        <Image
                            src="/images/wagner-consorcio.png"
                            alt={`${name} Corretor & Fundador da Autentika Seguros`}
                            fill
                            className="object-contain drop-shadow-[0_16px_48px_rgba(16,185,129,0.22)]"
                            priority
                        />
                    </div>
                </motion.div>

                {/* Conteúdo */}
                <div>
                    <motion.p
                        variants={item}
                        className="text-sm text-muted-foreground dark:text-slate-400"
                    >
                        Quem vai te atender
                    </motion.p>

                    <motion.h3
                        variants={item}
                        className="mt-1 text-3xl font-semibold md:text-4xl text-foreground dark:text-white"
                    >
                        {name}{" "}
                        <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent [text-shadow:0_0_18px_rgba(16,185,129,0.18)]">
              Corretor & Fundador
            </span>
                    </motion.h3>

                    <motion.p
                        variants={item}
                        className="mt-3 text-lg leading-relaxed text-muted-foreground dark:text-slate-200/90"
                    >
                        “Consórcio não é promessa: é método, disciplina e transparência. Meu papel é
                        transformar o seu objetivo em um plano previsível — do primeiro aporte até a
                        contemplação.”
                    </motion.p>

                    <motion.ul
                        variants={item}
                        className="mt-6 grid gap-2 text-sm text-foreground/90 dark:text-slate-300 md:grid-cols-2"
                    >
                        <li className="inline-flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />{" "}
                            {`+${years} anos`} de atuação
                        </li>

                        {cnpj && (
                            <li className="inline-flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />{" "}
                                CNPJ {cnpj}
                            </li>
                        )}

                        {susep && (
                            <li className="inline-flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />{" "}
                                SUSEP {susep}
                            </li>
                        )}

                        <li className="inline-flex items-center gap-2">
                            <LineChart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />{" "}
                            Estratégias de lance com base histórica
                        </li>
                    </motion.ul>

                    <motion.div variants={item} className="mt-7 flex flex-wrap gap-3">
                        {/* CTA primário — WhatsApp (OK no light/dark) */}
                        <Button
                            asChild
                            size="lg"
                            className="bg-emerald-500 text-black hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-slate-900"
                        >
                            <Link href={wa.toString()} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Falar com o Wagner no WhatsApp
                            </Link>
                        </Button>

                        {/* CTA secundário — Instagram (LIGHT: outline com border-border + hover muted) */}
                        {instagramUrl && (
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-border text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/20 dark:text-slate-100 dark:hover:bg-white/10 dark:focus-visible:ring-offset-slate-900"
                            >
                                <Link href={instagramUrl} target="_blank" rel="me noopener noreferrer">
                                    <Instagram className="mr-2 h-4 w-4" />
                                    Ver Instagram
                                </Link>
                            </Button>
                        )}
                    </motion.div>

                    <motion.p
                        variants={item}
                        className="mt-3 text-xs text-muted-foreground dark:text-slate-400"
                    >
                        Atendemos com LGPD e transparência. Nunca prometemos “contemplação garantida”.
                    </motion.p>
                </div>
            </motion.div>

            {/* Fade inferior: DARK mantém; LIGHT usa costura clara */}
            <SectionSeam position="bottom" />
        </Section>
    );
}
