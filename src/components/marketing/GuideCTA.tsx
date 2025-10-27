"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";
import { BookOpen, ShieldCheck } from "lucide-react";

export function GuideCTA() {
    const router = useRouter();
    const reduce = useReducedMotion();

    const box: Variants = {
        hidden: { opacity: 0, y: 14 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0 : 0.55, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.08 },
        },
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
    };

    return (
        <Section id="guia" aria-labelledby="guide-title" className="relative">
            {/* fundo com halo suave emerald */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(16,185,129,0.15),transparent_60%)]"
            />

            <motion.div
                className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-sm"
                variants={box}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
            >
                <motion.div variants={item} className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                    <BookOpen className="h-6 w-6 text-emerald-400" />
                </motion.div>

                <motion.h3
                    id="guide-title"
                    variants={item}
                    className="text-2xl font-semibold md:text-3xl text-white"
                >
                    Baixe o Guia Estratégico do Consórcio
                </motion.h3>

                <motion.p variants={item} className="max-w-2xl text-slate-400">
                    Entenda como transformar o consórcio em uma estratégia real de alavancagem patrimonial,
                    previsível, segura e sem juros. Um material completo com fundamentos, simulações e
                    dicas de contemplação responsável.
                </motion.p>

                {/* Botão principal */}
                <motion.div variants={item} className="mt-2 flex flex-col sm:flex-row gap-3">
                    <Button
                        size="lg"
                        onClick={() => router.push("/guia-consorcio")}
                        className="bg-emerald-500 text-black hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    >
                        <BookOpen className="mr-2 h-5 w-5" />
                        Baixar meu guia gratuito
                    </Button>

                    {/* Link secundário para WhatsApp consultivo */}
                    <Button asChild size="lg" variant="outline" className="border-white/20 text-slate-100 hover:bg-white/10">
                        <Link
                            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_PHONE ?? "5511999999999"}?text=Olá! Quero receber o Guia Estratégico do Consórcio e tirar dúvidas sobre o meu plano.`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ShieldCheck className="mr-2 h-5 w-5" />
                            Falar com consultor
                        </Link>
                    </Button>
                </motion.div>

                {/* Nota de compliance / LGPD */}
                <motion.p
                    variants={item}
                    className="mt-3 text-xs text-slate-500 max-w-md leading-relaxed"
                >
                    Material gratuito e educativo. Envio apenas mediante consentimento (LGPD).
                    Não contém promessas de contemplação, apenas métodos, dados e exemplos reais.
                </motion.p>
            </motion.div>
        </Section>
    );
}
