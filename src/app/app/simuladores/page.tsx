export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getCurrentProfile } from "@/lib/auth/server";
import { Calculator } from "lucide-react";
import { SimuladoresHub } from "./components/SimuladoresHub";

export default async function SimuladoresPage() {
    const me = await getCurrentProfile();

    if (!me?.orgId) {
        return <main className="p-6">Vincule-se a uma organização.</main>;
    }

    return (
        <main className="h-full space-y-4 overflow-y-auto p-4 sm:p-6">
            <div>
                <h1 className="inline-flex items-center gap-2 text-xl font-semibold">
                    <Calculator className="h-5 w-5 text-emerald-400" />
                    Simuladores
                </h1>
                <p className="text-sm text-muted-foreground">
                    Ferramentas para apoiar a estratégia de lance e o fechamento com o cliente.
                </p>
            </div>

            <SimuladoresHub />
        </main>
    );
}
