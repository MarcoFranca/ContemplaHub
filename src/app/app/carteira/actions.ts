// src/app/app/carteira/actions.ts
"use server";

import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";

/** Client com Service Role para rodar no server (honra RLS nas policies) */
function srv() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

/** Tipos retornados pelo SELECT aninhado do Supabase */
type RowCon = {
    motivo: string | null;
    data: string | null;
    assembleia: { data: string | null } | null;
};

type Row = {
    id: string;
    valor_carta: string | null;
    situacao: string | null;
    created_at: string | null;
    administradora: { nome: string | null } | null;
    lead: { nome: string | null; telefone: string | null } | null;
    contemplacoes: RowCon[] | null; // pode vir array
};

/** Objeto final que o front consome */
export type CarteiraItem = {
    id: string;
    nome: string;
    telefone: string | null;
    administradora: string | null;
    valorCarta: string | null;
    status: string;
    motivo: string | null;
    assembleia: string | null; // pt-BR (DD/MM/AAAA) se existir
    createdAt: string | null;  // ISO vindo do BD
};

export type ListCarteiraArgs = {
    /** filtra situacao: "ativa" | "contemplada" | "quitada" | "cancelada" */
    situacao?: string;
    /** ordenação; default: created_at desc */
    orderBy?: "created_at" | "valor_carta";
    asc?: boolean;
    /** paginação opcional */
    limit?: number;
    offset?: number;
};

/**
 * Lista a carteira (cotas) da organização do usuário atual.
 * - Junta: administradora, lead, e (se existir) a contemplação com assembleia.
 * - Não usa colunas inexistentes (ex.: cotas.assembleia_id).
 */
export async function listCarteira(args: ListCarteiraArgs = {}): Promise<CarteiraItem[]> {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    const s = srv();

    const orderCol = args.orderBy ?? "created_at";
    const asc = !!args.asc;

    let q = s
        .from("cotas")
        .select(`
      id,
      valor_carta,
      situacao,
      created_at,
      administradora:administradoras(nome),
      lead:leads(nome, telefone),
      contemplacoes(
        motivo,
        data,
        assembleia:assembleias(data)
      )
    `)
        .eq("org_id", me.orgId)
        .order(orderCol, { ascending: asc });

    if (args.situacao) q = q.eq("situacao", args.situacao);

    if (typeof args.limit === "number" && typeof args.offset === "number") {
        q = q.range(args.offset, args.offset + args.limit - 1);
    } else if (typeof args.limit === "number") {
        q = q.limit(args.limit);
    }

    const { data, error } = await q;
    if (error) throw error;

    // ⚠️ Cast controlado do retorno sem genérico em .select(...)
    const rows = (data ?? []) as unknown as Row[];

    return rows.map<CarteiraItem>((r) => {
        // contemplacoes pode vir como array; pegamos a primeira (há UNIQUE por cota)
        const c = Array.isArray(r.contemplacoes) && r.contemplacoes.length > 0 ? r.contemplacoes[0] : null;
        const dtAsm = c?.assembleia?.data ?? null;

        return {
            id: r.id,
            nome: r.lead?.nome ?? "—",
            telefone: r.lead?.telefone ?? null,
            administradora: r.administradora?.nome ?? null,
            valorCarta: r.valor_carta ?? null,
            status: r.situacao ?? "ativa",
            motivo: c?.motivo ?? null,
            assembleia: dtAsm ? new Date(dtAsm).toLocaleDateString("pt-BR") : null,
            createdAt: r.created_at ?? null,
        };
    });
}
