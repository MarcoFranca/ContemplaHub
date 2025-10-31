// src/lib/supabase/client.ts
"use client";
import { createBrowserClient } from "@supabase/ssr";

export const supabaseBrowser = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                flowType: "pkce",
                detectSessionInUrl: true,   // 👈 SDK troca ?code= por sessão sozinho
                persistSession: true,
                autoRefreshToken: true,
            },
        }
    );
