// ex.: src/components/auth/Providers.tsx
"use client";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase/client";

export function OAuthButtons() {
    const supabase = supabaseBrowser();
    return (
        <div className="mt-6 grid gap-2">
            <Button
                variant="secondary"
                onClick={() => supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
                        queryParams: { prompt: "consent", access_type: "offline" },
                    },
                })}
            >
                Entrar com Google
            </Button>
            <Button
                variant="secondary"
                onClick={() => supabase.auth.signInWithOAuth({
                    provider: "github",
                    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
                })}
            >
                Entrar com GitHub
            </Button>
        </div>
    );
}
