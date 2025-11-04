"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";

// ====== Supabase SR client ======
function srv() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

// ====== Tipos ======
export type Stage =
    | "novo"
    | "diagnostico"
    | "proposta"
    | "negociacao"
    | "fechamento"
    | "ativo"
    | "perdido";

export type CanalOrigem = "lp" | "whatsapp" | "indicacao" | "orgânico" | "pago" | "outro";

export type LeadCardInterest = {
    produto?: string | null;
    valorTotal?: string | null;   // numeric como string
    prazoMeses?: number | null;
    objetivo?: string | null;
    perfilDesejado?: string | null;
    observacao?: string | null;
};

export type LeadCard = {
    id: string;
    nome: string | null;
    telefone?: string | null;
    email?: string | null;
    etapa: Stage;
    owner_id: string | null;
    created_at: string;
    utm_source?: string | null;
    origem?: CanalOrigem | null;

    // (legado) pode existir no leads antigo
    valor_interesse?: string | null;
    prazo_meses?: number | null;

    // resumo do interesse aberto mais recente (lead_interesses)
    interest?: LeadCardInterest | null;
};

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

export async function listLeadsForKanban(args: ListArgs = {}) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    const s = srv();
    let q = s
        .from("leads")
        .select(
            "id, nome, telefone, email, etapa, owner_id, created_at, utm_source, origem, valor_interesse, prazo_meses"
        )
        .eq("org_id", me.orgId)
        .order("created_at", { ascending: false });

    // escopo
    const scope = args.scope ?? "me";
    const canSeeTeam = !!me.isManager;
    if (scope === "me" || !canSeeTeam) {
        q = q.eq("owner_id", me.userId);
    }

    // filtros de etapa
    const hideLost = !args.showLost;
    const hideActive = !args.showActive;
    if (hideLost && hideActive) {
        q = q.in("etapa", ["novo", "diagnostico", "proposta", "negociacao", "fechamento"]);
    } else {
        const allowed: Stage[] = ["novo", "diagnostico", "proposta", "negociacao", "fechamento"];
        if (!hideActive) allowed.push("ativo");
        if (!hideLost) allowed.push("perdido");
        q = q.in("etapa", allowed);
    }

    const { data, error } = await q;
    if (error) throw error;

    const leads = (data ?? []) as LeadCard[];
    if (leads.length === 0) return leads;

    // Busca 1 interesse "aberto" mais recente por lead
    const leadIds = leads.map((l) => l.id);
    const { data: ints, error: iErr } = await s
        .from("lead_interesses")
        .select(
            "lead_id, produto, valor_total, prazo_meses, objetivo, perfil_desejado, observacao, created_at"
        )
        .eq("org_id", me.orgId)
        .in("lead_id", leadIds)
        .eq("status", "aberto")
        .order("created_at", { ascending: false });

    if (iErr) throw iErr;

    const firstByLead = new Map<
        string,
        {
            produto: string | null;
            valor_total: string | null;
            prazo_meses: number | null;
            objetivo: string | null;
            perfil_desejado: string | null;
            observacao: string | null;
        }
    >();

    (ints ?? []).forEach((row) => {
        if (!firstByLead.has(row.lead_id)) {
            firstByLead.set(row.lead_id, {
                produto: row.produto ?? null,
                valor_total: row.valor_total ?? null,
                prazo_meses: row.prazo_meses ?? null,
                objetivo: row.objetivo ?? null,
                perfil_desejado: row.perfil_desejado ?? null,
                observacao: row.observacao ?? null,
            });
        }
    });

    // Enriquecimento
    const enriched = leads.map((l) => {
        const i = firstByLead.get(l.id);
        const interest: LeadCardInterest | null = i
            ? {
                produto: i.produto,
                valorTotal: i.valor_total,
                prazoMeses: i.prazo_meses,
                objetivo: i.objetivo,
                perfilDesejado: i.perfil_desejado,
                observacao: i.observacao,
            }
            : null;

        return { ...l, interest };
    });

    return enriched;
}

