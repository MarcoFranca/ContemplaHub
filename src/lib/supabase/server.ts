// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";

export const supabaseServer = async () => {
    const store = await cookies();

    const cookieMethods: CookieMethodsServer = {
        getAll() {
            // Tipagem explícita para evitar TS7006
            return store.getAll().map((c: { name: string; value: string }) => ({
                name: c.name,
                value: c.value,
            }));
        },
        setAll() {
            // Em RSC não escrevemos cookies (no-op)
        },
    };

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: cookieMethods }
    );
};
