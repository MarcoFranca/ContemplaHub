// src/app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

async function resolveDestination() {
    const supabase = supabaseBrowser();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return "/login?msg=Falha%20na%20autenticacao";

    const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (profile) return "/app";

    const { data: partner } = await supabase
        .from("partner_users")
        .select("id, ativo")
        .eq("auth_user_id", user.id)
        .eq("ativo", true)
        .maybeSingle();

    if (partner) return "/partner";

    return "/login?msg=Usuario%20sem%20acesso";
}

export default function AuthCallback() {
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