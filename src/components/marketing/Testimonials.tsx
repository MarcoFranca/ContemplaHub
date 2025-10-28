"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "./Section";
import { Quote } from "lucide-react";
import { SectionFX } from "@/components/marketing/SectionFX";

const depoimentos = [
    {
        name: "Thiago R.",
        text: "Consegui ser contemplado em menos de um ano com o plano estratégico da Autentika. Tudo foi calculado com base no histórico do grupo, nada de promessa, só método.",
    },
    {
        name: "Larissa M.",
        text: "Sempre tive receio de consórcio, mas o atendimento consultivo me mostrou como usar o consórcio para construir patrimônio de forma previsível e sem juros.",
    },
    {
        name: "Eduardo V.",
        text: "Paguei tranquilo, entendi cada assembleia e tive suporte em todas as etapas. Hoje recomendo a Autentika para amigos que querem investir com segurança.",
    },
];

const container: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 },
    },
};
const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

export function Testimonials() {
    return (
        <Section id="depoimentos" aria-labelledby="testimonials-title" className="relative isolate overflow-hidden py-28 md:py-32">
            {/* fundo emocional: aurora neutra + halos */}
            <SectionFX preset="fineLines" variant="neutral" beamsTilt={-10} />

            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    background:
                        "radial-gradient(60% 60% at 50% 40%, rgba(16,185,129,0.10), transparent 70%), radial-gradient(80% 50% at 90% 20%, rgba(56,189,248,0.06), transparent 80%)",
                }}
            />

            {/* título + subtítulo */}
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{once: true, margin: "-80px"}}
                className="mx-auto mb-12 max-w-2xl text-center"
            >
                <motion.h2 variants={item} id="testimonials-title" className="text-3xl font-semibold md:text-4xl text-white">
                    Histórias de quem conquistou com método
                </motion.h2>
                <motion.p variants={item} className="mt-3 text-slate-200/90 md:text-lg">
                    Experiências reais de clientes que planejaram, executaram e conquistaram com estratégia.
                </motion.p>
                <motion.div
                    variants={item}
                    aria-hidden
                    className="mx-auto mt-4 h-[2px] w-20 rounded-full bg-gradient-to-r from-emerald-400/60 via-teal-300/50 to-emerald-400/60"
                />
            </motion.div>

            {/* depoimentos */}
            <motion.div
                className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                role="list"
            >
                {depoimentos.map((d, i) => (
                    <motion.div
                        key={d.name}
                        variants={item}
                        role="listitem"
                        className="relative group"
                    >
                        {/* halo atrás de cada card */}
                        <div
                            aria-hidden
                            className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                            style={{
                                background:
                                    "radial-gradient(70% 70% at 50% 0%, rgba(16,185,129,0.12), transparent 80%)",
                                filter: "blur(18px)",
                            }}
                        />
                        <Card className="relative h-full border-white/10 bg-white/[0.04] backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(16,185,129,0.12)] hover:border-emerald-400/30">
                            <CardContent className="relative px-6 pt-8 pb-6 text-slate-200/90">
                                <Quote
                                    className="absolute left-5 top-5 h-5 w-5 text-emerald-400 opacity-60"
                                    aria-hidden
                                />
                                <p className="mt-5 text-base leading-relaxed text-white/90">“{d.text}”</p>
                                <p className="mt-4 text-sm text-slate-400 font-medium">{d.name}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* compliance */}
            <motion.p
                variants={item}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                className="mx-auto mt-10 max-w-3xl text-center text-xs text-slate-500"
            >
                Depoimentos verificados de clientes reais. Resultados podem variar conforme grupo e
                estratégia. Não há promessa de contemplação.
            </motion.p>
        </Section>
    );
}
