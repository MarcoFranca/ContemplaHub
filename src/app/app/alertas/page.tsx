export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { BellRing } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server";
import { listAlertasPendentesAction } from "@/app/app/carteira/actions/alertas";
import { AlertasClient } from "./AlertasClient";

export default async function AlertasPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    const alertas = await listAlertasPendentesAction();

    return (
        <div className="h-full overflow-y-auto">
            <main className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold">
                        <BellRing className="h-6 w-6 text-amber-400" />
                        Alertas
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Lembretes das cartas. O que vence hoje ou está atrasado aparece no topo.
                    </p>
                </div>

                <AlertasClient initial={alertas} />
            </main>
        </div>
    );
}
