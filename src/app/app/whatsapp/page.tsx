export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { MessageCircle } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server";
import {
    getWhatsappConfigAction,
    getWhatsappIntegrationAction,
    getWhatsappTemplateAction,
} from "./actions";
import { WhatsappManager } from "./components/WhatsappManager";

export default async function WhatsappPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    const [config, integration, template] = await Promise.all([
        getWhatsappConfigAction(),
        getWhatsappIntegrationAction(),
        getWhatsappTemplateAction(),
    ]);

    return (
        <div className="h-full overflow-y-auto">
            <main className="mx-auto max-w-3xl space-y-6 p-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Configurações
                    </p>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold">
                        <MessageCircle className="h-6 w-6 text-emerald-500" />
                        WhatsApp
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Conecte a conta oficial do WhatsApp e configure a mensagem automática de boas-vindas
                        enviada a cada lead novo.
                    </p>
                </div>

                <WhatsappManager config={config} integration={integration} template={template} />
            </main>
        </div>
    );
}