// ====== Movimentação de estágio com histórico ======
export async function moveLeadStage(payload: {
    leadId: string;
    to: Stage;
    reason?: string;
}) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    const s = srv();

    const { data: current, error: cErr } = await s
        .from("leads")
        .select("id, etapa")
        .eq("id", payload.leadId)
        .eq("org_id", me.orgId)
        .single();
    if (cErr) throw cErr;

    const fromStage = (current?.etapa ?? null) as Stage | null;

    const { error: uErr, data: updated } = await s
        .from("leads")
        .update({ etapa: payload.to, updated_at: new Date().toISOString() })
        .eq("id", payload.leadId)
        .eq("org_id", me.orgId)
        .select("id, etapa")
        .single();
    if (uErr) throw uErr;

    const { error: hErr } = await s.from("lead_stage_history").insert([
        {
            lead_id: payload.leadId,
            from_stage: fromStage,
            to_stage: payload.to,
            moved_by: me.userId,
            reason: payload.reason ?? null,
        },
    ]);
    if (hErr) throw hErr;

    revalidatePath("/app/leads");
    revalidatePath("/app");
    return updated;
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
        s.from("administradoras").select("id, nome").eq("org_id", me.orgId).order("nome", { ascending: true }),
        s.from("grupos").select("id, administradora_id, codigo").eq("org_id", me.orgId).order("codigo", { ascending: true }),
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

// ====== Criar contrato + cota e mover lead para "ativo" ======
export async function createContractFromLead(formData: FormData) {
    const me = await getCurrentProfile();
    if (!me?.orgId) throw new Error("Sem organização.");

    const s = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    const leadId = String(formData.get("leadId") ?? "");
    const administradoraId = String(formData.get("administradoraId") ?? "");
    const grupoId = String(formData.get("grupoId") ?? "");
    const valorCartaStr = String(formData.get("valorCarta") ?? "");
    const produto = String(formData.get("produto") ?? "imobiliario");
    const dataAdesao = String(formData.get("dataAdesao") ?? "");
    const dataAssinatura = String(formData.get("dataAssinatura") ?? "");
    const numero = formData.get("numero") ? String(formData.get("numero")) : null;

    if (!leadId || !administradoraId || !grupoId || !valorCartaStr) {
        throw new Error("Campos obrigatórios ausentes.");
    }

    const valorCarta = valorCartaStr.replace(/\./g, "").replace(",", ".");

    // valida lead pertence à org
    const { data: lead, error: leadErr } = await s
        .from("leads")
        .select("id, org_id")
        .eq("id", leadId)
        .single();
    if (leadErr) throw leadErr;
    if (lead?.org_id !== me.orgId) throw new Error("Lead de outra organização.");

    // 1) cria cota
    const { data: cota, error: cErr } = await s
        .from("cotas")
        .insert({
            org_id: me.orgId,
            lead_id: leadId,
            administradora_id: administradoraId,
            grupo_id: grupoId,
            valor_carta: valorCarta,
            produto,
            data_adesao: dataAdesao,
            situacao: "ativa",
        })
        .select("id")
        .single();
    if (cErr) throw cErr;

    // 2) cria contrato
    const { error: kErr } = await s.from("contratos").insert({
        org_id: me.orgId,
        deal_id: null,
        cota_id: cota.id,
        numero,
        data_assinatura: dataAssinatura,
        status: "ativo",
    });
    if (kErr) throw kErr;

    // 3) move lead para "ativo" + histórico
    const { error: uErr } = await s
        .from("leads")
        .update({ etapa: "ativo", updated_at: new Date().toISOString() })
        .eq("id", leadId)
        .eq("org_id", me.orgId);
    if (uErr) throw uErr;

    revalidatePath("/app/leads");
    revalidatePath("/app/carteira");
    revalidatePath("/app");
}
