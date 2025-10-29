// src/app/(auth)/login/page.tsx
"use client";

import { useState, useTransition } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithOtpAction, signInWithPasswordAction } from "@/app/actions/auth";

export default function LoginPage() {
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    return (
        <div className="min-h-[80dvh] grid place-items-center p-6">
            <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
                <h1 className="text-2xl font-semibold">Acessar Autentika</h1>
                <p className="text-sm text-muted-foreground">Entre para ver seus leads e negociações.</p>

                <Tabs defaultValue="otp" className="mt-6">
                    <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="otp">Magic link</TabsTrigger>
                        <TabsTrigger value="password">Senha</TabsTrigger>
                    </TabsList>

                    <TabsContent value="otp" className="mt-4">
                        <form
                            action={(fd) => {
                                setMessage(null);
                                startTransition(async () => {
                                    const res = await signInWithOtpAction(fd);
                                    setMessage(res.message ?? null);
                                });
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" name="email" type="email" placeholder="voce@empresa.com" required />
                            </div>
                            <Button className="w-full" disabled={isPending}>Enviar link</Button>
                            <p className="text-xs text-muted-foreground">Dica: cheque também o <strong>spam</strong>.</p>
                        </form>
                    </TabsContent>

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
                                <Label htmlFor="email2">E-mail</Label>
                                <Input id="email2" name="email" type="email" placeholder="voce@empresa.com" required />
                            </div>
                            <div>
                                <Label htmlFor="password">Senha</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <Button className="w-full" disabled={isPending}>Entrar</Button>
                        </form>
                    </TabsContent>
                </Tabs>

                {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}
            </div>
        </div>
    );
}
