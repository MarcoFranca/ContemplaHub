// src/app/partner/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentPartnerAccess } from "@/lib/auth/partner-server";
import { PartnerShell } from "@/components/partner/PartnerShell";

export default async function PartnerLayout({
                                                children,
                                            }: {
    children: ReactNode;
}) {
    const supabase = await supabaseServer();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const partner = await getCurrentPartnerAccess();
    if (!partner) {
        redirect("/app");
    }

    return (
        <PartnerShell partnerName={partner.nome}>
            {children}
        </PartnerShell>
    );
}