// ex.: src/components/auth/Providers.tsx
"use client";
import { Button } from "@/components/ui/button";
import { getAuthCallbackUrl } from "@/lib/auth/auth-urls";
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
                        redirectTo: getAuthCallbackUrl(),
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
                    options: { redirectTo: getAuthCallbackUrl() },
                })}
            >
                Entrar com GitHub
            </Button>
        </div>
    );
}
