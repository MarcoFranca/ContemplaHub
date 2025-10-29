// src/app/(auth)/register/page.tsx
"use client";

import { useState, useTransition } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpWithPasswordAction, signUpWithOtpAction } from "@/app/actions/auth";

export default function RegisterPage() {
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    return (
        <div className="min-h-[80dvh] grid place-items-center p-6">
            <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
                <h1 className="text-2xl font-semibold">Criar conta</h1>
                <p className="text-sm text-muted-foreground">
                    Comece a usar o CRM de consórcios da Autentika.
                </p>

                <Tabs defaultValue="password" className="mt-6">
                    <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="password">E-mail + Senha</TabsTrigger>
                        <TabsTrigger value="otp">Magic link</TabsTrigger>
                    </TabsList>

                    {/* Aba: E-mail + Senha */}
                    <TabsContent value="password" className="mt-4">
                        <form
                            action={(fd) => {
                                setMessage(null);
                                startTransition(async () => {
                                    const res = await signUpWithPasswordAction(fd);
                                    setMessage(res?.message ?? null);
                                });
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" name="name" placeholder="Seu nome" />
                            </div>
                            <div>
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" name="email" type="email" placeholder="voce@empresa.com" required />
                            </div>
                            <div>
                                <Label htmlFor="password">Senha</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <Button className="w-full" disabled={isPending}>Criar conta</Button>
                            <p className="text-xs text-muted-foreground">
                                Ao continuar, você concorda com nossos{" "}
                                <a className="underline" href="/termos">Termos</a> e{" "}
                                <a className="underline" href="/privacidade">Privacidade</a>.
                            </p>
                        </form>
                    </TabsContent>

                    {/* Aba: Magic Link */}
                    <TabsContent value="otp" className="mt-4">
                        <form
                            action={(fd) => {
                                setMessage(null);
                                startTransition(async () => {
                                    const res = await signUpWithOtpAction(fd);
                                    setMessage(res?.message ?? null);
                                });
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <Label htmlFor="email-otp">E-mail</Label>
                                <Input id="email-otp" name="email" type="email" placeholder="voce@empresa.com" required />
                            </div>
                            <Button className="w-full" disabled={isPending}>Receber link</Button>
                            <p className="text-xs text-muted-foreground">
                                Dica: cheque também a pasta de <strong>spam</strong>.
                            </p>
                        </form>
                    </TabsContent>
                </Tabs>

                {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}

                <p className="mt-6 text-center text-sm">
                    Já tem conta? <a href="/login" className="underline">Entrar</a>
                </p>
            </div>
        </div>
    );
}
