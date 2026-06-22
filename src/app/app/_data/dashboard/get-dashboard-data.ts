import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";

export type DashboardSummary = {
    leadsNovos: number;
    diagnosticosConcluidos: number;
    propostasAtivas: number;
    contratosFechados: number;
    cotasEmOperacao: number;
    comissaoPrevistaMes: number;
    repassePendente: number;
    delta: {
        leadsNovos: number;
        diagnosticosConcluidos: number;
        propostasAtivas: number;
        contratosFechados: number;
        cotasEmOperacao: number;
        comissaoPrevistaMes: number;
        repassePendente: number;
    };
};

export type AttentionItem = {
    id: string;
    title: string;
    description: string;
    href: string;
    severity: "high" | "medium";
};

export type FunnelItem = {
    label: string;
    value: number;
};

export type OperationalItem = {
    id: string;
    title: string;
    subtitle: string;
    dateLabel: string;
    href: string;
};

export type FinancialPreview = {
    previsto: number;
    disponivel: number;
    pago: number;
    repassePendente: number;
    porAdministradora: Array<{
        label: string;
        value: number;
    }>;
};

export type ActivityItem = {
    id: string;
    tipo?: string | null;
    titulo: string;
    descricao?: string | null;
    data?: string | null;
    lead_id?: string | null;
    lead_nome?: string | null;
};

export type SellerRankingItem = {
    user_id: string;
    nome: string;
    total_leads: number;
    total_contratos: number;
};

export type PriorityItem = {
    id: string;
    nome: string;
    etapa: string;
    owner?: string | null;
    readiness?: number | null;
    proximo_passo: string;
    href: string;
};

export type MonthlyPoint = {
    month: string;
    leads: number;
    contratos: number;
    comissao: number;
};

export type DashboardAnalytics = {
    taxaConversao: number; // contratos / leads (mês) em %
    ticketMedioCarta: number;
    carteiraSobGestao: number;
    contratosNoMes: number;
};

export type DashboardData = {
    profile: Awaited<ReturnType<typeof getCurrentProfile>> | null;
    summary: DashboardSummary;
    attentionItems: AttentionItem[];
    commercialFunnel: FunnelItem[];
    operationalAgenda: OperationalItem[];
    financialPreview: FinancialPreview;
    activityItems: ActivityItem[];
    sellerRanking: SellerRankingItem[];
    priorityItems: PriorityItem[];
    monthlySeries: MonthlyPoint[];
    cotasPorStatus: FunnelItem[];
    cotasPorProduto: FunnelItem[];
    analytics: DashboardAnalytics;
};

type KanbanMetricRow = {
    etapa: string;
    count: number;
    conversion?: number | null;
};

type CotaRow = {
    id: string;
    status: string | null;
    grupo_codigo: string | null;
    numero_cota: string | null;
    administradora_id: string | null;
    assembleia_dia: number | null;
    data_adesao: string | null;
    produto: string | null;
    valor_carta: number | string | null;
};

type ContratoRow = {
    id: string;
    numero: string | null;
    cota_id: string | null;
    status: string | null;
    created_at: string | null;
};

type LancamentoRow = {
    id: string;
    contrato_id: string | null;
    cota_id: string | null;
    status: string | null;
    repasse_status: string | null;
    beneficiario_tipo: string | null;
    valor_bruto: number | string | null;
    valor_liquido: number | string | null;
    competencia_prevista: string | null;
    created_at: string | null;
};

type AdministradoraRow = {
    id: string;
    nome: string | null;
};

type ActivityRow = {
    id: string;
    tipo?: string | null;
    titulo?: string | null;
    descricao?: string | null;
    data?: string | null;
    lead_id?: string | null;
};

type ProfileRow = {
    user_id: string;
    nome?: string | null;
    role?: string | null;
};

type LeadRow = {
    id: string;
    nome?: string | null;
    owner_id?: string | null;
    stage?: string | null;
    readiness_score?: number | null;
    first_contact_at?: string | null;
    last_activity?: string | null;
    created_at?: string | null;
};

