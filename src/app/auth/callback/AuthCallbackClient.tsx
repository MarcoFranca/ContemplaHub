"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

function getSupabaseBrowserClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
            },
        }
    );
}

export function AuthCallbackClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [message, setMessage] = useState("Validando acesso...");

    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                const supabase = getSupabaseBrowserClient();
                const code = searchParams.get("code");

                if (code) {
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;
                } else {
                    await supabase.auth.getSession();
                }

                const res = await fetch("/api/auth/resolve-destination", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error("Falha ao resolver destino do usuário.");
                }

                const data = (await res.json()) as { destination?: string };
                const destination =
                    data.destination || "/login?msg=Usuario%20sem%20acesso";

                if (!cancelled) {
                    router.replace(destination);
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Falha ao concluir autenticação.";

                if (!cancelled) {
                    setMessage(errorMessage);
                    router.replace(`/login?msg=${encodeURIComponent(errorMessage)}`);
                }
            }
        }

        void run();

        return () => {
            cancelled = true;
        };
    }, [router, searchParams]);

    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl border bg-background p-6 text-center shadow-sm">
                <h1 className="text-lg font-semibold">Concluindo acesso</h1>
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            </div>
        </main>
    );
}