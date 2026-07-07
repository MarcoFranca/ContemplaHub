export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { Building2 } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server";
import { listAdministradorasAction } from "./actions";
import { OperadorasManager } from "./components/OperadorasManager";

export default async function OperadorasPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    const operadoras = await listAdministradorasAction();

    return (
        <div className="h-full overflow-y-auto">
            <main className="space-y-6 p-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Configurações
                    </p>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold">
                        <Building2 className="h-6 w-6 text-emerald-500" />
                        Operadoras
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        As operadoras globais já vêm cadastradas. Você pode adicionar as suas e personalizar uma
                        global (isso cria uma versão só da sua organização, sem afetar as demais).
                    </p>
                </div>

                <OperadorasManager initial={operadoras} />
            </main>
        </div>
    );
}
