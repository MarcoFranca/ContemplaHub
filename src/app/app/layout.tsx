// src/app/app/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Sidebar } from "@/components/app/Sidebar";
import { Header } from "@/components/app/Header";
import { SectionFX } from "@/components/marketing/SectionFX";

export default async function AppLayout({ children }: { children: ReactNode }) {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return (
        <div className="relative min-h-screen text-slate-50 flex">
            {/* fundo mesh cobrindo tudo */}
            <SectionFX
                preset="mesh"
                variant="emerald"
                showGrid
                className="absolute inset-0 -z-10"
            />

            {/* vinheta e textura extras (igual LP) */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.8'/></svg>\")",
                    backgroundSize: "300px 300px",
                }}
            />

            {/* estrutura principal */}
            <Sidebar />
            <div className="flex-1 flex flex-col ml-60 relative z-10">
                <Header />
                <main className="flex-1 px-6 py-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
