"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SiteHeader() {
    return (
        <header
            className={cn(
                "fixed top-0 left-0 z-50 w-full backdrop-blur-md",
                "border-b border-border/50 bg-background/80",
                "dark:border-white/10 dark:bg-slate-950/60"
            )}
        >
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 md:py-4"
            >
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/icone.png"
                        alt="Autentika Corretora"
                        width={32}
                        height={32}
                        className="h-8 w-8"
                    />
                    <span className={cn("font-semibold tracking-tight text-foreground", "dark:text-white")}>
            Autentika Corretora
          </span>
                </Link>

                <div className={cn("hidden md:flex items-center gap-6 text-sm text-muted-foreground", "dark:text-slate-300")}>
                    <Link href="#como-funciona" className="hover:text-foreground dark:hover:text-white">
                        Como funciona
                    </Link>
                    <Link href="#beneficios" className="hover:text-foreground dark:hover:text-white">
                        Benefícios
                    </Link>
                    <Link href="#guia" className="hover:text-foreground dark:hover:text-white">
                        Guia
                    </Link>
                    <Link href="#diagnostico" className="hover:text-foreground dark:hover:text-white">
                        Diagnóstico
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="https://wa.me/5521969639576" target="_blank" rel="noopener noreferrer">
                        <Button
                            variant="ghost"
                            className={cn(
                                "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50",
                                "dark:text-slate-100 dark:hover:text-white dark:hover:bg-white/10"
                            )}
                        >
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
