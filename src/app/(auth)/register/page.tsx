// src/app/(auth)/register/page.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpWithPasswordAction } from "@/app/actions/auth";
import { Section } from "@/components/marketing/Section";
import { SectionFX } from "@/components/marketing/SectionFX";

export default function RegisterPage() {
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    return (
        <main
            className="
    flex isolate items-center justify-center relative min-h-[100dvh] overflow-hidden
    bg-background text-foreground
    dark:bg-slate-950 dark:text-slate-50
  "
        >
            <SectionFX variant="emerald" preset="mesh" beamsTilt={-12}/>
            <Section className="relative flex min-h-[100svh] flex-col items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-10 text-center max-w-2xl"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur">
                        <span className="font-medium">Autentika Corretora</span>
                        <span aria-hidden>•</span>
                        <span>“Planeje hoje, conquiste sempre.”</span>
                    </div>
                    <h1 className="mt-6 text-4xl md:text-5xl font-bold text-balance tracking-tight">
                        Crie sua{" "}
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent [text-shadow:0_0_20px_rgba(16,185,129,0.18)]">
              conta Autentika
            </span>
                        .
                    </h1>
                    <p className="mt-3 text-lg text-slate-300 md:text-xl">
                        Tenha acesso ao painel completo de consórcios, leads e previsões.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full justify-self-center max-w-md rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_8px_40px_rgba(16,185,129,0.12)] backdrop-blur-lg"
                >
                    <h2 className="text-xl font-semibold mb-1">Criar conta</h2>
                    <p className="text-sm text-slate-400 mb-4">
                        Preencha seus dados para começar.
                    </p>

                    <form
                        action={(fd) => {
                            setMessage(null);
                            startTransition(async () => {
                                const res = await signUpWithPasswordAction(fd);
                                setMessage(res.message ?? null);
                            });
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="name" className="mb-2">Nome completo</Label>
                            <Input id="name" name="name" placeholder="Seu nome" required />
                        </div>
                        <div>
                            <Label htmlFor="email" className="mb-2">E-mail</Label>
                            <Input id="email" name="email" type="email" placeholder="voce@empresa.com" required />
                        </div>
                        <div>
                            <Label htmlFor="password" className="mb-2">Senha</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>

                        <Button className="w-full" disabled={isPending}>
                            {isPending ? "Criando..." : "Criar conta"}
                        </Button>
                    </form>

                    {message && (
                        <p className="mt-3 text-sm text-center text-muted-foreground">{message}</p>
                    )}

                    <div className="mt-6 text-center text-sm text-slate-400">
                        Já tem uma conta?{" "}
                        <Link href="/login" className="underline">
                            Entrar
                        </Link>
                    </div>
                </motion.div>
            </Section>
        </main>
    );
}
