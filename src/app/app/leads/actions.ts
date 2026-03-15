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

// ====== Listagem Kanban ======
type ListArgs = {
    showLost?: boolean;   // mostrar "perdido"
    showActive?: boolean; // mostrar "ativo"
    scope?: "me" | "team"; // "me": só meus leads | "team": todos (se gestor/admin)
};
export type { Stage, LeadCard };

export async function listLeadsForKanban(options?: {
    showActive?: boolean;
    showLost?: boolean;
    scope?: "me" | "team"; // mantém compatível com a chamada do page.tsx
}): Promise<LeadCard[]> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error("Org inválida");

    const params = new URLSearchParams();
    if (options?.showActive) params.set("show_active", "true");
    if (options?.showLost) params.set("show_lost", "true");
    // scope ("me" | "team") por enquanto é ignorado pelo backend,
    // mas deixamos no tipo para não quebrar o page.tsx.

    const query = params.toString();
    const path = query ? `/kanban?${query}` : `/kanban`;

    const data = await backendFetch(path, {
        method: "GET",
        orgId: profile.orgId,
    });

    // Backend devolve: { columns: { [stage]: LeadCard[] } }
    const columns = data.columns as KanbanColumns;

    // Achata tudo em um array de linhas (como o page.tsx espera)
    const rows: LeadCard[] = Object.values(columns).flat();

    return rows;
}

// ====== Movimentação de estágio com histórico ======
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

    // 🔄 força o Next a buscar o Kanban de novo do backend
    revalidatePath("/app/leads");
    // se seu dashboard principal depende das etapas, vale revalidar /app também:
    // revalidatePath("/app");

    return data; // { ok, lead, ... }
}

// ====== Cadastro manual de lead (recebe FormData) ======
export async function createLeadManual(formData: FormData): Promise<{ ok: boolean; error?: string }> {
    const me = await getCurrentProfile();
    if (!me?.orgId) return { ok: false, error: "Organização inválida." };

    const s = srv();

    try {
        // ----------------------------
        // LEAD
        // ----------------------------
        const nome = String(formData.get("nome") ?? "").trim();
        const emailRaw = String(formData.get("email") ?? "").trim();
        const telefoneRaw = String(formData.get("telefone") ?? "").trim();
        const origemRaw = String(formData.get("origem") ?? "orgânico").trim();

        if (!nome)
            return { ok: false, error: "Informe o nome do lead." };

        if (!telefoneRaw && !emailRaw)
            return { ok: false, error: "Informe telefone ou e-mail." };

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

            // ERRO DE DUPLICIDADE (unique)
            if (leadErr.code === "23505") {
                return { ok: false, error: "Já existe um lead com esse telefone/e-mail." };
            }

            return { ok: false, error: "Erro ao criar o lead. Tente novamente." };
        }

        // ---- Campos do INTERESSE (opcionais) ----
        const rawProduto = String(formData.get("produto") ?? "").trim();           // 'imobiliario' | 'auto' | '__produto' | 'none'
        const rawValorTotal = String(formData.get("valorTotal") ?? "").trim();
        const rawPrazoMeses = String(formData.get("prazoMeses") ?? "").trim();
        const objetivo = String(formData.get("objetivo") ?? "").trim();

        const rawPerfil = String(formData.get("perfilDesejado") ?? "").trim();    // 'disciplinado_acumulador' | '__perfil' | 'none'
        const observacao = String(formData.get("observacao") ?? "").trim();

// normaliza produto/ perfil para null quando for "vazio"
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
                produto,                          // já vem normalizado (string | null)
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

        // revalidate
        revalidatePath("/app/leads");

        return { ok: true };
    } catch (err) {
        console.error("Erro inesperado em createLeadManual:", err);
        return { ok: false, error: "Erro interno ao criar lead." };
    }
}


// ====== Opções para o modal (administradoras + grupos) ======
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
            // .eq("org_id", me.orgId)  ❌ remova essa linha
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

// ====== Criar contrato a partir do lead (chama backend) ======
export async function createContractFromLead(formData: FormData): Promise<void> {
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

    await backendFetch("/contracts/from-lead", {
        method: "POST",
        orgId: me.orgId,
        body: JSON.stringify(payload),
    });

    revalidatePath("/app/leads");
}

// ====== Atualizar status do contrato ======
export type ContractStatus =
    | "pendente_assinatura"
    | "pendente_pagamento"
    | "alocado"
    | "contemplado"
    | "cancelado";


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

// ====== EXCLUIR LEAD (com cascata no backend) ======
export async function deleteLead(leadId: string) {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) {
        throw new Error("Org inválida");
    }

    await backendFetch(`/leads/${leadId}`, {
        method: "DELETE",
        orgId: profile.orgId,
    });

    // se não lançou erro, está tudo certo
    return { ok: true };
}
