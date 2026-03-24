"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/server";
import { backendFetch } from "@/lib/backend";

import type {
    Stage,
    LeadCard,
    CanalOrigem,
    KanbanColumns,
    ContractStatus,
} from "./types";

// ====== Supabase SR client ======
function srv() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

function normalizeOrigem(input?: string | null): CanalOrigem {
    const allowed: CanalOrigem[] = ["lp", "whatsapp", "indicacao", "orgânico", "pago", "outro"];
    const v = (input ?? "").toLowerCase();
    const map: Record<string, CanalOrigem> = {
        lp: "lp",
        landing: "lp",
        whatsapp: "whatsapp",
        zap: "whatsapp",
        indicacao: "indicacao",
        "indicação": "indicacao",
        organico: "orgânico",
        "orgânico": "orgânico",
        pago: "pago",
        ads: "pago",
        outro: "outro",
    };
    const hit = map[v];
    return allowed.includes(hit as CanalOrigem) ? hit : "whatsapp";
}

export type { Stage, LeadCard };

export async function listLeadsForKanban(options?: {
    showActive?: boolean;
    showLost?: boolean;
    scope?: "me" | "team";
}): Promise<LeadCard[]> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error("Org inválida");

    const params = new URLSearchParams();
    if (options?.showActive) params.set("show_active", "true");
    if (options?.showLost) params.set("show_lost", "true");

    const query = params.toString();
    const path = query ? `/kanban?${query}` : `/kanban`;

    const data = await backendFetch(path, {
        method: "GET",
        orgId: profile.orgId,
    });

    const columns = data.columns as KanbanColumns;
    const rows: LeadCard[] = Object.values(columns).flat();

    const contractLeadIds = rows
        .filter((row) => row.etapa === "contrato")
        .map((row) => row.id);

    if (contractLeadIds.length === 0) {
        return rows;
    }

    const s = srv();

    const { data: cotasData, error: cotasError } = await s
        .from("cotas")
        .select("id, lead_id, administradora_id, valor_carta, numero_cota, grupo_codigo, created_at")
        .eq("org_id", profile.orgId)
        .in("lead_id", contractLeadIds);

    if (cotasError) {
        console.error("Erro ao enriquecer cotas do kanban:", cotasError);
        return rows;
    }

    const cotas = cotasData ?? [];
    if (cotas.length === 0) {
        return rows;
    }

    const cotaIds = cotas.map((c) => c.id);

    const { data: contratosData, error: contratosError } = await s
        .from("contratos")
        .select("id, cota_id, numero, status, created_at")
        .eq("org_id", profile.orgId)
        .in("cota_id", cotaIds)
        .order("created_at", { ascending: false });

    if (contratosError) {
        console.error("Erro ao enriquecer contratos do kanban:", contratosError);
        return rows;
    }

    const administradoraIds = [
        ...new Set(cotas.map((c) => c.administradora_id).filter(Boolean) as string[]),
    ];

    let admMap = new Map<string, string>();
    if (administradoraIds.length > 0) {
        const { data: adminsData, error: adminsError } = await s
            .from("administradoras")
            .select("id, nome")
            .in("id", administradoraIds);

        if (!adminsError) {
            admMap = new Map((adminsData ?? []).map((a) => [a.id, a.nome]));
        }
    }

    type CotaRow = {
        id: string;
        lead_id: string;
        administradora_id: string | null;
        valor_carta: string | number | null;
        numero_cota: string | null;
        grupo_codigo: string | null;
        created_at: string | null;
    };

    type ContratoRow = {
        id: string;
        cota_id: string;
        numero: string | null;
        status: string | null;
        created_at: string | null;
    };

    const latestContractByCota = new Map<string, ContratoRow>();
    for (const contrato of (contratosData ?? []) as ContratoRow[]) {
        if (!latestContractByCota.has(contrato.cota_id)) {
            latestContractByCota.set(contrato.cota_id, contrato);
        }
    }

    const latestCotaByLead = new Map<string, CotaRow>();
    for (const cota of cotas as CotaRow[]) {
        const current = latestCotaByLead.get(cota.lead_id);
        const currentTs = current?.created_at ? new Date(current.created_at).getTime() : 0;
        const nextTs = cota.created_at ? new Date(cota.created_at).getTime() : 0;

        if (!current || nextTs >= currentTs) {
            latestCotaByLead.set(cota.lead_id, cota);
        }
    }

    return rows.map((row) => {
        if (row.etapa !== "contrato") return row;

        const cota = latestCotaByLead.get(row.id);
        if (!cota) return row;

        const contrato = latestContractByCota.get(cota.id);

        return {
            ...row,
            cota_id: cota.id ?? null,
            cota_numero: cota.numero_cota ?? null,
            grupo_codigo: cota.grupo_codigo ?? null,
            valor_carta: cota.valor_carta ? String(cota.valor_carta) : null,
            administradora_id: cota.administradora_id ?? null,
            administradora_nome: cota.administradora_id
                ? admMap.get(cota.administradora_id) ?? null
                : null,
            contract_id: contrato?.id ?? null,
            contract_status: (contrato?.status as ContractStatus | null) ?? "pendente_assinatura",
            contract_number: contrato?.numero ?? null,
        };
    });
}

