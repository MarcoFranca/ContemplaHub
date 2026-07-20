export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { Megaphone } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server";
import { listCampanhasAction } from "./actions";
import { CampanhasClient } from "./CampanhasClient";

export default async function CampanhasPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    const campanhas = await listCampanhasAction();

    return (
        <div className="h-full overflow-y-auto">
            <main className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold">
                        <Megaphone className="h-6 w-6 text-emerald-500" />
                        Campanhas
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Condições que o agente de IA usa nas estimativas (taxa de administração, redutor e fundo de reserva). Sem nenhuma campanha ativa, o sistema usa o padrão (20% / 30% / 2%). A operadora não é revelada ao cliente.
                    </p>
                </div>

                <CampanhasClient initial={campanhas} />
            </main>
        </div>
    );
}
