"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
    name: string;
    role?: string;
    waPhone: string; // ex: "5511999999999"
    cnpj?: string;
    susep?: string; // se aplicável
    linkedinUrl?: string;
};

export function FounderBadge({
                                 name,
                                 role = "Corretor & Fundador",
                                 waPhone,
                                 cnpj,
                                 susep,
                                 linkedinUrl,
                             }: Props) {
    const wa = new URL(`https://wa.me/${waPhone}`);
    wa.searchParams.set("text", "Olá, Wagner! Quero um diagnóstico de consórcio.");
    wa.searchParams.set("utm_source", "lp_home");
    wa.searchParams.set("utm_medium", "cta_founder_badge");

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-6 flex max-w-xl items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-slate-300 backdrop-blur-sm hover:bg-white/10 transition-colors"
        >
            {/* Imagem circular — alinhada ao topo */}
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/15 shrink-0">
                <Image
                    src="/images/wagner-consorcio3x4.png"
                    alt={name}
                    fill
                    className="object-cover object-top"
                    sizes="40px"
                    priority
                />
            </div>

            <div className="flex-1 min-w-0">
                <p className="truncate font-medium leading-none text-white">{name}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{role}</p>

                <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-400">
                    {cnpj && (
                        <span className="rounded-full border border-white/10 px-2 py-0.5">
              CNPJ {cnpj}
            </span>
                    )}
                    {susep && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5">
              <Shield className="h-3 w-3 text-emerald-400" />
                    SUSEP: {susep}
                        </span>
                    )}
                </div>
            </div>

            <Link
                href={wa.toString()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-black hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition-transform hover:-translate-y-0.5"
            >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
            </Link>
        </motion.div>
    );
}
