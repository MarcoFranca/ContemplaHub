"use client";

import { motion, type Variants } from "framer-motion";
import { Section } from "./Section";
import {
    CheckCircle2,
    ShieldCheck,
    LineChart,
    MessagesSquare,
    ClipboardCheck,
} from "lucide-react";

const points = [
    {
        icon: MessagesSquare,
        title: "Consultoria personalizada",
        text: "Não vendemos tabela. Entendemos seu objetivo e perfil para definir prazo, aporte e tipo de lance com método.",
    },
    {
        icon: LineChart,
        title: "Previsão responsável",
        text: "Estimativas a partir de média histórica e sazonalidade do grupo — para guiar sua estratégia, sem promessas de contemplação.",
    },
    {
        icon: ClipboardCheck,
        title: "Acompanhamento até a carta",
        text: "Alertas de assembleia, janelas de lance e revisão de plano — do primeiro contato até a entrega da carta.",
    },
    {
        icon: ShieldCheck,
        title: "Segurança e transparência",
        text: "Administradoras autorizadas pelo Banco Central e curadoria Autentika. Comunicação ética e aderente à LGPD.",
    },
];

const container: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.08 },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export function WhyAutentika() {
    return (
        <Section aria-labelledby="why-title">
            <div className="mx-auto max-w-3xl text-center">
                <h2 id="why-title" className="text-3xl font-semibold md:text-4xl text-white">
                    Mais que consórcio, uma estratégia de vida
                </h2>
                <p className="mt-3 text-slate-400">
                    Alavancagem patrimonial com método, previsibilidade e acompanhamento humano.
                </p>
            </div>

            {/* Lista de diferenciais (mobile-first, com animação) */}
            <motion.ul
                className="mx-auto mt-8 grid max-w-5xl gap-6 sm:grid-cols-2"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                role="list"
            >
                {points.map((p) => (
                    <motion.li
                        key={p.title}
                        variants={item}
                        role="listitem"
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)] hover:border-emerald-400/30"
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                                <p.icon className="h-5 w-5 text-emerald-400" aria-hidden />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white">{p.title}</h3>
                                <p className="mt-1 text-sm leading-relaxed text-slate-400">{p.text}</p>
                            </div>
                        </div>
                    </motion.li>
                ))}
            </motion.ul>

            {/* Mini “como funciona” (3 passos) — reforça método sem fricção */}
            <motion.ol
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="mx-auto mt-10 max-w-4xl list-none space-y-3 text-sm text-slate-300"
                aria-label="Como funciona"
            >
                <motion.li variants={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" aria-hidden />
                    1) Diagnóstico consultivo: objetivo, prazo, perfil e capacidade de aporte.
                </motion.li>
                <motion.li variants={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" aria-hidden />
                    2) Definição de estratégia: tipo de lance, janelas de assembleia e simulação de cenários.
                </motion.li>
                <motion.li variants={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" aria-hidden />
                    3) Acompanhamento até a contemplação: alertas, revisão e orientação no uso da carta.
                </motion.li>
            </motion.ol>

            {/* Nota de compliance (curta e clara) */}
            <p className="mx-auto mt-4 max-w-3xl text-center text-xs text-slate-500">
                Estimativas de contemplação são projeções baseadas em histórico e sazonalidade. Não há garantia de contemplação.
            </p>
        </Section>
    );
}