export async function moveLeadStage(args: {
    leadId: string;
    stage?: Stage;
    to?: Stage;
    reason?: string;
}) {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error("Org inválida");

    const { leadId, stage, to, reason } = args;
    const newStage = stage ?? to;
    if (!newStage) throw new Error("Stage (stage/to) é obrigatório");

    const data = await backendFetch(`/leads/${leadId}/stage`, {
        method: "PATCH",
        orgId: profile.orgId,
        body: JSON.stringify({ stage: newStage, reason }),
    });

    revalidatePath("/app/leads");
    return data;
}

export async function createLeadManual(formData: FormData): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Organização inválida." };

    const s = srv();

    try {
        const nome = String(formData.get("nome") ?? "").trim();
        const emailRaw = String(formData.get("email") ?? "").trim();
        const telefoneRaw = String(formData.get("telefone") ?? "").trim();
        const origemRaw = String(formData.get("origem") ?? "orgânico").trim();

        if (!nome) return { ok: false, error: "Informe o nome do lead." };
        if (!telefoneRaw && !emailRaw) return { ok: false, error: "Informe telefone ou e-mail." };

        const telefone = telefoneRaw ? telefoneRaw.replace(/\D+/g, "") : null;
        const email = emailRaw || null;
        const origem = normalizeOrigem(origemRaw);

        const leadPayload = {
            org_id: me.orgId,
            nome,
            telefone,
            email,
            origem,
            perfil: "nao_informado",
            etapa: "novo",
            owner_id: me.userId,
            created_by: me.userId,
        };

        const { data: leadRow, error: leadErr } = await s
            .from("leads")
            .insert(leadPayload)
            .select("id")
            .single();

        if (leadErr) {
            console.error("Erro ao criar lead:", leadErr);

            if (leadErr.code === "23505") {
                return { ok: false, error: "Já existe um lead com esse telefone/e-mail." };
            }

            return { ok: false, error: "Erro ao criar o lead. Tente novamente." };
        }

        const rawProduto = String(formData.get("produto") ?? "").trim();
        const rawValorTotal = String(formData.get("valorTotal") ?? "").trim();
        const rawPrazoMeses = String(formData.get("prazoMeses") ?? "").trim();
        const objetivo = String(formData.get("objetivo") ?? "").trim();
        const rawPerfil = String(formData.get("perfilDesejado") ?? "").trim();
        const observacao = String(formData.get("observacao") ?? "").trim();

        const produto =
            !rawProduto || rawProduto === "__produto" || rawProduto === "none"
                ? null
                : rawProduto;

        const perfilDesejadoDb =
            !rawPerfil || rawPerfil === "__perfil" || rawPerfil === "none"
                ? null
                : rawPerfil;

        const hasInterest =
            produto || rawValorTotal || rawPrazoMeses || objetivo || rawPerfil || observacao;

        if (hasInterest) {
            const valorTotal = rawValorTotal
                ? rawValorTotal.replace(/\./g, "").replace(",", ".")
                : null;
            const prazoMeses = rawPrazoMeses ? Number(rawPrazoMeses) : null;

            const { error: intErr } = await s.from("lead_interesses").insert({
                org_id: me.orgId,
                lead_id: leadRow!.id,
                produto,
                valor_total: valorTotal,
                prazo_meses: prazoMeses,
                objetivo: objetivo || null,
                perfil_desejado: perfilDesejadoDb,
                observacao: observacao || null,
                status: "aberto",
                created_by: me.userId,
            });

            if (intErr) {
                console.error("Erro ao criar interesse:", intErr);
                return { ok: false, error: "Erro ao salvar interesse do lead." };
            }
        }

        revalidatePath("/app/leads");
        return { ok: true };
    } catch (err) {
        console.error("Erro inesperado em createLeadManual:", err);
        return { ok: false, error: "Erro interno ao criar lead." };
    }
}

export type AdminOption = { id: string; nome: string };
export type GrupoOption = { id: string; administradoraId: string; codigo: string | null };

