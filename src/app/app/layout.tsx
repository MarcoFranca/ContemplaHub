// src/app/(app)/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: ReactNode }) {
    const supabase = await supabaseServer(); // ✅ aguarde o client
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return <div className="min-h-dvh">{children}</div>;
}
