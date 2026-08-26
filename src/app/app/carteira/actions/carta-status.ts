"use server";

import { getBackendUrl } from "@/lib/backend";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

type Res = { ok: boolean; error?: string };

function competenciaAtual() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function hoje() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function postBackend(path: string, body: unknown): Promise<Res> {
    try {
        const supabase = await supabaseServer();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const profile = await getCurrentProfile();
        if (!session?.access_token || !profile?.orgId) return { ok: false, error: "Sessão inválida." };
        const res = await fetch(`${getBackendUrl()}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Org-Id": profile.orgId,
                Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const t = await res.text().catch(() => "");
            // tenta extrair o "detail" do FastAPI
            let msg = t;
            try {
                msg = JSON.parse(t)?.detail ?? t;
            } catch {
                /* mantém texto cru */
            }
            return { ok: false, error: msg || `Erro ${res.status}` };
        }
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Falha." };
    }
}

export async function contemplarCartaAction(
    cotaId: string,
    motivo: "sorteio" | "lance" | "outro",
    data?: string,
): Promise<Res> {
    return postBackend(`/lances/cartas/${cotaId}/contemplar`, {
        data: data || hoje(),
        motivo,
        lance_percentual: null,
        competencia: competenciaAtual(),
    });
}

export async function cancelarCartaAction(cotaId: string, observacoes?: string): Promise<Res> {
    return postBackend(`/lances/cartas/${cotaId}/cancelar`, {
        competencia: competenciaAtual(),
        observacoes: observacoes?.trim() || null,
    });
}

export async function reativarCartaAction(cotaId: string): Promise<Res> {
    return postBackend(`/lances/cartas/${cotaId}/reativar`, {});
}
