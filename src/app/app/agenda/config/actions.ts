"use server";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

export type Consultor = { user_id: string; nome: string | null };

export type Regra = { weekday: number; hora_inicio: string; hora_fim: string };
export type Bloqueio = { id: string; inicio: string; fim: string; motivo: string | null };

export type CalendarioConfig = {
    id: string;
    nome: string;
    especialista_id: string | null;
    slot_min: number;
    antecedencia_min: number;
    horizonte_dias: number;
    public_hash: string | null;
    ativo: boolean;
    regras: Regra[];
    bloqueios: Bloqueio[];
};

function randomHash(len = 10) {
    const chars = "abcdefghijkmnpqrstuvwxyz23456789";
    let s = "";
    for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

export async function listConsultoresAction(): Promise<Consultor[]> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return [];
    const { data } = await supabaseAdmin
        .from("profiles")
        .select("user_id, nome")
        .eq("org_id", me.orgId)
        .order("nome", { ascending: true });
    return (data ?? []) as Consultor[];
}

export async function listCalendariosAction(): Promise<CalendarioConfig[]> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return [];

    const { data: cals } = await supabaseAdmin
        .from("agenda_calendarios")
        .select("id, nome, especialista_id, slot_min, antecedencia_min, horizonte_dias, public_hash, ativo")
        .eq("org_id", me.orgId)
        .order("created_at", { ascending: true });

    const calList = (cals ?? []) as Omit<CalendarioConfig, "regras" | "bloqueios">[];
    if (!calList.length) return [];

    const ids = calList.map((c) => c.id);
    const { data: regras } = await supabaseAdmin
        .from("agenda_regras")
        .select("calendario_id, weekday, hora_inicio, hora_fim")
        .in("calendario_id", ids);
    const { data: bloqueios } = await supabaseAdmin
        .from("agenda_bloqueios")
        .select("id, calendario_id, inicio, fim, motivo")
        .in("calendario_id", ids)
        .order("inicio", { ascending: true });

    return calList.map((c) => ({
        ...c,
        regras: ((regras ?? []) as (Regra & { calendario_id: string })[])
            .filter((r) => r.calendario_id === c.id)
            .map((r) => ({ weekday: r.weekday, hora_inicio: r.hora_inicio, hora_fim: r.hora_fim })),
        bloqueios: ((bloqueios ?? []) as (Bloqueio & { calendario_id: string })[])
            .filter((b) => b.calendario_id === c.id)
            .map((b) => ({ id: b.id, inicio: b.inicio, fim: b.fim, motivo: b.motivo })),
    }));
}

export async function createCalendarioAction(input: {
    nome: string;
    especialista_id: string | null;
    slot_min: number;
    antecedencia_min: number;
    horizonte_dias: number;
}): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sessão inválida." };
    const { error } = await supabaseAdmin.from("agenda_calendarios").insert({
        org_id: me.orgId,
        nome: input.nome.trim() || "Agenda",
        especialista_id: input.especialista_id,
        slot_min: input.slot_min,
        antecedencia_min: input.antecedencia_min,
        horizonte_dias: input.horizonte_dias,
        public_hash: randomHash(),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

export async function updateCalendarioAction(
    id: string,
    patch: Partial<{
        nome: string;
        especialista_id: string | null;
        slot_min: number;
        antecedencia_min: number;
        horizonte_dias: number;
        ativo: boolean;
    }>,
): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sessão inválida." };
    const { error } = await supabaseAdmin
        .from("agenda_calendarios")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("org_id", me.orgId)
        .eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

export async function deleteCalendarioAction(id: string): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sessão inválida." };
    const { error } = await supabaseAdmin
        .from("agenda_calendarios")
        .delete()
        .eq("org_id", me.orgId)
        .eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

export async function saveRegrasAction(
    calendarioId: string,
    regras: Regra[],
): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sessão inválida." };

    // valida faixas
    for (const r of regras) {
        if (!r.hora_inicio || !r.hora_fim || r.hora_inicio >= r.hora_fim) {
            return { ok: false, error: "Faixa de horário inválida (início deve ser antes do fim)." };
        }
    }

    await supabaseAdmin.from("agenda_regras").delete().eq("org_id", me.orgId).eq("calendario_id", calendarioId);
    if (regras.length) {
        const { error } = await supabaseAdmin.from("agenda_regras").insert(
            regras.map((r) => ({
                org_id: me.orgId,
                calendario_id: calendarioId,
                weekday: r.weekday,
                hora_inicio: r.hora_inicio,
                hora_fim: r.hora_fim,
            })),
        );
        if (error) return { ok: false, error: error.message };
    }
    return { ok: true };
}

export async function addBloqueioAction(
    calendarioId: string,
    inicio: string,
    fim: string,
    motivo: string,
): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sessão inválida." };
    if (!inicio || !fim || new Date(inicio) >= new Date(fim)) {
        return { ok: false, error: "Período de bloqueio inválido." };
    }
    const { error } = await supabaseAdmin.from("agenda_bloqueios").insert({
        org_id: me.orgId,
        calendario_id: calendarioId,
        inicio,
        fim,
        motivo: motivo.trim() || null,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

export async function deleteBloqueioAction(id: string): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Sessão inválida." };
    const { error } = await supabaseAdmin.from("agenda_bloqueios").delete().eq("org_id", me.orgId).eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}
