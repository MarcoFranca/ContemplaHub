"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "./Section";
import { HandCoins, ShieldCheck, LineChart, Target } from "lucide-react";

const items = [
    {
        icon: HandCoins,
        title: "Construa patrimônio com método",
        text: "O consórcio é uma ferramenta de alavancagem patrimonial, você troca juros por disciplina e transforma o tempo em aliado.",
    },
    {
        icon: Target,
        title: "Planeje com estratégia",
        text: "Cada plano começa com um diagnóstico consultivo: definimos objetivo, prazo e tipo de lance de forma personalizada ao seu perfil.",
    },
    {
        icon: LineChart,
        title: "Previsibilidade real",
        text: "Simulações inteligentes e acompanhamento contínuo garantem clareza em cada etapa até a contemplação.",
    },
    {
        icon: ShieldCheck,
        title: "Segurança e transparência",
        text: "Administradoras autorizadas pelo Banco Central, curadoria Autentika e comunicação ética garantem previsibilidade e tranquilidade.",
    },
];

const container: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.08 },
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

export function Benefits() {
    return (
        <Section id="como-funciona" aria-labelledby="benefits-title">
            <div className="mx-auto mb-10 max-w-2xl text-center">
                <h2
                    id="benefits-title"
                    className="text-3xl font-semibold md:text-4xl text-white"
                >
                    O jeito moderno de conquistar com segurança
                </h2>
                <p className="mt-3 text-slate-400">
                    Consórcio como estratégia de alavancagem patrimonial, método, previsibilidade e disciplina.
                </p>
            </div>

            <motion.div
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                role="list"
            >
                {items.map((it, i) => (
                    <motion.div key={it.title} variants={item} role="listitem">
                        <Card className="h-full border-white/10 bg-white/[0.03] transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)] hover:border-emerald-400/30">
                            <CardHeader>
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                    <it.icon className="h-5 w-5 text-emerald-400" />
                                </div>
                                <CardTitle className="text-lg font-semibold text-white">
                                    {it.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {it.text}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </Section>
    );
}
