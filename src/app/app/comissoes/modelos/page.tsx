export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { Layers } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server";
import { listModelosComissaoAction } from "../actions";
import { ModelosManager } from "../components/ModelosManager";

export default async function ModelosComissaoPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    const modelos = await listModelosComissaoAction().catch(() => []);

    return (
        <div className="h-full overflow-y-auto">
            <main className="space-y-6 p-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Comissões
                    </p>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold">
                        <Layers className="h-6 w-6 text-emerald-500" />
                        Modelos de comissão
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Cadastre campanhas com as parcelas e o percentual de cada mês. Ao configurar a
                        comissão de uma carta, selecione o modelo e as regras já entram preenchidas.
                    </p>
                </div>

                <ModelosManager initialModelos={modelos} />
            </main>
        </div>
    );
}
