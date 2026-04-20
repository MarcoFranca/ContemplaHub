"use server";

import { asNumber } from "../lib/format";
import type {
    CarteiraClienteItem,
    CarteiraClientesResponse,
    CarteiraFilters,
    ClienteSort,
} from "../lib/types";
import { loadCarteiraUniverse } from "./shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";
import { backendFetch } from "@/lib/backend";


function sortItems(items: CarteiraClienteItem[], sort?: ClienteSort | null) {
    const rows = [...items];

    switch (sort) {
        case "nome_asc":
            rows.sort((a, b) =>
                (a.cliente.nome ?? "").localeCompare(b.cliente.nome ?? "", "pt-BR")
            );
            return rows;

        case "total_desc":
            rows.sort(
                (a, b) =>
                    (b.resumo.valor_total_cartas ?? 0) - (a.resumo.valor_total_cartas ?? 0)
            );
            return rows;

        case "qtd_cartas_desc":
            rows.sort((a, b) => b.resumo.qtd_cartas - a.resumo.qtd_cartas);
            return rows;

        case "maior_carta_desc":
            rows.sort(
                (a, b) => (b.resumo.maior_carta_valor ?? 0) - (a.resumo.maior_carta_valor ?? 0)
            );
            return rows;

        case "entrada_desc":
        default:
            rows.sort((a, b) => {
                const da = a.cliente.entered_at ? new Date(a.cliente.entered_at).getTime() : 0;
                const db = b.cliente.entered_at ? new Date(b.cliente.entered_at).getTime() : 0;
                return db - da;
            });
            return rows;
    }
}

export async function listCarteiraClientes(
    filters: CarteiraFilters = {}
): Promise<CarteiraClientesResponse> {
    const {
        carteiraRows,
        leadsMap,
        cotasByLead,
        latestContratoByCota,
        latestLanceByCota,
        administradorasMap,
    } = await loadCarteiraUniverse(filters);

    const itemsBase: CarteiraClienteItem[] = carteiraRows.map((row) => {
        const lead = leadsMap.get(row.lead_id) ?? null;

        const cartas = (cotasByLead.get(row.lead_id) ?? []).map((cota) => {
            const contrato = latestContratoByCota.get(cota.id) ?? null;
            const ultimoLance = latestLanceByCota.get(cota.id) ?? null;
            return {
                cota_id: cota.id,
                numero_cota: cota.numero_cota,
                grupo_codigo: cota.grupo_codigo,
                produto: cota.produto,
                valor_carta: asNumber(cota.valor_carta),
                valor_parcela: asNumber(cota.valor_parcela),
                prazo: cota.prazo ?? null,
                assembleia_dia: cota.assembleia_dia ?? null,
                situacao: cota.situacao ?? null,
                fgts_permitido: cota.fgts_permitido ?? null,
                embutido_permitido: cota.embutido_permitido ?? null,
                embutido_max_percent: asNumber(cota.embutido_max_percent),
                parcela_reduzida: cota.parcela_reduzida ?? null,
                administradora: cota.administradora_id
                    ? administradorasMap.get(cota.administradora_id)?.nome ?? null
                    : null,
                ultimo_lance: ultimoLance
                    ? {
                          data: ultimoLance.assembleia_data ?? null,
                          tipo: ultimoLance.tipo ?? null,
                          percentual: asNumber(ultimoLance.percentual),
                          valor: asNumber(ultimoLance.valor),
                      }
                    : null,
                status_contrato: contrato?.status ?? null,
            };
        });

        const valorTotalCartas = cartas.reduce<number>(
            (acc, carta) => acc + (asNumber(carta.valor_carta) ?? 0),
            0
        );

        const maiorCartaValor =
            cartas.reduce<number>(
                (max, carta) => Math.max(max, asNumber(carta.valor_carta) ?? 0),
                0
            ) || null;

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
                maior_carta_valor: maiorCartaValor,
            },
            cartas,
        };
    });

    const items = sortItems(itemsBase, filters.sort ?? "entrada_desc");

    return {
        items,
        total: items.length,
    };
}

export async function startClientNegotiationAction(formData: FormData) {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) {
        throw new Error("Organização inválida.");
    }

    const leadId = String(formData.get("leadId") ?? "").trim();
    if (!leadId) {
        throw new Error("Lead inválido.");
    }

    await backendFetch(`/leads/${leadId}/stage`, {
        method: "PATCH",
        orgId: profile.orgId,
        body: JSON.stringify({
            stage: "diagnostico",
            reason: "Lead reativado a partir da carteira para nova negociação.",
        }),
    });

    revalidatePath("/app/leads");
    revalidatePath("/app/carteira");
    redirect("/app/leads");
}
