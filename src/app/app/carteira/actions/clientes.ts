"use server";

import { asNumber } from "../lib/format";
import type {
    CarteiraClienteItem,
    CarteiraClientesResponse,
    CarteiraFilters,
} from "../lib/types";
import { loadCarteiraUniverse } from "./shared";

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

        const contratoMaisRecente =
            [...(cotasByLead.get(row.lead_id) ?? [])]
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