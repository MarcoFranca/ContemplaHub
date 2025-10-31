// src/app/app/leads/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { listLeadsForKanban, type Stage, moveLeadStage } from "./actions";
import KanbanBoard from "./ui/KanbanBoard";
import { getCurrentProfile } from "@/lib/auth/server";

const STAGES: Stage[] = ["novo","diagnostico","proposta","negociacao","fechamento","ativo","perdido"];

export default async function LeadsKanbanPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) {
        return <main className="p-6">Vincule-se a uma organização para acessar os leads.</main>;
    }

    const rows = await listLeadsForKanban();

    // agrupa em colunas
    const columns: Record<Stage, any[]> = Object.fromEntries(STAGES.map(s => [s, []])) as any;
    rows.forEach((l: any) => columns[l.etapa as Stage]?.push(l));

    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Leads — Kanban</h1>
            <KanbanBoard
                initialColumns={columns}
                stages={STAGES}
                onMove={async (leadId, to) => {
                    "use server";
                    await moveLeadStage({ leadId, to });
                }}
            />
        </main>
    );
}
