"use server";

import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";

/** Client com Service Role */
function srv() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

/** Formato final consumido pelo front */
export type CarteiraItem = {
    contratoId: string;
    cotaId: string;
    leadId: string;

    nome: string;
    telefone: string | null;

    administradora: string | null;
    valorCarta: number | null;

    status: string;
    dataAssinatura: string | null;
};

export type ListCarteiraArgs = {
    status?: string;            // pendente_assinatura | pendente_pagamento | alocado | cancelado
    orderBy?: "data_assinatura" | "valor_carta";
    asc?: boolean;
    limit?: number;
    offset?: number;
};

/**
 * Lista a carteira REAL baseada em CONTRATOS.
 * Junta: contratos → cotas → administradoras → leads
 */
export async function listCarteira(
    args: ListCarteiraArgs = {}
): Promise<CarteiraItem[]> {

    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    const s = srv();

    const orderCol = args.orderBy ?? "data_assinatura";
    const asc = !!args.asc;

    let q = s
        .from("contratos")
        .select(`
    id,
    status,
    data_assinatura,
    cota_id,
    cotas (
      id,
      valor_carta,
      administradora_id,
      lead_id,
      administradoras (nome),
      leads (nome, telefone)
    )
  `)
        .eq("org_id", me.orgId)
        .order(orderCol, { ascending: asc });

// 🔹 Se não passar filtro explícito, só mostra o que faz sentido na carteira
    if (args.status) {
        q = q.eq("status", args.status);
    } else {
        q = q.in("status", ["pendente_pagamento", "alocado"]);
    }

    const { data, error } = await q;
    if (error) throw error;

    const rows = (data ?? []) as any[];

    return rows.map<CarteiraItem>((r: any) => {
        // Supabase às vezes devolve objeto, às vezes array pra relação.
        const cotaRaw = r.cotas;
        const cota = Array.isArray(cotaRaw) ? cotaRaw[0] : cotaRaw;

        const admRaw = cota?.administradoras;
        const administradora = Array.isArray(admRaw) ? admRaw[0] : admRaw;

        const leadRaw = cota?.leads;
        const lead = Array.isArray(leadRaw) ? leadRaw[0] : leadRaw;

        return {
            contratoId: r.id,
            cotaId: cota?.id ?? "",
            leadId: cota?.lead_id ?? "",

            nome: lead?.nome ?? "—",
            telefone: lead?.telefone ?? null,

            administradora: administradora?.nome ?? null,
            valorCarta: cota?.valor_carta ?? null,

            status: r.status,
            dataAssinatura: r.data_assinatura ?? null,
        };
    });
}
