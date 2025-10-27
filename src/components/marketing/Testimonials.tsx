"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "./Section";
import { Quote } from "lucide-react";

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
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export function Testimonials() {
    return (
        <Section id="depoimentos" aria-labelledby="testimonials-title">
            <div className="mx-auto mb-10 max-w-2xl text-center">
                <h2 id="testimonials-title" className="text-3xl font-semibold md:text-4xl text-white">
                    Histórias de quem conquistou com método
                </h2>
                <p className="mt-2 text-slate-400 text-base">
                    Experiências reais de clientes que planejaram, executaram e conquistaram com estratégia.
                </p>
            </div>

            <motion.div
                className="grid gap-6 md:grid-cols-3"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                role="list"
            >
                {depoimentos.map((d, i) => (
                    <motion.div key={d.name} variants={item} role="listitem">
                        <Card className="h-full border-white/10 bg-white/[0.03] transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)] hover:border-emerald-400/30">
                            <CardContent className="relative pt-8 pb-6 px-6 text-slate-300">
                                <Quote className="absolute left-5 top-5 h-5 w-5 text-emerald-400 opacity-60" aria-hidden />
                                <p className="mt-5 text-base leading-relaxed text-white/90">“{d.text}”</p>
                                <p className="mt-4 text-sm text-slate-400 font-medium"> {d.name}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Nota de compliance */}
            <p className="mx-auto mt-8 max-w-3xl text-center text-xs text-slate-500">
                Depoimentos verificados de clientes reais. Resultados podem variar conforme grupo e estratégia. Não há promessa de contemplação.
            </p>
        </Section>
    );
}
