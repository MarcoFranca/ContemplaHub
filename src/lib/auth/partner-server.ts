// src/lib/auth/partner-server.ts
"use server";

import { supabaseServer } from "@/lib/supabase/server";

export type CurrentPartnerAccess = {
    partnerUserId: string;
    userId: string;
    orgId: string;
    parceiroId: string;
    email: string | null;
    nome: string | null;
    telefone: string | null;
    ativo: boolean;
    canViewClientData: boolean;
    canViewContracts: boolean;
    canViewCommissions: boolean;
};

export async function getCurrentPartnerAccess(): Promise<CurrentPartnerAccess | null> {
    const supabase = await supabaseServer();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const { data, error: partnerErr } = await supabase
        .from("partner_users")
        .select(`
      id,
      auth_user_id,
      org_id,
      parceiro_id,
      email,
      nome,
      telefone,
      ativo,
      can_view_client_data,
      can_view_contracts,
      can_view_commissions
    `)
        .eq("auth_user_id", user.id)
        .eq("ativo", true)
        .maybeSingle();

    if (partnerErr || !data) return null;

    return {
        partnerUserId: data.id as string,
        userId: data.auth_user_id as string,
        orgId: data.org_id as string,
        parceiroId: data.parceiro_id as string,
        email: (data.email ?? null) as string | null,
        nome: (data.nome ?? null) as string | null,
        telefone: (data.telefone ?? null) as string | null,
        ativo: Boolean(data.ativo),
        canViewClientData: Boolean(data.can_view_client_data),
        canViewContracts: Boolean(data.can_view_contracts),
        canViewCommissions: Boolean(data.can_view_commissions),
    };
}

export async function isCurrentUserPartner() {
    const partner = await getCurrentPartnerAccess();
    return Boolean(partner);
}