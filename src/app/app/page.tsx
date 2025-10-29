// src/app/app/page.tsx
import { supabaseServer } from "@/lib/supabase/server";

export default async function AppHome() {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold">Painel</h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.email}</p>
            {/* Aqui depois colocamos cards (Leads, Assembleias, etc.) */}
        </main>
    );
}
