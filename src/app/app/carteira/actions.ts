"use server";

import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";

/** Service role */
function srv() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

function norm(s?: string | null) {
    return (s ?? "").trim().toLowerCase();
}

function contains(hay?: string | null, needle?: string | null) {
    if (!needle) return true;
    return norm(hay).includes(norm(needle));
}

function asNumber(v: string | number | null | undefined): number | null {
    if (v == null) return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    const n = Number(String(v).replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
}

function pickLatestByCreatedAt<T extends { created_at?: string | null }>(rows: T[]): T | null {
    if (!rows.length) return null;

    return [...rows].sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
    })[0] ?? null;
}

export type CarteiraFilters = {
    include_all?: boolean;
    produto?: string | null;
    q?: string | null;
    status_carteira?: string | null;
};

type LeadRow = {
    id: string;
    nome: string | null;
    telefone: string | null;
    email: string | null;
    etapa: string | null;
};

type CarteiraRow = {
    id: string;
    org_id: string;
    lead_id: string;
    status: string;
    origem_entrada: string;
    entered_at: string | null;
    observacoes: string | null;
};

type CotaRow = {
    id: string;
    org_id: string | null;
    lead_id: string | null;
    administradora_id: string | null;
    numero_cota: string | null;
    grupo_codigo: string | null;
    produto: string | null;
    valor_carta: number | null;
    valor_parcela: number | null;
    prazo: number | null;
    autorizacao_gestao: boolean | null;
    created_at?: string | null;
};

type ContratoRow = {
    id: string;
    org_id: string | null;
    cota_id: string | null;
    numero: string | null;
    status: string | null;
    data_assinatura: string | null;
    data_pagamento: string | null;
    data_alocacao: string | null;
    data_contemplacao: string | null;
    created_at?: string | null;
};

type AdministradoraRow = {
    id: string;
    nome: string | null;
};

export type CarteiraClienteCartaResumo = {
    cota_id: string;
    numero_cota: string | null;
    grupo_codigo: string | null;
    produto: string | null;
    valor_carta: number | null;
    administradora: string | null;
    status_contrato: string | null;
};

export type CarteiraClienteItem = {
    cliente: {
        carteira_id: string;
        lead_id: string;
        nome: string | null;
        telefone: string | null;
        email: string | null;
        etapa: string | null;
        status_carteira: string;
        origem_entrada: string;
        entered_at: string | null;
        observacoes: string | null;
    };
    resumo: {
        qtd_cartas: number;
        possui_contrato: boolean;
        status_contrato_mais_recente: string | null;
        valor_total_cartas: number | null;
    };
    cartas: CarteiraClienteCartaResumo[];
};

export type CarteiraCartaItem = {
    cliente: {
        lead_id: string;
        nome: string | null;
        telefone: string | null;
        email: string | null;
    };
    carteira: {
        carteira_id: string;
        status_carteira: string;
        origem_entrada: string;
        entered_at: string | null;
    };
    cota: {
        cota_id: string;
        numero_cota: string | null;
        grupo_codigo: string | null;
        produto: string | null;
        valor_carta: number | null;
        valor_parcela: number | null;
        prazo: number | null;
        administradora: string | null;
        autorizacao_gestao: boolean | null;
    };
    contrato: {
        contrato_id: string | null;
        numero: string | null;
        status: string | null;
        data_assinatura: string | null;
        data_pagamento: string | null;
        data_alocacao: string | null;
        data_contemplacao: string | null;
    };
};

export type CarteiraClientesResponse = {
    items: CarteiraClienteItem[];
    total: number;
};

export type CarteiraCartasResponse = {
    items: CarteiraCartaItem[];
    total: number;
};

