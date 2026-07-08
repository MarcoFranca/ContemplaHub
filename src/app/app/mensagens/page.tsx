export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { MessageCircle } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server";
import { loadConversationsAction, loadAiFalhasAction } from "./actions";
import { MensagensClient } from "./MensagensClient";
import { AiFalhasBanner } from "./AiFalhasBanner";

export default async function MensagensPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    const [conversations, falhas] = await Promise.all([
        loadConversationsAction(),
        loadAiFalhasAction(),
    ]);

    return (
        <div className="h-full overflow-hidden">
            <main className="mx-auto flex h-full max-w-6xl flex-col gap-4 p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold">
                        <MessageCircle className="h-6 w-6 text-emerald-500" />
                        Mensagens
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Central de conversas do WhatsApp. Acompanhe e responda os leads em um só lugar.
                    </p>
                </div>

                <AiFalhasBanner falhas={falhas} />

                <MensagensClient initial={conversations} />
            </main>
        </div>
    );
}
