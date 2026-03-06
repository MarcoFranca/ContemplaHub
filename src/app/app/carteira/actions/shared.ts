"use server";

import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";
import { contains, norm, pickLatestByCreatedAt } from "../lib/format";
import type {
    AdministradoraRow,
    CarteiraFilters,
    CarteiraRow,
    CarteiraUniverse,
    ContratoRow,
    CotaRow,
    LeadRow,
} from "../lib/types";

function srv() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

export async function loadCarteiraUniverse(
    filters: CarteiraFilters = {}
): Promise<CarteiraUniverse> {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    const s = srv();

    let carteiraQuery = s
        .from("carteira_clientes")
        .select("id, org_id, lead_id, status, origem_entrada, entered_at, observacoes")
        .eq("org_id", me.orgId)
        .order("entered_at", { ascending: false });

    if (!filters.include_all) {
        carteiraQuery = carteiraQuery.eq("status", "ativo");
    }

    if (filters.status_carteira) {
        carteiraQuery = carteiraQuery.eq("status", filters.status_carteira);
    }

    const { data: carteiraData, error: carteiraError } = await carteiraQuery;
    if (carteiraError) throw carteiraError;

    const carteiraRows = (carteiraData ?? []) as CarteiraRow[];
    if (carteiraRows.length === 0) {
        return {
            carteiraRows: [],
            leadsMap: new Map<string, LeadRow>(),
            cotasByLead: new Map<string, CotaRow[]>(),
            latestContratoByCota: new Map<string, ContratoRow>(),
            administradorasMap: new Map<string, AdministradoraRow>(),
        };
    }

    const leadIds = [...new Set(carteiraRows.map((r) => r.lead_id).filter(Boolean))];

    const { data: leadsData, error: leadsError } = await s
        .from("leads")
        .select("id, nome, telefone, email, etapa")
        .in("id", leadIds);

    if (leadsError) throw leadsError;

    const leadsRows = (leadsData ?? []) as LeadRow[];
    const leadsMap = new Map<string, LeadRow>(leadsRows.map((lead) => [lead.id, lead]));

    const q = norm(filters.q);

    const filteredCarteiraRows = carteiraRows.filter((row) => {
        const lead = leadsMap.get(row.lead_id);
        if (!lead) return false;

        return (
            !q ||
            contains(lead.nome, q) ||
            contains(lead.telefone, q) ||
            contains(lead.email, q)
        );
    });

    if (filteredCarteiraRows.length === 0) {
        return {
            carteiraRows: [],
            leadsMap,
            cotasByLead: new Map<string, CotaRow[]>(),
            latestContratoByCota: new Map<string, ContratoRow>(),
            administradorasMap: new Map<string, AdministradoraRow>(),
        };
    }

    const filteredLeadIds = [...new Set(filteredCarteiraRows.map((r) => r.lead_id))];

    const { data: cotasData, error: cotasError } = await s
        .from("cotas")
        .select(
            "id, org_id, lead_id, administradora_id, numero_cota, grupo_codigo, produto, valor_carta, valor_parcela, prazo, autorizacao_gestao, created_at"
        )
        .eq("org_id", me.orgId)
        .in("lead_id", filteredLeadIds);

    if (cotasError) throw cotasError;

    let cotasRows = (cotasData ?? []) as CotaRow[];

    if (filters.produto) {
        cotasRows = cotasRows.filter((c) => c.produto === filters.produto);
    }

    const cotasByLead = new Map<string, CotaRow[]>();
    for (const cota of cotasRows) {
        if (!cota.lead_id) continue;
        const arr = cotasByLead.get(cota.lead_id) ?? [];
        arr.push(cota);
        cotasByLead.set(cota.lead_id, arr);
    }

    const cotaIds = [...new Set(cotasRows.map((c) => c.id))];
    const administradoraIds = [
        ...new Set(cotasRows.map((c) => c.administradora_id).filter(Boolean) as string[]),
    ];

    let contratosRows: ContratoRow[] = [];
    if (cotaIds.length > 0) {
        const { data: contratosData, error: contratosError } = await s
            .from("contratos")
            .select(
                "id, org_id, cota_id, numero, status, data_assinatura, data_pagamento, data_alocacao, data_contemplacao, created_at"
            )
            .eq("org_id", me.orgId)
            .in("cota_id", cotaIds);

        if (contratosError) throw contratosError;
        contratosRows = (contratosData ?? []) as ContratoRow[];
    }

    const contratosByCota = new Map<string, ContratoRow[]>();
    for (const contrato of contratosRows) {
        if (!contrato.cota_id) continue;
        const arr = contratosByCota.get(contrato.cota_id) ?? [];
        arr.push(contrato);
        contratosByCota.set(contrato.cota_id, arr);
    }

    const latestContratoByCota = new Map<string, ContratoRow>();
    for (const [cotaId, rows] of contratosByCota.entries()) {
        const latest = pickLatestByCreatedAt(rows);
        if (latest) latestContratoByCota.set(cotaId, latest);
    }

    let administradorasMap = new Map<string, AdministradoraRow>();
    if (administradoraIds.length > 0) {
        const { data: admsData, error: admsError } = await s
            .from("administradoras")
            .select("id, nome")
            .eq("org_id", me.orgId)
            .in("id", administradoraIds);

        if (admsError) throw admsError;

        administradorasMap = new Map<string, AdministradoraRow>(
            ((admsData ?? []) as AdministradoraRow[]).map((adm) => [adm.id, adm])
        );
    }

    return {
        carteiraRows: filteredCarteiraRows,
        leadsMap,
        cotasByLead,
        latestContratoByCota,
        administradorasMap,
    };
}