// src/app/api/session/route.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions, type CookieMethodsServer } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET() {
    const store = await cookies();

    // Nova API: getAll / setAll
    const cookieMethods: CookieMethodsServer = {
        getAll() {
            // Next retorna objetos Cookie; mapeamos para { name, value }
            return store.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet) {
            // Cada item: { name, value, options }
            for (const { name, value, options } of cookiesToSet) {
                // Next aceita o formato objeto { name, value, ...options }
                store.set({ name, value, ...(options as CookieOptions) });
            }
        },
    };

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ou PUBLISHABLE
        { cookies: cookieMethods }
    );

    const { data } = await supabase.auth.getUser();
    return NextResponse.json({ user: data.user ?? null });
}
