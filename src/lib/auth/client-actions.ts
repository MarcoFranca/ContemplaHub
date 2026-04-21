"use client";
import { supabaseBrowser } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth/auth-urls";

const redirectTo = getAuthCallbackUrl();
type OAuthProvider = "google" | "github" | "facebook" | "apple";
type SignInWithOAuthParams = Parameters<
    ReturnType<typeof supabaseBrowser>["auth"]["signInWithOAuth"]
>[0];

export async function sendMagicLinkClient(email: string) {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: getAuthCallbackUrl() },
    });
    if (error) throw error;
}

export async function signInWithProvider(provider: OAuthProvider) {
    const supabase = supabaseBrowser();
    const options: NonNullable<SignInWithOAuthParams["options"]> = {
        redirectTo,
    };
    const base: SignInWithOAuthParams = {
        provider,
        options,
    };

    // escopos úteis
    if (provider === "google") {
        options.queryParams = { prompt: "consent", access_type: "offline" }; // refresh_token
        options.scopes = "openid email profile";
    }
    if (provider === "facebook") {
        options.scopes = "email,public_profile";
    }
    if (provider === "apple") {
        options.scopes = "name email";
    }

    await supabase.auth.signInWithOAuth(base);
}

export async function sendRecoveryEmailClient(email: string) {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthCallbackUrl(),
    });
    if (error) throw error;
}

export async function signInWithGoogleClient() {
    const supabase = supabaseBrowser();
    await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: getAuthCallbackUrl(),
            queryParams: { prompt: "consent", access_type: "offline" },
        },
    });
}

export async function signInWithGithubClient() {
    const supabase = supabaseBrowser();
    await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: getAuthCallbackUrl() },
    });
}
