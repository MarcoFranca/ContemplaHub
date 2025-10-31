"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/marketing/Section";
import { SectionFX } from "@/components/marketing/SectionFX";
import {sendRecoveryEmailClient} from "@/lib/auth/client-actions";

export default function ForgotPasswordPage() {
    const [msg, setMsg] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    return (
        <main className="relative flex isolate items-center justify-center min-h-[100dvh] overflow-hidden bg-slate-950 text-slate-50">
            <SectionFX variant="emerald" preset="mesh" beamsTilt={-12} />
            <Section className="relative flex min-h-[100svh] flex-col items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-10 text-center max-w-2xl"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur">
                        <span className="font-medium">Autentika Corretora</span>
                        <span aria-hidden>•</span>
                        <span>Recuperar acesso</span>
                    </div>
                    <h1 className="mt-6 text-4xl md:text-5xl font-bold text-balance tracking-tight">
                        Redefina sua{" "}
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent [text-shadow:0_0_20px_rgba(16,185,129,0.18)]">
              senha de acesso
            </span>
                        .
                    </h1>
                    <p className="mt-3 text-lg text-slate-300 md:text-xl">
                        Enviaremos um link seguro para seu e-mail.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full justify-self-center max-w-md rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_8px_40px_rgba(16,185,129,0.12)] backdrop-blur-lg"
                >
                    <h2 className="text-xl font-semibold mb-1">Recuperar senha</h2>
                    <p className="text-sm text-slate-400 mb-4">
                        Digite seu e-mail e enviaremos o link de redefinição.
                    </p>

                    <form
                        action={async (fd) => {
                            setMsg(null);
                            const email = String(fd.get("email") ?? "");
                            try {
                                await sendRecoveryEmailClient(email);
                                setMsg("Enviamos o link de redefinição. Abra no MESMO navegador onde você solicitou.");
                            } catch (e: any) {
                                setMsg(e?.message ?? "Falha ao enviar o link de recuperação.");
                            }
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="email" className="mb-2">E-mail</Label>
                            <Input id="email" name="email" type="email" placeholder="voce@empresa.com" required/>
                        </div>

                        <Button className="w-full" disabled={isPending}>
                            {isPending ? "Enviando..." : "Enviar link de recuperação"}
                        </Button>
                    </form>

                    {msg && <p className="mt-3 text-sm text-center text-muted-foreground">{msg}</p>}

                    <div className="mt-6 text-center text-sm text-slate-400">
                        <Link href="/login" className="underline">
                            Voltar ao login
                        </Link>
                    </div>
                </motion.div>
            </Section>
        </main>
    );
}