type DealRow = {
    id: string;
    owner_id?: string | null;
    status?: string | null;
    lead_id?: string | null;
};

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: { persistSession: false },
        }
    );
}

function startOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfPreviousMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function endOfPreviousMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59, 999);
}

function startOfLast7Days(date = new Date()) {
    return new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
}

function monthKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Últimos N meses (mais antigo → mais recente). */
function lastMonths(n: number, ref = new Date()) {
    const out: Array<{ key: string; label: string }> = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
        out.push({
            key: monthKey(d),
            label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        });
    }
    return out;
}

function formatDelta(current: number, previous: number) {
    if (!previous && !current) return 0;
    if (!previous && current > 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
}

function brDate(value?: string | null) {
    if (!value) return "Sem data";
    return new Date(value).toLocaleDateString("pt-BR");
}

function toNumber(value: number | string | null | undefined) {
    if (value == null || value === "") return 0;
    return Number(value) || 0;
}

async function getCotasComConfigIds(
    supa: ReturnType<typeof getAdminClient>,
    orgId: string
): Promise<Set<string>> {
    const { data, error } = await supa
        .from("cota_comissao_config")
        .select("cota_id")
        .eq("org_id", orgId);

    if (error) {
        console.error("Erro ao buscar cotas com comissão configurada:", error);
        return new Set();
    }

    return new Set((data ?? []).map((item) => item.cota_id).filter(Boolean));
}

export async function getDashboardData(): Promise<DashboardData> {
    const profile = await getCurrentProfile();

    if (!profile?.orgId) {
        return {
            profile: null,
            summary: {
                leadsNovos: 0,
                diagnosticosConcluidos: 0,
                propostasAtivas: 0,
                contratosFechados: 0,
                cotasEmOperacao: 0,
                comissaoPrevistaMes: 0,
                repassePendente: 0,
                delta: {
                    leadsNovos: 0,
                    diagnosticosConcluidos: 0,
                    propostasAtivas: 0,
                    contratosFechados: 0,
                    cotasEmOperacao: 0,
                    comissaoPrevistaMes: 0,
                    repassePendente: 0,
                },
            },
            attentionItems: [],
            commercialFunnel: [],
            operationalAgenda: [],
            financialPreview: {
                previsto: 0,
                disponivel: 0,
                pago: 0,
                repassePendente: 0,
                porAdministradora: [],
            },
            activityItems: [],
            sellerRanking: [],
            priorityItems: [],
            monthlySeries: [],
            cotasPorStatus: [],
            cotasPorProduto: [],
            analytics: {
                taxaConversao: 0,
                ticketMedioCarta: 0,
                carteiraSobGestao: 0,
                contratosNoMes: 0,
            },
        };
    }

    const supa = getAdminClient();
    const orgId = profile.orgId;
    const now = new Date();

    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const prevMonthStart = startOfPreviousMonth(now);
    const prevMonthEnd = endOfPreviousMonth(now);
    const last7Days = startOfLast7Days(now);

    const cotasComConfigIds = await getCotasComConfigIds(supa, orgId);

    const [
        kanbanMetricsResp,
        leadsCurrentResp,
        leadsPrevResp,
        diagnosticosCurrentResp,
        diagnosticosPrevResp,
        propostasCurrentResp,
        propostasPrevResp,
        contratosCurrentResp,
        contratosPrevResp,
        cotasResp,
        contemplacoesRecentResp,
        contratosResp,
        comissaoLancamentosResp,
        operadorasResp,
        activitiesResp,
        profilesResp,
        leadsForRankingResp,
        dealsResp,
        contratos6mResp,
    ] = await Promise.all([
        supa.rpc("get_kanban_metrics", { p_org: orgId }),

        supa
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("org_id", orgId)
            .gte("created_at", currentMonthStart.toISOString())
            .lte("created_at", currentMonthEnd.toISOString()),

        supa
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("org_id", orgId)
            .gte("created_at", prevMonthStart.toISOString())
            .lte("created_at", prevMonthEnd.toISOString()),

        supa
            .from("lead_diagnosticos")
            .select("id", { count: "exact", head: true })
            .eq("org_id", orgId)
            .gte("created_at", currentMonthStart.toISOString())
            .lte("created_at", currentMonthEnd.toISOString()),

        supa
            .from("lead_diagnosticos")
            .select("id", { count: "exact", head: true })
            .eq("org_id", orgId)
            .gte("created_at", prevMonthStart.toISOString())
            .lte("created_at", prevMonthEnd.toISOString()),

        supa
            .from("propostas")
            .select("id", { count: "exact", head: true })
            .eq("org_id", orgId)
            .gte("created_at", currentMonthStart.toISOString())
            .lte("created_at", currentMonthEnd.toISOString()),

        supa
            .from("propostas")
            .select("id", { count: "exact", head: true })
            .eq("org_id", orgId)
            .gte("created_at", prevMonthStart.toISOString())
            .lte("created_at", prevMonthEnd.toISOString()),

        supa
            .from("contratos")
            .select("id", { count: "exact", head: true })
            .eq("org_id", orgId)
            .gte("created_at", currentMonthStart.toISOString())
            .lte("created_at", currentMonthEnd.toISOString()),

        supa
            .from("contratos")
            .select("id", { count: "exact", head: true })
            .eq("org_id", orgId)
            .gte("created_at", prevMonthStart.toISOString())
            .lte("created_at", prevMonthEnd.toISOString()),

        supa
            .from("cotas")
            .select("id, status, grupo_codigo, numero_cota, administradora_id, assembleia_dia, data_adesao, produto, valor_carta")
            .eq("org_id", orgId),

        supa
            .from("contemplacoes")
            .select("id, data, cota_id")
            .eq("org_id", orgId)
            .gte("data", last7Days.toISOString().slice(0, 10))
            .order("data", { ascending: false })
            .limit(5),

        supa
            .from("contratos")
            .select("id, numero, cota_id, status, created_at")
            .eq("org_id", orgId)
            .order("created_at", { ascending: false })
            .limit(10),

        supa
            .from("comissao_lancamentos")
            .select("id, contrato_id, cota_id, status, repasse_status, beneficiario_tipo, valor_bruto, valor_liquido, competencia_prevista, created_at")
            .eq("org_id", orgId),

        supa
            .from("administradoras")
            .select("id, nome")
            .eq("org_id", orgId),

        supa
            .from("activities")
            .select("id, tipo, titulo, descricao, data, lead_id")
            .eq("org_id", orgId)
            .order("data", { ascending: true })
            .limit(8),

        supa
            .from("profiles")
            .select("user_id, nome, role")
            .eq("org_id", orgId),

        supa
            .from("leads")
            .select("id, nome, owner_id, stage, readiness_score, first_contact_at, last_activity, created_at")
            .eq("org_id", orgId),

        supa
            .from("deals")
            .select("id, owner_id, status, lead_id")
            .eq("org_id", orgId),

        supa
            .from("contratos")
            .select("id, created_at")
            .eq("org_id", orgId)
            .gte("created_at", startOfMonth(new Date(now.getFullYear(), now.getMonth() - 5, 1)).toISOString()),
    ]);

    const kanbanMetrics = (kanbanMetricsResp.data ?? []) as KanbanMetricRow[];
    const cotas = (cotasResp.data ?? []) as CotaRow[];
    const contratos = (contratosResp.data ?? []) as ContratoRow[];
    const contemplacoesRecentes = contemplacoesRecentResp.data ?? [];
    const lancamentos = (comissaoLancamentosResp.data ?? []) as LancamentoRow[];
    const administradoras = (operadorasResp.data ?? []) as AdministradoraRow[];
    const activities = (activitiesResp.data ?? []) as ActivityRow[];
    const profiles = (profilesResp.data ?? []) as ProfileRow[];
    const leadsForRanking = (leadsForRankingResp.data ?? []) as LeadRow[];
    const deals = (dealsResp.data ?? []) as DealRow[];

    const leadsNovos = leadsCurrentResp.count ?? 0;
    const leadsNovosPrev = leadsPrevResp.count ?? 0;
    const diagnosticosConcluidos = diagnosticosCurrentResp.count ?? 0;
    const diagnosticosConcluidosPrev = diagnosticosPrevResp.count ?? 0;
    const propostasAtivas = propostasCurrentResp.count ?? 0;
    const propostasAtivasPrev = propostasPrevResp.count ?? 0;
    const contratosFechados = contratosCurrentResp.count ?? 0;
    const contratosFechadosPrev = contratosPrevResp.count ?? 0;

    const cotasEmOperacao = cotas.filter(
        (c) => c.status !== "cancelada" && c.status !== "contemplada"
    ).length;

    const cotasSemComissao = cotas.filter(
        (c) =>
            c.status !== "cancelada" &&
            c.status !== "contemplada" &&
            !cotasComConfigIds.has(c.id)
    ).length;

    const profileById = new Map(profiles.map((p) => [p.user_id, p]));
    const leadById = new Map(leadsForRanking.map((l) => [l.id, l]));
    const adminById = new Map(administradoras.map((a) => [a.id, a.nome ?? "Sem administradora"]));
    const cotaById = new Map(cotas.map((c) => [c.id, c]));

    const previsto = lancamentos
        .filter((l) => l.status === "previsto" || l.status === "disponivel")
        .reduce((acc, item) => acc + toNumber(item.valor_bruto), 0);

    const disponivel = lancamentos
        .filter((l) => l.status === "disponivel")
        .reduce((acc, item) => acc + toNumber(item.valor_liquido), 0);

    const pago = lancamentos
        .filter((l) => l.status === "pago")
        .reduce((acc, item) => acc + toNumber(item.valor_liquido), 0);

    const repassePendente = lancamentos
        .filter(
            (l) =>
                l.beneficiario_tipo === "parceiro" &&
                l.repasse_status === "pendente"
        )
        .reduce((acc, item) => acc + toNumber(item.valor_liquido), 0);

    const porAdministradoraMap = new Map<string, number>();

    for (const lanc of lancamentos) {
        const cota = lanc.cota_id ? cotaById.get(lanc.cota_id) : null;
        const adminName = cota?.administradora_id
            ? adminById.get(cota.administradora_id) ?? "Sem administradora"
            : "Sem administradora";

        porAdministradoraMap.set(
            adminName,
            (porAdministradoraMap.get(adminName) ?? 0) + toNumber(lanc.valor_liquido)
        );
    }

    const porAdministradora = Array.from(porAdministradoraMap.entries()).map(
        ([label, value]) => ({ label, value })
    );

    const activityItems: ActivityItem[] = activities.map((item) => {
        const lead = item.lead_id ? leadById.get(item.lead_id) : null;

        return {
            id: item.id,
            tipo: item.tipo ?? null,
            titulo: item.titulo || "Atividade",
            descricao: item.descricao ?? null,
            data: item.data ?? null,
            lead_id: item.lead_id ?? null,
            lead_nome: lead?.nome ?? null,
        };
    });

    const sellerMap = new Map<string, SellerRankingItem>();

    for (const lead of leadsForRanking) {
        const ownerId = lead.owner_id;
        if (!ownerId) continue;

        const profileRow = profileById.get(ownerId);
        const current = sellerMap.get(ownerId) ?? {
            user_id: ownerId,
            nome: profileRow?.nome ?? "Sem nome",
            total_leads: 0,
            total_contratos: 0,
        };

        current.total_leads += 1;
        sellerMap.set(ownerId, current);
    }

    for (const deal of deals) {
        const ownerId = deal.owner_id;
        if (!ownerId) continue;

        const status = (deal.status ?? "").toLowerCase();
        if (!["won", "fechado", "contrato"].includes(status)) continue;

        const profileRow = profileById.get(ownerId);
        const current = sellerMap.get(ownerId) ?? {
            user_id: ownerId,
            nome: profileRow?.nome ?? "Sem nome",
            total_leads: 0,
            total_contratos: 0,
        };

        current.total_contratos += 1;
        sellerMap.set(ownerId, current);
    }

    const sellerRanking = Array.from(sellerMap.values())
        .sort((a, b) => b.total_contratos - a.total_contratos || b.total_leads - a.total_leads)
        .slice(0, 5);

    const priorityItems: PriorityItem[] = leadsForRanking
        .filter((lead) => {
            const readiness = Number(lead.readiness_score ?? 0);
            const semContato = !lead.first_contact_at;
            return readiness >= 60 || semContato;
        })
        .slice(0, 8)
        .map((lead) => ({
            id: lead.id,
            nome: lead.nome ?? "Lead sem nome",
            etapa: lead.stage ?? "novo",
            owner: lead.owner_id ? profileById.get(lead.owner_id)?.nome ?? null : null,
            readiness: lead.readiness_score ?? null,
            proximo_passo: !lead.first_contact_at
                ? "Fazer primeiro contato"
                : "Revisar andamento e avançar etapa",
            href: "/app/carteira",
        }));

    const contratosSemLancamentos = contratos.filter(
        (contrato) => !lancamentos.some((l) => l.contrato_id === contrato.id)
    );

    const attentionItems: AttentionItem[] = [];

    if (cotasSemComissao > 0) {
        attentionItems.push({
            id: "cotas-sem-comissao",
            title: "Cartas sem comissão configurada",
            description: `${cotasSemComissao} carta(s) precisam de parametrização antes da operação.`,
            href: "/app/pendencias?cat=comissao_config",
            severity: "high",
        });
    }

    if (contratosSemLancamentos.length > 0) {
        attentionItems.push({
            id: "contratos-sem-lancamento",
            title: "Contratos sem geração de lançamentos",
            description: `${contratosSemLancamentos.length} contrato(s) ainda não geraram financeiro de comissão.`,
            href: "/app/pendencias?cat=contrato_sem_lancamento",
            severity: "high",
        });
    }

    if (repassePendente > 0) {
        attentionItems.push({
            id: "repasse-pendente",
            title: "Repasses pendentes",
            description: "Existem repasses de parceiro aguardando baixa financeira.",
            href: "/app/pendencias?cat=repasse_pendente",
            severity: "medium",
        });
    }

    const commercialFunnel: FunnelItem[] = [
        "novo",
        "contato",
        "diagnostico",
        "proposta",
        "negociacao",
        "contrato",
    ].map((stage) => {
        const item = kanbanMetrics.find((m) => m.etapa === stage);

        return {
            label:
                stage === "novo"
                    ? "Novos"
                    : stage === "contato"
                        ? "Contato"
                        : stage === "diagnostico"
                            ? "Diagnóstico"
                            : stage === "proposta"
                                ? "Proposta"
                                : stage === "negociacao"
                                    ? "Negociação"
                                    : "Contrato",
            value: item?.count ?? 0,
        };
    });

    const operationalAgenda: OperationalItem[] = [
        ...cotas
            .filter((c) => c.status === "ativa" && c.assembleia_dia)
            .slice(0, 5)
            .map((c) => ({
                id: `assembleia-${c.id}`,
                title: `Assembleia grupo ${c.grupo_codigo ?? "-"}`,
                subtitle: `Cota ${c.numero_cota ?? "-"} • dia ${c.assembleia_dia}`,
                dateLabel: c.assembleia_dia ? `Dia ${c.assembleia_dia}` : "Sem agenda",
                href: "/app/lances",
            })),
        ...contemplacoesRecentes.slice(0, 3).map((c) => ({
            id: `contemplacao-${c.id}`,
            title: "Contemplação recente",
            subtitle: `Cota ${c.cota_id}`,
            dateLabel: brDate(c.data),
            href: "/app/lances",
        })),
    ].slice(0, 6);

    const summary: DashboardSummary = {
        leadsNovos,
        diagnosticosConcluidos,
        propostasAtivas,
        contratosFechados,
        cotasEmOperacao,
        comissaoPrevistaMes: previsto,
        repassePendente,
        delta: {
            leadsNovos: formatDelta(leadsNovos, leadsNovosPrev),
            diagnosticosConcluidos: formatDelta(diagnosticosConcluidos, diagnosticosConcluidosPrev),
            propostasAtivas: formatDelta(propostasAtivas, propostasAtivasPrev),
            contratosFechados: formatDelta(contratosFechados, contratosFechadosPrev),
            cotasEmOperacao: 0,
            comissaoPrevistaMes: 0,
            repassePendente: 0,
        },
    };

    const financialPreview: FinancialPreview = {
        previsto,
        disponivel,
        pago,
        repassePendente,
        porAdministradora: porAdministradora.length
            ? porAdministradora
            : [{ label: "Sem dados", value: 0 }],
    };

    // --- Série mensal (últimos 6 meses): leads, contratos, comissão prevista ---
    const meses = lastMonths(6, now);
    const contratos6m = (contratos6mResp.data ?? []) as Array<{ id: string; created_at: string | null }>;

    const leadsPorMes = new Map<string, number>();
    for (const l of leadsForRanking) {
        if (!l.created_at) continue;
        const k = monthKey(new Date(l.created_at));
        leadsPorMes.set(k, (leadsPorMes.get(k) ?? 0) + 1);
    }

    const contratosPorMes = new Map<string, number>();
    for (const c of contratos6m) {
        if (!c.created_at) continue;
        const k = monthKey(new Date(c.created_at));
        contratosPorMes.set(k, (contratosPorMes.get(k) ?? 0) + 1);
    }

    const comissaoPorMes = new Map<string, number>();
    for (const lanc of lancamentos) {
        if (!lanc.competencia_prevista) continue;
        const k = monthKey(new Date(lanc.competencia_prevista));
        comissaoPorMes.set(k, (comissaoPorMes.get(k) ?? 0) + toNumber(lanc.valor_bruto));
    }

    const monthlySeries: MonthlyPoint[] = meses.map((m) => ({
        month: m.label,
        leads: leadsPorMes.get(m.key) ?? 0,
        contratos: contratosPorMes.get(m.key) ?? 0,
        comissao: Math.round(comissaoPorMes.get(m.key) ?? 0),
    }));

    // --- Distribuição de cotas ---
    const statusLabels: Record<string, string> = {
        ativa: "Ativas",
        contemplada: "Contempladas",
        cancelada: "Canceladas",
    };
    const statusMap = new Map<string, number>();
    for (const c of cotas) {
        const label = statusLabels[c.status ?? ""] ?? "Outras";
        statusMap.set(label, (statusMap.get(label) ?? 0) + 1);
    }
    const cotasPorStatus: FunnelItem[] = Array.from(statusMap.entries()).map(
        ([label, value]) => ({ label, value })
    );

    const produtoLabels: Record<string, string> = {
        imobiliario: "Imóvel",
        auto: "Automóvel",
    };
    const cotasEmOperacaoRows = cotas.filter(
        (c) => c.status !== "cancelada" && c.status !== "contemplada"
    );
    const produtoMap = new Map<string, number>();
    for (const c of cotasEmOperacaoRows) {
        const label = produtoLabels[c.produto ?? ""] ?? "Outros";
        produtoMap.set(label, (produtoMap.get(label) ?? 0) + 1);
    }
    const cotasPorProduto: FunnelItem[] = Array.from(produtoMap.entries()).map(
        ([label, value]) => ({ label, value })
    );

    // --- KPIs cruzados ---
    const carteiraSobGestao = cotasEmOperacaoRows.reduce(
        (acc, c) => acc + toNumber(c.valor_carta),
        0
    );
    const ticketMedioCarta = cotasEmOperacaoRows.length
        ? carteiraSobGestao / cotasEmOperacaoRows.length
        : 0;
    const taxaConversao = leadsNovos > 0 ? Math.round((contratosFechados / leadsNovos) * 100) : 0;

    const analytics: DashboardAnalytics = {
        taxaConversao,
        ticketMedioCarta,
        carteiraSobGestao,
        contratosNoMes: contratosFechados,
    };

    return {
        profile,
        summary,
        attentionItems,
        commercialFunnel,
        operationalAgenda,
        financialPreview,
        activityItems,
        sellerRanking,
        priorityItems,
        monthlySeries,
        cotasPorStatus,
        cotasPorProduto,
        analytics,
    };
}