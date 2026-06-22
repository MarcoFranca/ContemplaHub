import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";
import { getPendencias } from "./get-pendencias";

export type SidebarBadges = Record<string, number>;

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

/**
 * Contadores exibidos como badges no Sidebar, indexados pelo href do item de navegação.
 * - `/app/pendencias` (total) e `/app/pendencias?cat=<categoria>` (por subcategoria)
 * - `/app/lances` (lances em aberto do mês vigente)
 */
export async function getSidebarBadges(): Promise<SidebarBadges> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) return {};
    const orgId = profile.orgId;
    const supa = getAdminClient();

    const badges: SidebarBadges = {};

    // Pendências (reusa a mesma fonte da página/painel)
    const pend = await getPendencias();
    if (pend) {
        badges["/app/pendencias"] = pend.total;
        const countByCat: Record<string, number> = {};
        for (const g of pend.grupos) {
            badges[`/app/pendencias?cat=${g.categoria}`] = g.items.length;
            countByCat[g.categoria] = g.items.length;
        }

        // Pendências de comissões no item Comissões (e no subitem Repasses)
        const comissoes =
            (countByCat["contrato_sem_lancamento"] ?? 0) +
            (countByCat["comissao_inadimplente"] ?? 0) +
            (countByCat["repasse_pendente"] ?? 0);
        if (comissoes > 0) badges["/app/comissoes"] = comissoes;
        if ((countByCat["repasse_pendente"] ?? 0) > 0) {
            badges["/app/comissoes?tab=repasses"] = countByCat["repasse_pendente"];
        }
    }

    // Lances em aberto no mês vigente = cotas ativas que ainda não foram
    // resolvidas (feito/sorteio) na competência atual.
    const now = new Date();
    const competencia = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const [cotasRes, resolvidasRes] = await Promise.all([
        supa.from("cotas").select("id").eq("org_id", orgId).eq("status", "ativa"),
        supa
            .from("cota_lance_competencias")
            .select("cota_id")
            .eq("org_id", orgId)
            .eq("competencia", competencia)
            .in("status_mes", ["feito", "sem_lance"]),
    ]);

    const ativas = new Set((cotasRes.data ?? []).map((c) => c.id));
    const resolvidas = new Set(
        (resolvidasRes.data ?? []).map((r) => r.cota_id).filter((id) => ativas.has(id))
    );
    badges["/app/lances"] = Math.max(ativas.size - resolvidas.size, 0);

    return badges;
}
