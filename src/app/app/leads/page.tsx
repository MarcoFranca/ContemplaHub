import { KanbanBoard, CreateLeadDialog } from "./ui";
import {
    listLeadsForKanban,
    moveLeadStage,
    listContractOptions,
    type Stage,
    type LeadCard,
    getKanbanMetricsFromDB,
} from "./actions";
import { getCurrentProfile } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STAGES: Stage[] = [
    "novo",
    "diagnostico",
    "proposta",
    "negociacao",
    "contrato",
    "ativo",
    "perdido",
];

/** type guard para Stage */
function isStage(v: string): v is Stage {
    return STAGES.includes(v as Stage);
}

/** normaliza valores vindos do BD/legado para um Stage válido */
function normalizeStage(raw: string | null | undefined): Stage {
    const s = (raw ?? "").toString().toLowerCase();
    if (s === "fechamento") return "contrato";          // mapeia legado -> novo
    return isStage(s) ? (s as Stage) : "novo";          // fallback defensivo
}

/** agrupa leads por etapa já normalizada */
function columnsByStage(rows: LeadCard[]) {
    const cols = STAGES.reduce<Record<Stage, LeadCard[]>>(
        (acc, s) => ((acc[s] = []), acc),
        {} as any
    );
    for (const l of rows) {
        const etapa = normalizeStage((l as any).etapa);
        cols[etapa].push({ ...l, etapa });
    }
    return cols;
}

export default async function LeadsKanbanPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) {
        return (
            <div className="h-full p-6 overflow-auto">
                Vincule-se a uma organização para acessar os leads.
            </div>
        );
    }

    // 1) Dados dos cards
    const rows = await listLeadsForKanban({ showActive: true, showLost: true, scope: "me" });
    const columns = columnsByStage(rows as LeadCard[]);

    // 2) Métricas do Kanban (RPC get_kanban_metrics)
    const metrics = await getKanbanMetricsFromDB();

    // 3) Opções para o Drawer de contrato
    const contractOptions = await listContractOptions();

    // 4) Handler de movimento (nada de comparar com "fechamento")
    async function onMove(leadId: string, to: Stage) {
        "use server";
        // `to` já é Stage; se em algum ponto vier algo legado, trate no backend/migration.
        await moveLeadStage({ leadId, to });
    }

    return (
        <div className="h-full w-full overflow-hidden px-4 md:px-6 py-4">
            <CreateLeadDialog variant="fab" />
            <div className="h-full">
                <KanbanBoard
                    initialColumns={columns}
                    stages={STAGES}
                    onMove={onMove}
                    contractOptions={contractOptions}
                    metrics={{
                        avgDays: metrics?.avgDays as Partial<Record<Stage, number>>,
                        conversion: metrics?.conversion as Partial<Record<Stage, number>>,
                    }}
                />
            </div>
        </div>
    );
}
