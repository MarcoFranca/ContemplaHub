import { redirect } from "next/navigation";
import { Calculator } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentPartnerAccess } from "@/lib/auth/partner-server";
import { SimuladoresHub } from "@/app/app/simuladores/components/SimuladoresHub";

export const dynamic = "force-dynamic";

export default async function PartnerSimuladoresPage() {
    const supabase = await supabaseServer();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const partner = await getCurrentPartnerAccess();
    if (!partner) redirect("/app");

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Ferramentas
                </p>
                <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                    <Calculator className="h-6 w-6 text-emerald-400" />
                    Simuladores
                </h1>
                <p className="text-sm text-muted-foreground">
                    Simule estratégias de lance e compare consórcio com financiamento.
                </p>
            </div>

            <SimuladoresHub />
        </div>
    );
}
