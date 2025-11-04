import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { SectionFX } from "@/components/marketing/SectionFX";
import { AppShell } from "@/components/app/AppShell";

export default async function AppLayout({ children }: { children: ReactNode }) {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    return (
        <div className="relative isolate h-[100dvh] w-full overflow-hidden text-slate-50">
            {/* Background fixo, não rola nunca */}
            <SectionFX preset="mesh" variant="emerald" showGrid className="absolute inset-0 -z-10" />
            <div
                aria-hidden
                className="absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.8'/></svg>\")",
                    backgroundSize: "300px 300px",
                }}
            />

            {/* AppShell controla sidebar/header/main e o espaço do children */}
            <AppShell>{children}</AppShell>
        </div>
    );
}
