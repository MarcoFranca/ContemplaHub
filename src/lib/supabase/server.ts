// src/lib/supabase/server.ts (essencial: setAll implementado)
import { cookies } from "next/headers";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";

export const supabaseServer = async () => {
    const store = await cookies();

    const cookieMethods: CookieMethodsServer = {
        getAll() {
            return store.getAll().map((c: { name: string; value: string }) => ({
                name: c.name,
                value: c.value,
            }));
        },
        setAll(cookiesToSet) {
            try {
                cookiesToSet.forEach(({ name, value, options }) => {
                    store.set({ name, value, ...options });
                });
            } catch {
                // Em RSC puro não pode escrever cookies → no-op silencioso
            }
        },
    };

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: cookieMethods }
    );
};
