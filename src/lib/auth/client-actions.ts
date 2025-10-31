"use client";
import { supabaseBrowser } from "@/lib/supabase/client";
const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

export async function sendMagicLinkClient(email: string) {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    });
    if (error) throw error;
}

export async function signInWithProvider(provider: "google"|"github"|"facebook"|"apple") {
    const supabase = supabaseBrowser();
    const base: any = {
        provider,
        options: { redirectTo },
    };

    // escopos úteis
    if (provider === "google") {
        base.options.queryParams = { prompt: "consent", access_type: "offline" }; // refresh_token
        base.options.scopes = "openid email profile";
    }
    if (provider === "facebook") {
        base.options.scopes = "email,public_profile";
    }
    if (provider === "apple") {
        base.options.scopes = "name email";
    }

    await supabase.auth.signInWithOAuth(base);
}

export async function sendRecoveryEmailClient(email: string) {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    });
    if (error) throw error;
}

export async function signInWithGoogleClient() {
    const supabase = supabaseBrowser();
    await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            queryParams: { prompt: "consent", access_type: "offline" },
        },
    });
}

export async function signInWithGithubClient() {
    const supabase = supabaseBrowser();
    await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    });
}
