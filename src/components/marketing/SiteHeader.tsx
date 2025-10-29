"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function SiteHeader() {
    const pathname = usePathname();
    const isHome = pathname === "/";

    return (
        <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-slate-950/60 backdrop-blur-md">
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 md:py-4"
            >
                {/* Logo + Marca */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/icone.png"
                        alt="Autentika Corretora"
                        width={32}
                        height={32}
                        className="h-8 w-8"
                    />
                    <span className="text-white font-semibold tracking-tight">
            Autentika Corretora
          </span>
                </Link>

                {/* Menu simples */}
                <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
                    <Link href="#como-funciona" className="hover:text-white">Como funciona</Link>
                    <Link href="#beneficios" className="hover:text-white">Benefícios</Link>
                    <Link href="#guia" className="hover:text-white">Guia</Link>
                    <Link href="#diagnostico" className="hover:text-white">Diagnóstico</Link>
                </div>

                {/* CTA direita */}
                <div className="flex items-center gap-3">
                    <Link href="https://wa.me/5521969639576" target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" className="text-slate-100 hover:text-white hover:bg-white/10">
                            WhatsApp
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        onClick={() => window.open("/login", "_self")}
                        className="bg-emerald-500 text-black hover:bg-emerald-400"
                    >
                        Entrar
                    </Button>
                </div>
            </motion.nav>
        </header>
    );
}
