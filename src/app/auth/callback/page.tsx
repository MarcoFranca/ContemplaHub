// src/app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { resolveUserDestination } from "@/lib/auth/resolve-user-destination";

async function resolveDestination() {
    const res = await fetch("/api/auth/resolve-destination", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });

    if (!res.ok) return "/login?msg=Falha%20ao%20resolver%20acesso";

    const data = (await res.json()) as { destination?: string };
    return data.destination || "/login?msg=Usuario%20sem%20acesso";
}

export default async function AuthCallbackPage() {
    const destination = await resolveUserDestination();
    redirect(destination);

    const router = useRouter();

    useEffect(() => {
        (async () => {
            const supabase = supabaseBrowser();
            const url = new URL(window.location.href);

            let {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) {
                const destination = await resolveDestination();
                return router.replace(destination);
            }

            const token_hash = url.searchParams.get("token_hash");
            const type = url.searchParams.get("type");

            if (token_hash) {
                const otpType = (type === "recovery" ? "recovery" : "email") as "recovery" | "email";
                const { error } = await supabase.auth.verifyOtp({
                    type: otpType,
                    token_hash,
                });

                if (!error) {
                    if (otpType === "recovery") {
                        return router.replace("/reset-password");
                    }
                    const destination = await resolveDestination();
                    return router.replace(destination);
                }

                console.error("verifyOtp failed:", error?.message, error);
                return router.replace("/login?msg=Falha%20no%20OTP");
            }

            const hash = window.location.hash || "";
            if (hash.includes("access_token=") && hash.includes("refresh_token=")) {
                const hp = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
                const access_token = hp.get("access_token")!;
                const refresh_token = hp.get("refresh_token")!;
                const typeFromHash = hp.get("type");

                const { error } = await supabase.auth.setSession({
                    access_token,
                    refresh_token,
                });

                if (!error) {
                    if (typeFromHash === "recovery") {
                        return router.replace("/reset-password");
                    }
                    const destination = await resolveDestination();
                    return router.replace(destination);
                }

                console.error("setSession error:", error?.message, error);
                return router.replace("/login?msg=Falha%20ao%20autenticar");
            }

            setTimeout(async () => {
                ({
                    data: { session },
                } = await supabase.auth.getSession());

                if (session) {
                    const destination = await resolveDestination();
                    return router.replace(destination);
                }

                return router.replace("/login?msg=Inicie%20o%20login%20no%20MESMO%20navegador");
            }, 600);
        })();
    }, [router]);

    return (
        <main className="min-h-[60dvh] grid place-items-center p-6">
            <p className="text-sm text-muted-foreground">Autenticando…</p>
        </main>
    );
}