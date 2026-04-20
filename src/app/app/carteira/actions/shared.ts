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
    UltimoLanceRow,
} from "../lib/types";

function srv() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

function serializeError(error: unknown) {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }

    if (typeof error === "object" && error !== null) {
        return error;
    }

    return { message: String(error) };
}

function logInfo(event: string, payload: unknown) {
    console.info(`${event} ${JSON.stringify(payload)}`);
}

function logError(event: string, payload: unknown) {
    console.error(`${event} ${JSON.stringify(payload)}`);
}

function isMissingOptionalCotaFieldError(error: unknown) {
    if (!error || typeof error !== "object") return false;

    const maybeError = error as { code?: string; message?: string };
    return (
        maybeError.code === "42703" &&
        typeof maybeError.message === "string" &&
        maybeError.message.includes("column cotas.situacao does not exist")
    );
}

export async function loadCarteiraUniverse(
    filters: CarteiraFilters = {}
): Promise<CarteiraUniverse> {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    const s = srv();
    const logContext = {
        orgId: me.orgId,
        filters: {
            include_all: filters.include_all ?? false,
            produto: filters.produto ?? null,
            q: filters.q ?? null,
            status_carteira: filters.status_carteira ?? null,
            sort: filters.sort ?? null,
        },
    };
    let step = "init";

    try {
        logInfo("[carteira] loadCarteiraUniverse:start", logContext);

        step = "carteira_clientes";
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
        logInfo("[carteira] loadCarteiraUniverse:carteira_clientes", {
            ...logContext,
            count: carteiraRows.length,
        });

        if (carteiraRows.length === 0) {
            return {
                carteiraRows: [],
                leadsMap: new Map<string, LeadRow>(),
                cotasByLead: new Map<string, CotaRow[]>(),
                latestContratoByCota: new Map<string, ContratoRow>(),
                latestLanceByCota: new Map<string, UltimoLanceRow>(),
                administradorasMap: new Map<string, AdministradoraRow>(),
            };
        }

        const leadIds = [...new Set(carteiraRows.map((r) => r.lead_id).filter(Boolean))];

        step = "leads";
        const { data: leadsData, error: leadsError } = await s
            .from("leads")
            .select("id, nome, telefone, email, etapa")
            .in("id", leadIds);

        if (leadsError) throw leadsError;

        const leadsRows = (leadsData ?? []) as LeadRow[];
        const leadsMap = new Map<string, LeadRow>(leadsRows.map((lead) => [lead.id, lead]));
        logInfo("[carteira] loadCarteiraUniverse:leads", {
            ...logContext,
            count: leadsRows.length,
        });

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

        logInfo("[carteira] loadCarteiraUniverse:filteredCarteiraRows", {
            ...logContext,
            count: filteredCarteiraRows.length,
        });

        if (filteredCarteiraRows.length === 0) {
            return {
                carteiraRows: [],
                leadsMap,
                cotasByLead: new Map<string, CotaRow[]>(),
                latestContratoByCota: new Map<string, ContratoRow>(),
                latestLanceByCota: new Map<string, UltimoLanceRow>(),
                administradorasMap: new Map<string, AdministradoraRow>(),
            };
        }

        const filteredLeadIds = [...new Set(filteredCarteiraRows.map((r) => r.lead_id))];

        step = "cotas";
        const { data: cotasData, error: cotasError } = await s
            .from("cotas")
            .select(
                "id, org_id, lead_id, administradora_id, numero_cota, grupo_codigo, produto, valor_carta, valor_parcela, prazo, assembleia_dia, autorizacao_gestao, created_at"
            )
            .eq("org_id", me.orgId)
            .in("lead_id", filteredLeadIds);

        if (cotasError) throw cotasError;

        let cotasRows = (cotasData ?? []) as CotaRow[];

        if (filters.produto) {
            cotasRows = cotasRows.filter((c) => c.produto === filters.produto);
        }

        logInfo("[carteira] loadCarteiraUniverse:cotas", {
            ...logContext,
            count: cotasRows.length,
        });

        if (cotasRows.length > 0) {
            step = "cotas_optional_fields";
            try {
                const { data: cotasOptionalData, error: cotasOptionalError } = await s
                    .from("cotas")
                    .select(
                        "id, situacao, fgts_permitido, embutido_permitido, embutido_max_percent, parcela_reduzida, data_ultimo_lance"
                    )
                    .eq("org_id", me.orgId)
                    .in(
                        "id",
                        cotasRows.map((cota) => cota.id)
                    );

                if (cotasOptionalError) {
                    if (isMissingOptionalCotaFieldError(cotasOptionalError)) {
                        logInfo("[carteira] Campos opcionais das cotas indisponiveis nesta env", {
                            ...logContext,
                            error: serializeError(cotasOptionalError),
                        });
                    } else {
                        logError("[carteira] Falha ao carregar campos opcionais das cotas", {
                            ...logContext,
                            error: serializeError(cotasOptionalError),
                        });
                    }
                } else {
                    const optionalById = new Map<string, Partial<CotaRow>>(
                        ((cotasOptionalData ?? []) as Partial<CotaRow>[]).map((row) => [
                            String(row.id),
                            row,
                        ])
                    );

                    cotasRows = cotasRows.map((cota) => {
                        const optional = optionalById.get(cota.id);
                        if (!optional) return cota;

                        return {
                            ...cota,
                            situacao: optional.situacao ?? null,
                            fgts_permitido: optional.fgts_permitido ?? null,
                            embutido_permitido: optional.embutido_permitido ?? null,
                            embutido_max_percent: optional.embutido_max_percent ?? null,
                            parcela_reduzida: optional.parcela_reduzida ?? null,
                            data_ultimo_lance: optional.data_ultimo_lance ?? null,
                        };
                    });

                    logInfo("[carteira] loadCarteiraUniverse:cotas_optional_fields", {
                        ...logContext,
                        count: optionalById.size,
                    });
                }
            } catch (error) {
                logError("[carteira] Erro inesperado ao carregar campos opcionais das cotas", {
                    ...logContext,
                    error: serializeError(error),
                });
            }
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
        let latestLanceByCota = new Map<string, UltimoLanceRow>();
        if (cotaIds.length > 0) {
            step = "contratos";
            const { data: contratosData, error: contratosError } = await s
                .from("contratos")
                .select(
                    "id, org_id, cota_id, numero, status, data_assinatura, data_pagamento, data_alocacao, data_contemplacao, created_at"
                )
                .eq("org_id", me.orgId)
                .in("cota_id", cotaIds);

            if (contratosError) throw contratosError;
            contratosRows = (contratosData ?? []) as ContratoRow[];
            logInfo("[carteira] loadCarteiraUniverse:contratos", {
                ...logContext,
                count: contratosRows.length,
            });

            step = "lances";
            try {
                const { data: lancesData, error: lancesError } = await s
                    .from("lances")
                    .select(
                        "id, cota_id, tipo, percentual, valor, assembleia_data, created_at"
                    )
                    .eq("org_id", me.orgId)
                    .in("cota_id", cotaIds)
                    .order("created_at", { ascending: false });

                if (lancesError) {
                    logError("[carteira] Falha ao carregar ultimo lance das cotas", {
                        ...logContext,
                        error: serializeError(lancesError),
                    });
                } else {
                    const lancesByCota = new Map<string, UltimoLanceRow[]>();
                    for (const lance of (lancesData ?? []) as UltimoLanceRow[]) {
                        if (!lance.cota_id) continue;
                        const arr = lancesByCota.get(lance.cota_id) ?? [];
                        arr.push(lance);
                        lancesByCota.set(lance.cota_id, arr);
                    }

                    latestLanceByCota = new Map<string, UltimoLanceRow>();
                    for (const [cotaId, rows] of lancesByCota.entries()) {
                        const latest = pickLatestByCreatedAt(rows);
                        if (latest) latestLanceByCota.set(cotaId, latest);
                    }

                    logInfo("[carteira] loadCarteiraUniverse:lances", {
                        ...logContext,
                        count: latestLanceByCota.size,
                    });
                }
            } catch (error) {
                logError("[carteira] Erro inesperado ao consultar ultimo lance das cotas", {
                    ...logContext,
                    error: serializeError(error),
                });
            }
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
            step = "administradoras";
            const { data: admsData, error: admsError } = await s
                .from("administradoras")
                .select("id, nome")
                .eq("org_id", me.orgId)
                .in("id", administradoraIds);

            if (admsError) throw admsError;

            administradorasMap = new Map<string, AdministradoraRow>(
                ((admsData ?? []) as AdministradoraRow[]).map((adm) => [adm.id, adm])
            );
            logInfo("[carteira] loadCarteiraUniverse:administradoras", {
                ...logContext,
                count: administradorasMap.size,
            });
        }

        logInfo("[carteira] loadCarteiraUniverse:done", {
            ...logContext,
            carteiraCount: filteredCarteiraRows.length,
            cotasCount: cotasRows.length,
            contratosCount: latestContratoByCota.size,
            administradorasCount: administradorasMap.size,
            lancesCount: latestLanceByCota.size,
        });

        return {
            carteiraRows: filteredCarteiraRows,
            leadsMap,
            cotasByLead,
            latestContratoByCota,
            latestLanceByCota,
            administradorasMap,
        };
    } catch (error) {
        logError("[carteira] loadCarteiraUniverse:error", {
            ...logContext,
            step,
            error: serializeError(error),
        });
        throw error;
    }
}
