import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";

export type PendenciaSeverity = "high" | "medium";

export type PendenciaItem = {
    id: string;
    categoria: string;
    severity: PendenciaSeverity;
    title: string;
    subtitle: string;
    acaoLabel: string;
    href: string;
};

export type PendenciaGrupo = {
    categoria: string;
    label: string;
    descricao: string;
    severity: PendenciaSeverity;
    items: PendenciaItem[];
};

export type PendenciasData = {
    total: number;
    high: number;
    medium: number;
    grupos: PendenciaGrupo[];
};

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

const brl = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

export async function getPendencias(): Promise<PendenciasData | null> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) return null;

    const supa = getAdminClient();
    const orgId = profile.orgId;

    const [cotasRes, configRes, contratosRes, lancamentosRes, leadsRes] = await Promise.all([
        supa.from("cotas").select("id, numero_cota, grupo_codigo, status, lead_id, assembleia_dia").eq("org_id", orgId),
        supa.from("cota_comissao_config").select("cota_id").eq("org_id", orgId),
        supa.from("contratos").select("id, numero, cota_id, status").eq("org_id", orgId),
        supa
            .from("comissao_lancamentos")
            .select(
                "id, contrato_id, cota_id, parceiro_id, beneficiario_tipo, repasse_status, valor_liquido,"
                + " competencia_prevista, status, observacoes,"
                + " parceiros_corretores(nome), contratos(numero), cotas(numero_cota, grupo_codigo)"
            )
            .eq("org_id", orgId),
        supa.from("leads").select("id, nome").eq("org_id", orgId),
    ]);

    type LancRow = {
        id: string;
        contrato_id: string | null;
        cota_id: string | null;
        parceiro_id: string | null;
        beneficiario_tipo: string | null;
        repasse_status: string | null;
        valor_liquido: number | string | null;
        competencia_prevista: string | null;
        status: string | null;
        observacoes: string | null;
        parceiros_corretores: { nome?: string | null } | null;
        contratos: { numero?: string | null } | null;
        cotas: { numero_cota?: string | null; grupo_codigo?: string | null } | null;
    };

    const cotas = cotasRes.data ?? [];
    const configIds = new Set((configRes.data ?? []).map((r) => r.cota_id));
    const contratos = contratosRes.data ?? [];
    const lancamentos = (lancamentosRes.data ?? []) as unknown as LancRow[];
    const leadNome = new Map<string, string>((leadsRes.data ?? []).map((l) => [l.id, l.nome ?? ""]));

    const cotaLabel = (numero?: string | null, grupo?: string | null) =>
        `Grupo ${grupo || "?"} · Cota ${numero || "?"}`;

    // 1) Cartas ativas sem comissão configurada
    const cotasSemConfig: PendenciaItem[] = cotas
        .filter((c) => (c.status ?? "").toLowerCase() === "ativa" && !configIds.has(c.id))
        .map((c) => ({
            id: `cota-${c.id}`,
            categoria: "comissao_config",
            severity: "high" as const,
            title: c.lead_id ? leadNome.get(c.lead_id) || "Cliente sem nome" : "Cliente sem nome",
            subtitle: `${cotaLabel(c.numero_cota, c.grupo_codigo)} · sem comissão configurada`,
            acaoLabel: "Configurar comissão",
            href: `/app/lances/${c.id}`,
        }));

    // 2) Contratos sem geração de lançamentos
    const contratoIdsComLanc = new Set(lancamentos.map((l) => l.contrato_id).filter(Boolean));
    const contratosSemLanc: PendenciaItem[] = contratos
        .filter((c) => (c.status ?? "").toLowerCase() !== "cancelado" && !contratoIdsComLanc.has(c.id))
        .map((c) => ({
            id: `contrato-${c.id}`,
            categoria: "contrato_sem_lancamento",
            severity: "high" as const,
            title: `Contrato ${c.numero || "sem número"}`,
            subtitle: "Ainda não gerou o financeiro de comissão",
            acaoLabel: "Gerar lançamentos",
            href: `/app/contratos/${c.id}`,
        }));

    // 3) Repasses de parceiro pendentes de baixa.
    // Só conta como pendência até o mês vigente; competências futuras são provisão (ainda não venceram).
    const mesVigente = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    const repassesPendentes: PendenciaItem[] = lancamentos
        .filter(
            (l) =>
                l.beneficiario_tipo === "parceiro" &&
                l.repasse_status === "pendente" &&
                (!l.competencia_prevista || l.competencia_prevista.slice(0, 7) <= mesVigente)
        )
        .map((l) => {
            const parceiro = (l.parceiros_corretores as { nome?: string | null } | null)?.nome || "Parceiro";
            const cota = (l.cotas as { numero_cota?: string | null; grupo_codigo?: string | null } | null) ?? {};
            const valor = Number(l.valor_liquido ?? 0);
            return {
                id: `repasse-${l.id}`,
                categoria: "repasse_pendente",
                severity: "medium" as const,
                title: `Repasse para ${parceiro}`,
                subtitle: `${cotaLabel(cota.numero_cota, cota.grupo_codigo)} · ${brl(valor)} a repassar`,
                acaoLabel: "Dar baixa no repasse",
                href: l.contrato_id ? `/app/contratos/${l.contrato_id}` : "/app/comissoes?tab=repasses",
            };
        });

    // 4) Comissões em cobrança (cliente inadimplente)
    const comissoesInadimplentes: PendenciaItem[] = lancamentos
        .filter(
            (l) =>
                l.status === "previsto" &&
                (l.observacoes ?? "").toUpperCase().includes("INADIMPLENTE")
        )
        .map((l) => {
            const cota = l.cotas ?? {};
            const contratoNum = l.contratos?.numero;
            return {
                id: `inadimplente-${l.id}`,
                categoria: "comissao_inadimplente",
                severity: "high" as const,
                title: contratoNum ? `Contrato ${contratoNum}` : cotaLabel(cota.numero_cota, cota.grupo_codigo),
                subtitle: `${cotaLabel(cota.numero_cota, cota.grupo_codigo)} · cliente em atraso no boleto`,
                acaoLabel: "Resolver cobrança",
                href: l.contrato_id ? `/app/contratos/${l.contrato_id}` : "/app/comissoes?tab=lancamentos",
            };
        });

    // 5) Cartas ativas sem dia de assembleia (pendência de configuração de lance)
    const cartasSemAssembleia: PendenciaItem[] = cotas
        .filter((c) => (c.status ?? "").toLowerCase() === "ativa" && c.assembleia_dia == null)
        .map((c) => ({
            id: `assembleia-${c.id}`,
            categoria: "carta_sem_assembleia",
            severity: "medium" as const,
            title: c.lead_id ? leadNome.get(c.lead_id) || "Cliente sem nome" : "Cliente sem nome",
            subtitle: `${cotaLabel(c.numero_cota, c.grupo_codigo)} · sem dia de assembleia definido`,
            acaoLabel: "Definir assembleia",
            href: `/app/lances/${c.id}`,
        }));

    const grupos: PendenciaGrupo[] = [
        {
            categoria: "comissao_config",
            label: "Cartas sem comissão configurada",
            descricao: "Parametrize a comissão antes de operar a carta.",
            severity: "high" as const,
            items: cotasSemConfig,
        },
        {
            categoria: "contrato_sem_lancamento",
            label: "Contratos sem lançamentos",
            descricao: "Gere o financeiro de comissão do contrato.",
            severity: "high" as const,
            items: contratosSemLanc,
        },
        {
            categoria: "comissao_inadimplente",
            label: "Comissões em cobrança",
            descricao: "Clientes inadimplentes no boleto; comissão travada até regularizar.",
            severity: "high" as const,
            items: comissoesInadimplentes,
        },
        {
            categoria: "repasse_pendente",
            label: "Repasses pendentes",
            descricao: "Repasses de parceiro aguardando baixa (competência até o mês vigente).",
            severity: "medium" as const,
            items: repassesPendentes,
        },
        {
            categoria: "carta_sem_assembleia",
            label: "Cartas sem dia de assembleia",
            descricao: "Defina o dia de assembleia para operar os lances.",
            severity: "medium" as const,
            items: cartasSemAssembleia,
        },
    ].filter((g) => g.items.length > 0);

    const all = grupos.flatMap((g) => g.items);

    return {
        total: all.length,
        high: all.filter((i) => i.severity === "high").length,
        medium: all.filter((i) => i.severity === "medium").length,
        grupos,
    };
}
