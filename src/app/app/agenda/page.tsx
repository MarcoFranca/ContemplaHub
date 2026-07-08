export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { CalendarDays, CalendarCog } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server";
import { Button } from "@/components/ui/button";
import { loadAgendamentosAction } from "./actions";
import { AgendaClient } from "./AgendaClient";

export default async function AgendaPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    const agendamentos = await loadAgendamentosAction();

    return (
        <div className="h-full overflow-hidden">
            <main className="mx-auto flex h-full max-w-5xl flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-semibold">
                            <CalendarDays className="h-6 w-6 text-emerald-500" />
                            Agenda
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Reuniões agendadas com os leads. A IA marca automaticamente quando o cliente aceita falar com um especialista.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="gap-1.5">
                        <Link href="/app/agenda/config">
                            <CalendarCog className="h-4 w-4" /> Configurar
                        </Link>
                    </Button>
                </div>

                <AgendaClient initial={agendamentos} />
            </main>
        </div>
    );
}
