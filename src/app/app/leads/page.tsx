import { KanbanBoard, CreateLeadDialog, CreateContractDialog } from "./ui";
import { listLeadsForKanban, moveLeadStage, listContractOptions, type Stage, type LeadCard } from "./actions";
import { getCurrentProfile } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STAGES: Stage[] = ["novo","diagnostico","proposta","negociacao","fechamento","ativo","perdido"];

export default async function LeadsKanbanPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) {
        return <div className="h-full p-6 overflow-auto">Vincule-se a uma organização para acessar os leads.</div>;
    }

    const rows = await listLeadsForKanban();
    const columns = STAGES.reduce<Record<Stage, LeadCard[]>>((acc, s) => { acc[s] = []; return acc; }, {} as any);
    rows.forEach((l) => columns[l.etapa as Stage].push(l));

    const contractOptions = await listContractOptions();

    return (
        // wrapper do children: ele SIM rola (vertical e horizontal)
        <div className="h-full w-full overflow-hidden px-4 md:px-6 py-4">
            <CreateLeadDialog variant="fab"/>
            <div className="h-full">
                <KanbanBoard
                    initialColumns={columns as any}
                    stages={STAGES}
                    onMove={async (leadId, to) => {
                        "use server";
                        await moveLeadStage({ leadId, to });
                    }}
                    contractOptions={contractOptions} // { administradoras: [...] }
                />
            </div>
        </div>
    );
}
