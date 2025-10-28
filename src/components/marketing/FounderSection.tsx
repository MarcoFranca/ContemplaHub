"use client";

import Image from "next/image";
import Link from "next/link";
import { Section } from "./Section";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ShieldCheck, LineChart, MessageCircle, Linkedin } from "lucide-react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { SectionFX } from "@/components/marketing/SectionFX";

const container: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.08 },
    },
};
const item: Variants = {
    hidden: { opacity: 0, y: 12 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

type Props = {
    name?: string;
    waPhone: string;     // ex: "5511999999999"
    years?: number;      // ex: 12
    cnpj?: string;       // ex: "00.000.000/0001-00"
    susep?: string;      // se aplicável
    linkedinUrl?: string;
};

export function FounderSection({
                                   name = "Wagner Lisboa Gorgulho",
                                   waPhone,
                                   years = 10,
                                   cnpj,
                                   susep,
                                   linkedinUrl,
                               }: Props) {
    const reduce = useReducedMotion();
    const wa = new URL(`https://wa.me/${waPhone}`);
    wa.searchParams.set("text", "Olá, Wagner! Quero meu diagnóstico de consórcio.");
    wa.searchParams.set("utm_source", "lp_home");
    wa.searchParams.set("utm_medium", "cta_founder_section");

    return (
        <Section className="relative isolate py-28 md:py-32">
            {/* FX de palco: aurora emerald (sem grid/linhas p/ diferenciar das anteriores) */}
            <SectionFX preset="aurora" variant="emerald" beamsTilt={-18} showGrid={false} showLines={false} />
            {/* Fade superior para costurar com o divider anterior */}
            <div
                aria-hidden
                className="absolute -top-16 left-0 right-0 h-16 z-10 pointer-events-none"
                style={{
                    background: "linear-gradient(to bottom, rgba(2,6,23,0) 0%, rgba(2,6,23,0.35) 40%, rgba(0,0,0,1) 100%)",
                }}
            />
            {/* Vinheta leve p/ contraste do conteúdo */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    background: "radial-gradient(120% 80% at 60% 40%, rgba(0,0,0,0.40) 0%, transparent 70%)",
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
                {/* Retrato com halo + levitação sutil */}
                <motion.div
                    variants={item}
                    animate={reduce ? {} : { y: [0, -6, 0] }}
                    transition={reduce ? {} : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative mx-auto w-full max-w-md"
                >
                    {/* Halo fotográfico */}
                    <div
                        aria-hidden
                        className="absolute -inset-x-10 top-8 h-[60%] -z-10 rounded-[36px]"
                        style={{
                            background:
                                "radial-gradient(60% 70% at 60% 30%, rgba(16,185,129,0.22), transparent 70%), radial-gradient(40% 40% at 30% 70%, rgba(56,189,248,0.18), transparent 70%)",
                            filter: "blur(18px)",
                        }}
                    />
                    <div className="relative aspect-[4/5] w-full rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
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
                    <motion.p variants={item} className="text-sm text-slate-400">Quem vai te atender</motion.p>

                    <motion.h3
                        variants={item}
                        className="mt-1 text-3xl font-semibold md:text-4xl text-white"
                    >
                        {name} <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent [text-shadow:0_0_18px_rgba(16,185,129,0.18)]">Corretor & Fundador</span>
                    </motion.h3>

                    <motion.p variants={item} className="mt-3 text-lg text-slate-200/90 leading-relaxed">
                        “Consórcio não é promessa: é método, disciplina e transparência. Meu papel é transformar o seu objetivo
                        em um plano previsível — do primeiro aporte até a contemplação.”
                    </motion.p>

                    <motion.ul variants={item} className="mt-6 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                        <li className="inline-flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4 text-emerald-400" /> {`+${years} anos`} de atuação
                        </li>
                        {cnpj && (
                            <li className="inline-flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-400" /> CNPJ {cnpj}
                            </li>
                        )}
                        {susep && (
                            <li className="inline-flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-400" /> SUSEP {susep}
                            </li>
                        )}
                        <li className="inline-flex items-center gap-2">
                            <LineChart className="h-4 w-4 text-emerald-400" /> Estratégias de lance com base histórica
                        </li>
                    </motion.ul>

                    <motion.div variants={item} className="mt-7 flex flex-wrap gap-3">
                        {/* CTA primário — WhatsApp */}
                        <Button
                            asChild size="lg"
                            className="bg-emerald-500 text-black hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                        >
                            <Link href={wa.toString()} target="_blank">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Falar com o Wagner no WhatsApp
                            </Link>
                        </Button>

                        {/* CTA secundário — LinkedIn */}
                        {linkedinUrl && (
                            <Button
                                asChild size="lg" variant="outline"
                                className="border-white/20 text-slate-100 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-400"
                            >
                                <Link href={linkedinUrl} target="_blank">
                                    <Linkedin className="mr-2 h-4 w-4" />
                                    Ver LinkedIn
                                </Link>
                            </Button>
                        )}
                    </motion.div>

                    <motion.p variants={item} className="mt-3 text-xs text-slate-400">
                        Atendemos com LGPD e transparência. Nunca prometemos “contemplação garantida”.
                    </motion.p>
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
