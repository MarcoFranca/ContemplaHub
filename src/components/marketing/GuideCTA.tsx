"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";
import { BookOpen, ShieldCheck, CheckCircle2 } from "lucide-react";
import { SectionFX } from "@/components/marketing/SectionFX";

export function GuideCTA() {
    const router = useRouter();
    const reduce = useReducedMotion();

    const box: Variants = {
        hidden: { opacity: 0, y: 14 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0 : 0.55, ease: [0.16, 1, 0.3, 1], staggerChildren: reduce ? 0 : 0.08 },
        },
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] } },
    };

    const wa = new URL(`https://wa.me/${process.env.NEXT_PUBLIC_WA_PHONE ?? "5511999999999"}`);
    wa.searchParams.set("text", "Olá! Quero receber o Guia Estratégico do Consórcio e tirar dúvidas sobre o meu plano.");
    wa.searchParams.set("utm_source", "lp_home");
    wa.searchParams.set("utm_medium", "cta_guide");

    return (
        <Section id="guia" aria-labelledby="guide-title" className="relative isolate py-28 md:py-32">
            {/* FX elegante: mesh neutro + vinheta (sem listras/pontos) */}
            {/* Fade superior para preparar o próximo divider */}
            <div
                aria-hidden
                className="absolute -top-16 left-0 right-0 h-16 -z-10 pointer-events-none"
                style={{
                    background: "linear-gradient(to bottom, rgba(2,6,23,0) 0%, rgba(2,6,23,0.35) 40%, rgba(0,0,0,1) 100%)",
                }}
            />
            <SectionFX preset="mesh" variant="neutral" showGrid={false} showLines={false} className="[--mesh-a:#0b1822] [--mesh-b:#101827]" />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{ background: "radial-gradient(120% 80% at 50% 40%, rgba(0,0,0,0.40) 0%, transparent 70%)" }}
            />

            {/* JSON-LD do material (CreativeWork) */}
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CreativeWork",
                        name: "Guia Estratégico do Consórcio",
                        about: ["Consórcio Imobiliário", "Estratégias de lance", "Planejamento patrimonial"],
                        inLanguage: "pt-BR",
                        isAccessibleForFree: true,
                        publisher: { "@type": "Organization", name: "Autentika Seguros" },
                    }),
                }}
            />

            <motion.div
                className="mx-auto max-w-4xl"
                variants={box}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
            >
                {/* Card com borda gradiente e “band” superior */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-8 flex flex-col items-center justify-center text-center backdrop-blur-md md:p-10">
                    {/* band */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-1"
                        style={{ background: "linear-gradient(90deg, rgba(16,185,129,0.25), rgba(56,189,248,0.25), rgba(16,185,129,0.25))" }}
                    />
                    {/* borda gradiente sutil */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-3xl"
                        style={{
                            background: "linear-gradient(180deg, rgba(56,189,248,0.18), rgba(16,185,129,0.16))",
                            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                            WebkitMaskComposite: "xor",
                            maskComposite: "exclude",
                            padding: "1px",
                            opacity: 0.55,
                        }}
                    />

                    {/* ícone */}
                    <motion.div variants={item} className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/20">
                        <BookOpen className="h-6 w-6 text-emerald-300" />
                    </motion.div>

                    {/* título + subtítulo */}
                    <motion.h3 id="guide-title" variants={item} className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                        Baixe o Guia Estratégico do Consórcio
                    </motion.h3>
                    <motion.p variants={item} className="mt-2 text-slate-200/90 md:text-lg">
                        Entenda como transformar o consórcio em uma estratégia real de alavancagem patrimonial
                        previsível, segura e sem juros.
                    </motion.p>

                    {/* bullets de valor (melhora skim-read) */}
                    <motion.ul
                        variants={item}
                        className="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-4 text-left text-sm text-slate-300 sm:grid-cols-2"
                    >
                        <li className="inline-flex items-start gap-4">
                            <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-400" />
                            Diferença Consórcio x Financiamento
                        </li>
                        <li className="inline-flex items-start gap-4">
                            <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-400" />
                            Estratégias de lance por perfil
                        </li>
                        <li className="inline-flex items-start gap-4">
                            <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-400" />
                            Simulações e cenários práticos
                        </li>
                        <li className="inline-flex items-start gap-4">
                            <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-400" />
                            Checklist LGPD e compliance
                        </li>
                    </motion.ul>

                    {/* CTAs */}
                    <motion.div variants={item} className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button
                            size="lg"
                            onClick={() => router.push("/guia-consorcio")}
                            className="bg-emerald-500 text-black hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                        >
                            <BookOpen className="mr-2 h-5 w-5" />
                            Baixar meu guia gratuito
                        </Button>

                        <Button asChild size="lg" variant="outline" className="border-white/20 text-slate-100 hover:bg-white/10">
                            <Link href={wa.toString()} target="_blank" rel="noopener noreferrer">
                                <ShieldCheck className="mr-2 h-5 w-5" />
                                Falar com consultor
                            </Link>
                        </Button>
                    </motion.div>

                    {/* LGPD */}
                    <motion.p variants={item} className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-slate-500">
                        Material gratuito e educativo. Envio apenas mediante consentimento (LGPD). Não contém promessas de
                        contemplação, apenas métodos, dados e exemplos reais.
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
