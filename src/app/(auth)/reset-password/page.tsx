// src/app/(auth)/reset-password/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/marketing/Section";
import { SectionFX } from "@/components/marketing/SectionFX";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [pwd, setPwd] = useState("");
    const [pwd2, setPwd2] = useState("");
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Garante que a página só funcione com sessão válida (vinda do link de e-mail)
    useEffect(() => {
        (async () => {
            const supabase = supabaseBrowser();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setMsg("Sessão ausente. Abra o link recebido no seu e-mail para continuar.");
            }
            setReady(true);
        })();
    }, []);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setMsg(null);

        if (pwd.length < 6) {
            setMsg("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (pwd !== pwd2) {
            setMsg("As senhas não coincidem.");
            return;
        }

        setSubmitting(true);
        const supabase = supabaseBrowser();
        const { error } = await supabase.auth.updateUser({ password: pwd });
        setSubmitting(false);

        if (error) {
            setMsg(error.message);
            return;
        }

        // sucesso
        router.replace("/app");
    }

    if (!ready) {
        return (
            <main className="relative flex isolate items-center justify-center min-h-[100dvh] overflow-hidden bg-slate-950 text-slate-50">
                <SectionFX variant="emerald" preset="mesh" beamsTilt={-12} />
                <p className="text-sm text-muted-foreground">Carregando…</p>
            </main>
        );
    }

    return (
        <main className="relative flex isolate items-center justify-center min-h-[100dvh] overflow-hidden bg-slate-950 text-slate-50">
            <SectionFX variant="emerald" preset="mesh" beamsTilt={-12} />
            <Section className="relative flex min-h-[100svh] flex-col items-center justify-center px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-10 text-center max-w-2xl"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur">
                        <span className="font-medium">Autentika Corretora</span>
                        <span aria-hidden>•</span>
                        <span>Definir nova senha</span>
                    </div>
                    <h1 className="mt-6 text-4xl md:text-5xl font-bold text-balance tracking-tight">
                        Defina sua{" "}
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent [text-shadow:0_0_20px_rgba(16,185,129,0.18)]">
              nova senha
            </span>.
                    </h1>
                    <p className="mt-3 text-lg text-slate-300 md:text-xl">
                        Por segurança, informe e confirme a nova senha.
                    </p>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full justify-self-center max-w-md rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_8px_40px_rgba(16,185,129,0.12)] backdrop-blur-lg"
                >
                    <h2 className="text-xl font-semibold mb-1">Criar nova senha</h2>
                    <p className="text-sm text-slate-400 mb-4">
                        Utilize uma senha forte e exclusiva.
                    </p>

                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Nova senha */}
                        <div>
                            <Label htmlFor="password" className="mb-2">Nova senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={show1 ? "text" : "password"}
                                    value={pwd}
                                    onChange={(e) => setPwd(e.target.value)}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShow1(v => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                                    aria-label={show1 ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {show1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirmar senha */}
                        <div>
                            <Label htmlFor="password2" className="mb-2">Confirmar senha</Label>
                            <div className="relative">
                                <Input
                                    id="password2"
                                    name="password2"
                                    type={show2 ? "text" : "password"}
                                    value={pwd2}
                                    onChange={(e) => setPwd2(e.target.value)}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShow2(v => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                                    aria-label={show2 ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button className="w-full" disabled={submitting}>
                            {submitting ? "Salvando..." : "Salvar nova senha"}
                        </Button>
                    </form>

                    {msg && (
                        <p className="mt-3 text-sm text-center text-muted-foreground">{msg}</p>
                    )}

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