export async function listContractOptions(): Promise<{
    administradoras: AdminOption[];
    grupos: GrupoOption[];
}> {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    const s = srv();

    const [admRes, grpRes] = await Promise.all([
        s.from("administradoras")
            .select("id, nome")
            .order("nome", { ascending: true }),

        s.from("grupos")
            .select("id, administradora_id, codigo")
            .eq("org_id", me.orgId)
            .order("codigo", { ascending: true }),
    ]);

    if (admRes.error) throw admRes.error;
    if (grpRes.error) throw grpRes.error;

    return {
        administradoras: (admRes.data ?? []).map((a) => ({ id: a.id, nome: a.nome })),
        grupos: (grpRes.data ?? []).map((g) => ({
            id: g.id,
            administradoraId: g.administradora_id,
            codigo: g.codigo ?? null,
        })),
    };
}

export type CreateContractFromLeadResult = {
    contrato_id: string;
    cota_id: string;
};

export async function createContractFromLead(
    formData: FormData
): Promise<CreateContractFromLeadResult> {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    const getStr = (name: string) => {
        const v = formData.get(name);
        return v ? String(v).trim() : null;
    };

    const getBool = (name: string) => !!formData.get(name);

    const getInt = (name: string) => {
        const v = getStr(name);
        if (!v) return null;
        const n = Number(v);
        return Number.isFinite(n) ? Math.trunc(n) : null;
    };

    const rawOpcoesLanceFixoJson = getStr("opcoesLanceFixoJson") ?? "[]";

    let opcoesLanceFixo: Array<{
        percentual: number;
        ordem: number;
        ativo: boolean;
        observacoes: string | null;
    }> = [];

    try {
        const parsed = JSON.parse(rawOpcoesLanceFixoJson);

        if (!Array.isArray(parsed)) {
            throw new Error("Formato inválido");
        }

        opcoesLanceFixo = parsed.map((item) => ({
            percentual: Number(item.percentual),
            ordem: Number(item.ordem),
            ativo: Boolean(item.ativo),
            observacoes:
                item.observacoes === undefined || item.observacoes === null || item.observacoes === ""
                    ? null
                    : String(item.observacoes),
        }));
    } catch (error) {
        console.error("Erro ao ler opcoesLanceFixoJson:", error);
        throw new Error("Opções de lance fixo inválidas.");
    }

    const payload = {
        lead_id: getStr("leadId"),
        administradora_id: getStr("administradoraId"),

        numero_cota: getStr("numeroCota"),
        grupo_codigo: getStr("grupoCodigo"),
        produto: (getStr("produto") ?? "imobiliario") as "imobiliario" | "auto",

        valor_carta: getStr("valorCarta") ?? "",
        valor_parcela: getStr("valorParcela"),
        prazo: getInt("prazo"),
        forma_pagamento: getStr("formaPagamento"),
        indice_correcao: getStr("indiceCorrecao"),

        parcela_reduzida: getBool("parcelaReduzida"),
        fgts_permitido: getBool("fgtsPermitido"),
        embutido_permitido: getBool("embutidoPermitido"),
        autorizacao_gestao: getBool("autorizacaoGestao"),

        data_adesao: getStr("dataAdesao"),
        data_assinatura: getStr("dataAssinatura"),
        numero_contrato: getStr("numero"),

        opcoes_lance_fixo: opcoesLanceFixo,
    };

    if (
        !payload.lead_id ||
        !payload.administradora_id ||
        !payload.numero_cota ||
        !payload.grupo_codigo ||
        !payload.valor_carta
    ) {
        throw new Error("Campos obrigatórios ausentes.");
    }

    const data = await backendFetch("/contracts/from-lead", {
        method: "POST",
        orgId: me.orgId,
        body: JSON.stringify(payload),
    });

    await backendFetch(`/leads/${payload.lead_id}/stage`, {
        method: "PATCH",
        orgId: me.orgId,
        body: JSON.stringify({
            stage: "contrato",
            reason: "Contrato iniciado a partir do cadastro da carta.",
        }),
    });

    revalidatePath("/app/leads");
    revalidatePath(`/app/leads/${payload.lead_id}`);
    revalidatePath("/app/carteira");

    return {
        contrato_id: String(data?.contrato_id ?? ""),
        cota_id: String(data?.cota_id ?? ""),
    };
}

export async function updateContractStatus(
    contractId: string,
    status: ContractStatus
) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    await backendFetch(`/contracts/${contractId}/status`, {
        method: "PATCH",
        orgId: me.orgId,
        body: JSON.stringify({ status }),
    });

    revalidatePath("/app/leads");
    revalidatePath("/app/carteira");
}

export async function deleteLead(leadId: string) {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) {
        throw new Error("Org inválida");
    }

    await backendFetch(`/leads/${leadId}`, {
        method: "DELETE",
        orgId: profile.orgId,
    });

    return { ok: true };
}