async function loadCarteiraUniverse(filters: CarteiraFilters) {
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
            me,
            carteiraRows: [] as CarteiraRow[],
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

    const leadsMap = new Map<string, LeadRow>(
        leadsRows.map((lead) => [lead.id, lead])
    );

    const q = norm(filters.q);

    const filteredCarteiraRows = carteiraRows.filter((row) => {
        const lead = leadsMap.get(row.lead_id);
        if (!lead) return false;

        const matchQ =
            !q ||
            contains(lead.nome, q) ||
            contains(lead.telefone, q) ||
            contains(lead.email, q);

        return matchQ;
    });

    if (filteredCarteiraRows.length === 0) {
        return {
            me,
            carteiraRows: [] as CarteiraRow[],
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
        me,
        carteiraRows: filteredCarteiraRows,
        leadsMap,
        cotasByLead,
        latestContratoByCota,
        administradorasMap,
    };
}

export async function listCarteiraClientes(
    filters: CarteiraFilters = {}
): Promise<CarteiraClientesResponse> {
    const {
        carteiraRows,
        leadsMap,
        cotasByLead,
        latestContratoByCota,
        administradorasMap,
    } = await loadCarteiraUniverse(filters);

    const items: CarteiraClienteItem[] = carteiraRows.map((row) => {
        const lead = leadsMap.get(row.lead_id) ?? null;
        const cartas = (cotasByLead.get(row.lead_id) ?? []).map((cota) => {
            const contrato = latestContratoByCota.get(cota.id) ?? null;
            return {
                cota_id: cota.id,
                numero_cota: cota.numero_cota,
                grupo_codigo: cota.grupo_codigo,
                produto: cota.produto,
                valor_carta: asNumber(cota.valor_carta),
                administradora: cota.administradora_id
                    ? administradorasMap.get(cota.administradora_id)?.nome ?? null
                    : null,
                status_contrato: contrato?.status ?? null,
            };
        });

        const valorTotalCartas = cartas.reduce<number>(
            (acc, carta) => acc + (asNumber(carta.valor_carta) ?? 0),
            0
        );

        const contratoMaisRecente = [...(cotasByLead.get(row.lead_id) ?? [])]
            .map((cota) => latestContratoByCota.get(cota.id) ?? null)
            .filter(Boolean)[0] ?? null;

        return {
            cliente: {
                carteira_id: row.id,
                lead_id: row.lead_id,
                nome: lead?.nome ?? "—",
                telefone: lead?.telefone ?? null,
                email: lead?.email ?? null,
                etapa: lead?.etapa ?? null,
                status_carteira: row.status,
                origem_entrada: row.origem_entrada,
                entered_at: row.entered_at,
                observacoes: row.observacoes ?? null,
            },
            resumo: {
                qtd_cartas: cartas.length,
                possui_contrato: cartas.some((c) => !!c.status_contrato),
                status_contrato_mais_recente: contratoMaisRecente?.status ?? null,
                valor_total_cartas: cartas.length ? valorTotalCartas : null,
            },
            cartas,
        };
    });

    return {
        items,
        total: items.length,
    };
}

export async function listCarteiraCartas(
    filters: CarteiraFilters = {}
): Promise<CarteiraCartasResponse> {
    const {
        carteiraRows,
        leadsMap,
        cotasByLead,
        latestContratoByCota,
        administradorasMap,
    } = await loadCarteiraUniverse(filters);

    const carteiraByLead = new Map<string, CarteiraRow>(
        carteiraRows.map((row) => [row.lead_id, row])
    );

    const items: CarteiraCartaItem[] = [];

    for (const [leadId, cotas] of cotasByLead.entries()) {
        const lead = leadsMap.get(leadId);
        const carteira = carteiraByLead.get(leadId);

        if (!lead || !carteira) continue;

        for (const cota of cotas) {
            const contrato = latestContratoByCota.get(cota.id) ?? null;

            items.push({
                cliente: {
                    lead_id: lead.id,
                    nome: lead.nome,
                    telefone: lead.telefone,
                    email: lead.email,
                },
                carteira: {
                    carteira_id: carteira.id,
                    status_carteira: carteira.status,
                    origem_entrada: carteira.origem_entrada,
                    entered_at: carteira.entered_at,
                },
                cota: {
                    cota_id: cota.id,
                    numero_cota: cota.numero_cota,
                    grupo_codigo: cota.grupo_codigo,
                    produto: cota.produto,
                    valor_carta: asNumber(cota.valor_carta),
                    valor_parcela: asNumber(cota.valor_parcela),
                    prazo: cota.prazo,
                    administradora: cota.administradora_id
                        ? administradorasMap.get(cota.administradora_id)?.nome ?? null
                        : null,
                    autorizacao_gestao: cota.autorizacao_gestao ?? null,
                },
                contrato: {
                    contrato_id: contrato?.id ?? null,
                    numero: contrato?.numero ?? null,
                    status: contrato?.status ?? null,
                    data_assinatura: contrato?.data_assinatura ?? null,
                    data_pagamento: contrato?.data_pagamento ?? null,
                    data_alocacao: contrato?.data_alocacao ?? null,
                    data_contemplacao: contrato?.data_contemplacao ?? null,
                },
            });
        }
    }

    items.sort((a, b) => {
        const da = a.carteira.entered_at ? new Date(a.carteira.entered_at).getTime() : 0;
        const db = b.carteira.entered_at ? new Date(b.carteira.entered_at).getTime() : 0;
        return db - da;
    });

    return {
        items,
        total: items.length,
    };
}