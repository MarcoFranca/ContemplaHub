"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { signInWithPasswordAction} from "@/app/actions/auth";
import { Section } from "@/components/marketing/Section";
import { SectionFX } from "@/components/marketing/SectionFX";
import {sendMagicLinkClient} from "@/lib/auth/client-actions";
import {OAuthProviders} from "@/components/auth/OAuthProviders";

export default function LoginPage() {
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [showPass, setShowPass] = useState(false);


    return (
        <main className="flex isolate items-center justify-center relative min-h-[100dvh] overflow-hidden text-slate-50 bg-slate-950">
            {/* ✨ Fundo animado igual ao Hero */}
            <SectionFX variant="emerald" preset="mesh" beamsTilt={-14} />

            {/* Container centralizado */}
            <Section className="relative flex min-h-[100svh] flex-col items-center justify-center px-4">
                {/* Gradiente radial sutil para foco central */}
                <div
                    aria-hidden
                    className="absolute inset-0 -z-10 opacity-[0.15]"
                    style={{
                        background:
                            "radial-gradient(60% 40% at 50% 40%, rgba(16,185,129,0.5), transparent 70%)",
                    }}
                />

                {/* Branding e título */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-10 text-center max-w-2xl"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur">
                        <span className="font-medium">Autentika Corretora</span>
                        <span aria-hidden>•</span>
                        <span>“Planeje hoje, conquiste sempre.”</span>
                    </div>

                    <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-balance">
                        Entre para o seu{" "}
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent [text-shadow:0_0_20px_rgba(16,185,129,0.18)]">
              painel de consórcios
            </span>
                        .
                    </h1>
                    <p className="mt-4 text-slate-300 text-lg md:text-xl">
                        Acompanhe leads, negociações e assembleias em um ambiente seguro,
                        com previsibilidade e método.
                    </p>
                </motion.div>

                {/* Card de login central */}
                <motion.div
                    initial={{opacity: 0, scale: 0.97}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
                    className="w-full justify-self-center max-w-md rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_8px_40px_rgba(16,185,129,0.12)] backdrop-blur-lg"
                >
                    <h2 className="text-xl font-semibold mb-1">Acessar Autentika</h2>
                    <p className="text-sm text-slate-400 mb-4">
                        Escolha o melhor caminho para você.
                    </p>

                    <Tabs defaultValue="otp" className="mt-2">
                        <TabsList className="grid grid-cols-2 bg-white/5 border border-white/10">
                            <TabsTrigger value="otp">Magic link</TabsTrigger>
                            <TabsTrigger value="password">Senha</TabsTrigger>
                        </TabsList>

                        {/* Magic link */}
                        <TabsContent value="otp" className="mt-4">
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    setMessage(null);
                                    const fd = new FormData(e.currentTarget as HTMLFormElement);
                                    const email = String(fd.get("email") ?? "");
                                    try {
                                        await sendMagicLinkClient(email); // CLIENTE
                                        // Verificador (debug opcional):
                                        console.debug("PKCE set?", !!localStorage.getItem("sb-pkce-code-verifier"));
                                        setMessage("Enviamos um link de acesso ao seu e-mail. Abra no MESMO navegador.");
                                    } catch (e: any) {
                                        setMessage(e?.message ?? "Falha ao enviar o magic link.");
                                    }
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="email" className="mb-2">E-mail</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="voce@empresa.com"
                                        required
                                    />
                                </div>
                                <Button className="w-full" disabled={isPending}>
                                    {isPending ? "Enviando..." : "Receber link por e-mail"}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                    Dica: cheque também o <strong>spam</strong>.
                                </p>
                            </form>
                        </TabsContent>

                        {/* Senha */}
                        <TabsContent value="password" className="mt-4">
                            <form
                                action={(fd) => {
                                    setMessage(null);
                                    startTransition(async () => {
                                        const res = await signInWithPasswordAction(fd);
                                        if (res && !res.ok && res.message) setMessage(res.message);
                                    });
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="email2" className="mb-2">E-mail</Label>
                                    <Input
                                        id="email2"
                                        name="email"
                                        type="email"
                                        placeholder="voce@empresa.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="password" className="mb-2">Senha</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPass ? "text" : "password"}
                                            required
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPass ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                        </button>
                                    </div>
                                    <div className="flex justify-end mt-1">
                                        <Link href="/forgot-password" className="text-xs underline">
                                            Esqueci minha senha
                                        </Link>
                                    </div>
                                </div>
                                <Button className="w-full" disabled={isPending}>
                                    {isPending ? "Entrando..." : "Entrar"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {message && (
                        <p className="mt-3 text-sm text-center text-muted-foreground">{message}</p>
                    )}

                    {/* Divider */}
                    <div className="my-4 flex items-center gap-2 text-xs text-slate-400">
                        <div className="h-px flex-1 bg-white/10"/>
                        <span>ou</span>
                        <div className="h-px flex-1 bg-white/10"/>
                    </div>

                    <OAuthProviders/>

                    <div className="mt-6 text-center text-sm text-slate-400">
                        <span>Não tem conta? </span>
                        <Link href="/register" className="underline">
                            Criar conta
                        </Link>
                    </div>
                    <div className="mt-2 text-center">
                        <Link href="/" className="text-xs underline text-slate-500 hover:text-slate-300">
                            Voltar à página inicial
                        </Link>
                    </div>
                </motion.div>
            </Section>
        </main>
    );
}
