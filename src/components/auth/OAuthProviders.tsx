"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signInWithProvider } from "@/lib/auth/client-actions";
import Image from "next/image";

// ✅ use PNGs do /public
const ICON = {
    google: "/icons/google.png",
    facebook: "/icons/facebook.png",
    apple: "/icons/apple.png", // se preferir PNG em vez do Lucide
} as const;

type Provider = "google" | "github" | "facebook" | "apple";

export function OAuthProviders() {
    const [loading, setLoading] = useState<Provider | null>(null);

    async function go(p: Provider) {
        try {
            setLoading(p);
            await signInWithProvider(p); // PKCE via Supabase → /auth/callback
        } finally {
            setLoading(null);
        }
    }

    const baseBtn =
        "w-full justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border-white/10 h-10";

    const Chip = ({ src, alt }: { src: string; alt: string }) => (
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white">
      {/* defina width/height para não dar layout shift */}
            <Image src={src} alt={alt} width={16} height={16} />
    </span>
    );

    return (
        <div className="grid gap-2">
            <Button
                type="button"
                variant="outline"
                className={baseBtn}
                onClick={() => go("google")}
                disabled={loading !== null}
                aria-label="Entrar com Google"
            >
                <Chip src={ICON.google} alt="Google" />
                {loading === "google" ? "Conectando..." : "Entrar com Google"}
            </Button>

            {/*<Button*/}
            {/*    type="button"*/}
            {/*    variant="outline"*/}
            {/*    className={baseBtn}*/}
            {/*    onClick={() => go("facebook")}*/}
            {/*    disabled={loading !== null}*/}
            {/*    aria-label="Entrar com Facebook"*/}
            {/*>*/}
            {/*    <Chip src={ICON.facebook} alt="Facebook" />*/}
            {/*    {loading === "facebook" ? "Conectando..." : "Entrar com Facebook"}*/}
            {/*</Button>*/}

            {/*/!* Se preferir PNG da Apple, troque o ícone pelo Chip com ICON.apple *!/*/}
            {/*<Button*/}
            {/*    type="button"*/}
            {/*    variant="outline"*/}
            {/*    className={baseBtn}*/}
            {/*    onClick={() => go("apple")}*/}
            {/*    disabled={loading !== null}*/}
            {/*    aria-label="Entrar com Apple"*/}
            {/*    title="Apple requer https público (use túnel em dev)"*/}
            {/*>*/}
            {/*    <Chip src={ICON.apple} alt="apple" />*/}
            {/*    {loading === "apple" ? "Conectando..." : "Entrar com Apple"}*/}
            {/*</Button>*/}

            <p className="text-xs text-slate-400 text-center mt-1">
                Usamos apenas seu e-mail para criar/entrar na sua conta.
            </p>
        </div>
    );
}
