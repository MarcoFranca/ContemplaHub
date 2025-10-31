// src/app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const supabase = supabaseBrowser();
            const url = new URL(window.location.href);

            // --- (0) Se o SDK já trocou (PKCE), siga:
            let { data: { session } } = await supabase.auth.getSession();
            if (session) {
                return router.replace("/app");
            }

            // --- (1) OTP (magic link / recovery) via token_hash + type
            const token_hash = url.searchParams.get("token_hash");
            const type = url.searchParams.get("type"); // "recovery" | "magiclink" | ...
            if (token_hash) {
                const otpType = (type === "recovery" ? "recovery" : "email") as "recovery" | "email";
                const { error } = await supabase.auth.verifyOtp({ type: otpType, token_hash });
                if (!error) {
                    return router.replace(otpType === "recovery" ? "/reset-password" : "/app");
                }
                console.error("verifyOtp failed:", error?.message, error);
                return router.replace("/login?msg=Falha%20no%20OTP");
            }

            // --- (2) Compat: fluxo antigo com tokens no HASH
            const hash = window.location.hash || "";
            if (hash.includes("access_token=") && hash.includes("refresh_token=")) {
                const hp = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
                const access_token = hp.get("access_token")!;
                const refresh_token = hp.get("refresh_token")!;
                const typeFromHash = hp.get("type");
                const { error } = await supabase.auth.setSession({ access_token, refresh_token });
                if (!error) {
                    return router.replace(typeFromHash === "recovery" ? "/reset-password" : "/app");
                }
                console.error("setSession error:", error?.message, error);
                return router.replace("/login?msg=Falha%20ao%20autenticar");
            }

            // --- (3) PKCE (Google/GitHub/...): deixe o SDK fazer o exchange do ?code= automaticamente
            // Damos um "respiro" curto para o SDK concluir:
            setTimeout(async () => {
                ({ data: { session } } = await supabase.auth.getSession());
                if (session) return router.replace("/app");

                // se ainda não veio sessão, provavelmente abriu em outra aba/app
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
