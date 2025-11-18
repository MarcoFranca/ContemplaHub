// src/app/app/leads/metrics-actions.ts
"use server";

import { getCurrentProfile } from "@/lib/auth/server";
import { backendFetch } from "@/lib/backend";

export interface KanbanMetrics {
    avgDays?: Record<string, number>;
    conversion?: Record<string, number>;
    diagCompletionPct?: Record<string, number>;
    readinessAvg?: Record<string, number>;
    tFirstContactAvgMin?: Record<string, number>;
    raw?: unknown;
}

export async function getKanbanMetricsFromDB(): Promise<KanbanMetrics> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error("Org inválida");

    const data = await backendFetch(`/kanban/metrics`, {
        method: "GET",
        orgId: profile.orgId,
    });

    const raw = (data as any)?.raw;
    const rows: any[] = Array.isArray(raw?.rows) ? raw.rows : [];

    const avgDays: Record<string, number> = {};
    const conversion: Record<string, number> = {};
    const diagCompletionPct: Record<string, number> = {};
    const readinessAvg: Record<string, number> = {};
    const tFirstContactAvgMin: Record<string, number> = {};

    for (const r of rows) {
        const etapa = r.etapa as string;
        if (!etapa) continue;
        if (typeof r.avgDays === "number") avgDays[etapa] = r.avgDays;
        if (typeof r.conversion === "number") conversion[etapa] = r.conversion;
        if (typeof r.diagnosticCompletionPct === "number")
            diagCompletionPct[etapa] = r.diagnosticCompletionPct;
        if (typeof r.readinessAvg === "number")
            readinessAvg[etapa] = r.readinessAvg;
        if (typeof r.tFirstContactAvgMin === "number")
            tFirstContactAvgMin[etapa] = r.tFirstContactAvgMin;
    }

    return {
        avgDays,
        conversion,
        diagCompletionPct,
        readinessAvg,
        tFirstContactAvgMin,
        raw,
    };
}


