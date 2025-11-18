"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";
import { backendFetch } from "@/lib/backend";

import type {
    Stage,
    LeadCard,
    CanalOrigem,
    LeadCardInterest,
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
export async function createLeadManual(formData: FormData): Promise<void> {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    const s = srv();

    // ---- Campos do LEAD ----
    const nome = String(formData.get("nome") ?? "").trim();
    const emailRaw = String(formData.get("email") ?? "").trim();
    const telefoneRaw = String(formData.get("telefone") ?? "").trim();
    const origemRaw = String(formData.get("origem") ?? "orgânico").trim();

    if (!nome) redirect("/app/leads?err=" + encodeURIComponent("Informe o nome do lead."));
    if (!telefoneRaw && !emailRaw) {
        redirect("/app/leads?err=" + encodeURIComponent("Informe telefone ou e-mail."));
    }

    const telefone = telefoneRaw ? telefoneRaw.replace(/\D+/g, "") : null;
    const email = emailRaw || null;
    const origem = normalizeOrigem(origemRaw);

    // ---- Campos do INTERESSE (opcionais) ----
    const produto = (formData.get("produto") ?? "") as string; // ex.: 'imobiliario'
    const valorTotalRaw = String(formData.get("valorTotal") ?? "").trim();
    const prazoMesesRaw = String(formData.get("prazoMeses") ?? "").trim();
    const objetivo = String(formData.get("objetivo") ?? "").trim();
    const perfilDesejado = String(formData.get("perfilDesejado") ?? "").trim();
    const observacao = String(formData.get("observacao") ?? "").trim();

    // cria o lead
    const { data: leadRow, error: leadErr } = await s
        .from("leads")
        .insert({
            org_id: me.orgId,
            nome,
            telefone,
            email,
            origem,
            perfil: "nao_informado",
            etapa: "novo",
            owner_id: me.userId,
            created_by: me.userId,
        })
        .select("id")
        .single();

    if (leadErr) {
        if (leadErr.code === "23505") {
            redirect("/app/leads?err=" + encodeURIComponent("Já existe um lead com esse telefone/e-mail."));
        }
        redirect("/app/leads?err=" + encodeURIComponent(leadErr.message));
    }

    // se veio algum dado de interesse, cria interesse "aberto"
    const hasInterest =
        produto || valorTotalRaw || prazoMesesRaw || objetivo || perfilDesejado || observacao;

    if (hasInterest) {
        const valorTotal = valorTotalRaw ? valorTotalRaw.replace(/\./g, "").replace(",", ".") : null;
        const prazoMeses = prazoMesesRaw ? Number(prazoMesesRaw) : null;

        const { error: intErr } = await s.from("lead_interesses").insert({
            org_id: me.orgId,
            lead_id: leadRow!.id,
            produto: produto || null,
            valor_total: valorTotal,
            prazo_meses: prazoMeses,
            objetivo: objetivo || null,
            perfil_desejado: perfilDesejado || null,
            observacao: observacao || null,
            status: "aberto",
            created_by: me.userId,
        });

        if (intErr) {
            redirect("/app/leads?err=" + encodeURIComponent(intErr.message));
        }
    }

    revalidatePath("/app/leads");
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

// ====== Criar contrato + cota e mover lead para "ativo" (versão compatível com novo schema) ======
export async function createContractFromLead(formData: FormData): Promise<void> {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    const s = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    // helpers
    const parseMoney = (raw: string | null): number | null => {
        if (!raw) return null;
        const v = raw.replace(/\./g, "").replace(",", ".");
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    };
    const getBool = (name: string) => formData.get(name) ? true : false;
    const getStr = (name: string) => {
        const v = formData.get(name);
        return v ? String(v).trim() : null;
    };
    const getInt = (name: string) => {
        const v = getStr(name);
        if (!v) return null;
        const n = Number(v);
        return Number.isFinite(n) ? Math.trunc(n) : null;
    };

    // campos do formulário (NOVOS)
    const leadId          = getStr("leadId");
    const administradoraId= getStr("administradoraId");

    const numeroCota      = getStr("numeroCota");      // obrigatório
    const grupoCodigo     = getStr("grupoCodigo");     // obrigatório
    const produto         = (getStr("produto") ?? "imobiliario") as "imobiliario" | "auto" | "pesados";

    const valorCarta      = parseMoney(getStr("valorCarta"));
    const prazo           = getInt("prazo");
    const formaPagamento  = getStr("formaPagamento");
    const indiceCorrecao  = getStr("indiceCorrecao");

    const parcelaReduzida = getBool("parcelaReduzida");
    const fgtsPermitido   = getBool("fgtsPermitido");
    const embutidoPermitido = getBool("embutidoPermitido");
    const autorizacaoGestao = getBool("autorizacaoGestao");

    const dataAdesao      = getStr("dataAdesao");      // yyyy-mm-dd ou null
    const dataAssinatura  = getStr("dataAssinatura");  // yyyy-mm-dd ou null
    const numeroContrato  = getStr("numero");

    // valida mínimas obrigatórias
    if (!leadId || !administradoraId || !numeroCota || !grupoCodigo || !valorCarta) {
        throw new Error("Campos obrigatórios ausentes.");
    }

    // valida lead pertence à org
    {
        const { data: lead, error: leadErr } = await s
            .from("leads")
            .select("id, org_id")
            .eq("id", leadId)
            .single();
        if (leadErr) throw leadErr;
        if (lead?.org_id !== me.orgId) throw new Error("Lead de outra organização.");
    }

    // 1) cria COTA (conforme novo schema)
    const { data: cota, error: cErr } = await s
        .from("cotas")
        .insert({
            org_id: me.orgId,
            lead_id: leadId,
            administradora_id: administradoraId,

            numero_cota: numeroCota,
            grupo_codigo: grupoCodigo,

            valor_carta: valorCarta,
            prazo: prazo,
            forma_pagamento: formaPagamento,
            indice_correcao: indiceCorrecao,

            parcela_reduzida: parcelaReduzida,
            // percentual_reducao / valor_parcela / valor_parcela_sem_redutor podem ser adicionados depois via edição

            embutido_permitido: embutidoPermitido,
            fgts_permitido: fgtsPermitido,
            autorizacao_gestao: autorizacaoGestao,

            produto: produto,
            data_adesao: dataAdesao ?? null,
            situacao: "ativa",
        })
        .select("id")
        .single();
    if (cErr) throw cErr;

    // 2) cria CONTRATO (opcional, mas mantemos como antes)
    const { error: kErr } = await s.from("contratos").insert({
        org_id: me.orgId,
        deal_id: null,
        cota_id: cota.id,
        numero: numeroContrato,
        data_assinatura: dataAssinatura ?? null,
        status: "ativo",
    });
    if (kErr) throw kErr;

    // 3) move LEAD para "ativo" + atualiza updated_at
    const { error: uErr } = await s
        .from("leads")
        .update({ etapa: "ativo", updated_at: new Date().toISOString() })
        .eq("id", leadId)
        .eq("org_id", me.orgId);
    if (uErr) throw uErr;


    // revalidate
    revalidatePath("/app/leads");
    revalidatePath("/app/carteira");
    revalidatePath("/app");
    const cotaId = "...";
    console.log("Contrato criado:", cotaId);
}

