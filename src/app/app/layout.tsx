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
        <div
            className="
        relative isolate h-[100dvh] w-full overflow-hidden
        bg-background text-foreground
        dark:text-slate-50
      "
        >
            {/* Background fixo, não rola nunca */}
            {/* Background: só forte no dark, suave/light no claro */}
            <SectionFX
                preset="mesh"
                variant="emerald"
                showGrid
                className="absolute inset-0 -z-10 dark:opacity-100 opacity-60"
            />
            <div
                aria-hidden
                className="absolute inset-0 -z-10 mix-blend-overlay
                   dark:opacity-[0.05] opacity-0"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg ...></svg>\")",
                    backgroundSize: "300px 300px",
                }}
            />

            {/* AppShell controla sidebar/header/main e o espaço do children */}
            <AppShell>{children}</AppShell>
        </div>
    );
}
