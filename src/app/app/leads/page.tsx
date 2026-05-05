// page.tsx

import { KanbanBoard } from "./ui";
import {
    listLeadsForKanban,
    moveLeadStage,
    listContractOptions,
    type Stage,
    type LeadCard,
} from "./actions";
import { LeadsToolbar } from "./ui/LeadsToolbar";
import { getCurrentProfile } from "@/lib/auth/server";
import { getKanbanMetricsFromDB } from "./metrics-actions";
import { ALL_KANBAN_STAGES, PRIMARY_KANBAN_STAGES } from "./types";
import type { KanbanMetrics } from "./types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isStage(v: string): v is Stage {
    const all: Stage[] = [
        "novo",
        "tentativa_contato",
        "contato_realizado",
        "diagnostico",
        "proposta",
        "negociacao",
        "contrato",
        "pos_venda",
        "frio",
        "perdido",
    ];
    return all.includes(v as Stage);
}

function normalizeStage(raw: string | null | undefined): Stage {
    const s = (raw ?? "").toString().toLowerCase();
    if (s === "fechamento") return "contrato";
    if (s === "contato") return "contato_realizado";
    if (s === "ativo") return "pos_venda";
    return isStage(s) ? (s as Stage) : "novo";
}

function columnsByStage(rows: LeadCard[], stages: Stage[]) {
    const cols = stages.reduce<Record<Stage, LeadCard[]>>((acc, s) => {
        acc[s] = [];
        return acc;
    }, {} as Record<Stage, LeadCard[]>);

    for (const l of rows) {
        const etapa = normalizeStage(l.etapa);
        if (!cols[etapa]) continue;
        cols[etapa].push({ ...l, etapa });
    }
    return cols;
}

type PageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeadsKanbanPage(props: PageProps) {
    const me = await getCurrentProfile();
    if (!me?.orgId) {
        return (
            <div className="h-full p-6 overflow-auto">
                Vincule-se a uma organização para acessar os leads.
            </div>
        );
    }

    const sp = await props.searchParams;

    const getFlag = (key: string) => {
        const v = sp?.[key];
        if (Array.isArray(v)) return v.includes("1");
        return v === "1";
    };

    const showActive = getFlag("ativos");
    const showLost = getFlag("perdidos");
    const showCold = getFlag("frios");

    const STAGES: Stage[] = [
        ...PRIMARY_KANBAN_STAGES,
        ...(showActive ? (["pos_venda"] as const) : []),
        ...(showCold ? (["frio"] as const) : []),
        ...(showLost ? (["perdido"] as const) : []),
    ];

    const rows = await listLeadsForKanban({ showActive, showLost, showCold, scope: "me" });
    const columns = columnsByStage(rows as LeadCard[], ALL_KANBAN_STAGES);

    const metrics: KanbanMetrics | null = await getKanbanMetricsFromDB();

    const contractOptions = await listContractOptions();

    async function onMove(leadId: string, to: Stage, reason?: string) {
        "use server";
        await moveLeadStage({ leadId, to, reason });
    }

    return (
        <div className="h-full w-full overflow-hidden px-4 md:px-6 py-4">

            <div className="h-full">
                <KanbanBoard
                    initialColumns={columns}
                    stages={STAGES}
                    onMove={onMove}
                    contractOptions={contractOptions}
                    metrics={metrics ?? undefined}
                />
            </div>
        </div>
    );
}
