// src/app/app/leads/metrics-actions.ts
"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/server";
import type { KanbanMetrics, Stage, MetricsByStage } from "./types";

export async function getKanbanMetricsFromDB(): Promise<KanbanMetrics | null> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) return null;

    const supabase = await supabaseServer();

    const { data, error } = await supabase
        .rpc("get_kanban_metrics", { p_org: profile.orgId })
        .throwOnError(); // se preferir, remove e trata manualmente

    if (error) {
        console.error("getKanbanMetricsFromDB error:", error);
        return null;
    }

    // data pode vir:
    // - como array de linhas: [{ etapa, avgDays, ... }]
    // - ou como { rows: [...] }
    const rows: any[] = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.rows)
            ? (data as any).rows
            : [];

    if (!rows.length) {
        return {
            avgDays: {},
            conversion: {},
            diagCompletionPct: {},
            readinessAvg: {},
            tFirstContactAvgMin: {},
            raw: data,
        };
    }

    const avgDays: MetricsByStage = {};
    const conversion: MetricsByStage = {};
    const diagCompletionPct: MetricsByStage = {};
    const readinessAvg: MetricsByStage = {};
    const tFirstContactAvgMin: MetricsByStage = {};

    for (const r of rows) {
        const etapa = r.etapa as Stage;
        if (!etapa) continue;

        if (r.avgDays != null) avgDays[etapa] = Number(r.avgDays);
        if (r.conversion != null) conversion[etapa] = Number(r.conversion);
        if (r.readinessAvg != null) readinessAvg[etapa] = Number(r.readinessAvg);
        if (r.tFirstContactAvgMin != null)
            tFirstContactAvgMin[etapa] = Number(r.tFirstContactAvgMin);
        if (r.diagnosticCompletionPct != null)
            diagCompletionPct[etapa] = Number(r.diagnosticCompletionPct);
    }

    return {
        avgDays,
        conversion,
        diagCompletionPct,
        readinessAvg,
        tFirstContactAvgMin,
        raw: rows,
    };
}
