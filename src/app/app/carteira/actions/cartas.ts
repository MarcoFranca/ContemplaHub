"use server";

import type {
    CarteiraCartaItem,
    CarteiraCartasResponse,
    CarteiraFilters,
} from "../lib/types";
import { asNumber } from "../lib/format";
import { loadCarteiraUniverse } from "./shared";

export async function listCarteiraCartas(
    filters: CarteiraFilters = {}
): Promise<CarteiraCartasResponse> {
    const {
        carteiraRows,
        leadsMap,
        cotasByLead,
        latestContratoByCota,
        latestLanceByCota,
        administradorasMap,
    } = await loadCarteiraUniverse(filters);

    const carteiraByLead = new Map<string, (typeof carteiraRows)[number]>(
        carteiraRows.map((row) => [row.lead_id, row])
    );

    const items: CarteiraCartaItem[] = [];

    for (const [leadId, cotas] of cotasByLead.entries()) {
        const lead = leadsMap.get(leadId);
        const carteira = carteiraByLead.get(leadId);

        if (!lead || !carteira) continue;

        for (const cota of cotas) {
            const contrato = latestContratoByCota.get(cota.id) ?? null;
            const ultimoLance = latestLanceByCota.get(cota.id) ?? null;

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
                    assembleia_dia: cota.assembleia_dia ?? null,
                    situacao: cota.situacao ?? null,
                    fgts_permitido: cota.fgts_permitido ?? null,
                    embutido_permitido: cota.embutido_permitido ?? null,
                    embutido_max_percent: asNumber(cota.embutido_max_percent),
                    parcela_reduzida: cota.parcela_reduzida ?? null,
                    data_ultimo_lance: cota.data_ultimo_lance ?? null,
                    administradora: cota.administradora_id
                        ? administradorasMap.get(cota.administradora_id)?.nome ?? null
                        : null,
                    autorizacao_gestao: cota.autorizacao_gestao ?? null,
                    ultimo_lance: ultimoLance
                        ? {
                              data: ultimoLance.assembleia_data ?? null,
                              tipo: ultimoLance.tipo ?? null,
                              percentual: asNumber(ultimoLance.percentual),
                              valor: asNumber(ultimoLance.valor),
                          }
                        : null,
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
