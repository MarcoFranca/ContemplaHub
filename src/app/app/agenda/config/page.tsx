export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { CalendarCog, ArrowLeft } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server";
import { Button } from "@/components/ui/button";
import { listCalendariosAction, listConsultoresAction } from "./actions";
import { listFeriadosCustomAction } from "../actions";
import { AgendaConfigClient } from "./AgendaConfigClient";
import { FeriadosConfig } from "./FeriadosConfig";

export default async function AgendaConfigPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    const [calendarios, consultores, feriados] = await Promise.all([
        listCalendariosAction(),
        listConsultoresAction(),
        listFeriadosCustomAction(),
    ]);

    return (
        <div className="h-full overflow-y-auto">
            <main className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-semibold">
                            <CalendarCog className="h-6 w-6 text-emerald-500" />
                            Configurar agendas
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Defina as agendas dos especialistas, os dias e horários disponíveis e os bloqueios. A IA usa isso para oferecer horários aos clientes.
                        </p>
                    </div>
                    <Button asChild variant="ghost" className="gap-1.5">
                        <Link href="/app/agenda">
                            <ArrowLeft className="h-4 w-4" /> Voltar
                        </Link>
                    </Button>
                </div>

                <AgendaConfigClient initialCalendarios={calendarios} consultores={consultores} />

                <FeriadosConfig initial={feriados} />
            </main>
        </div>
    );
}
