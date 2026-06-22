import { createClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth/server";

export type VendasSeriePoint = {
    mes: string; // YYYY-MM
    label: string; // ex.: "jan/26"
    credito: number;
    creditoAnoAnterior: number;
    clientes: number;
};

export type VendasAnalytics = {
    de: string; // YYYY-MM
    ate: string; // YYYY-MM
    creditoAno: number;
    creditoMes: number;
    clientesNovosMes: number;
    creditoPeriodo: number;
    clientesNovosPeriodo: number;
    vendasPeriodo: number;
    serie: VendasSeriePoint[];
};

type CotaVendaRow = {
    lead_id: string | null;
    status: string | null;
    data_adesao: string | null;
    valor_carta: number | string | null;
};

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

function ymKey(iso: string) {
    return iso.slice(0, 7); // YYYY-MM
}

function addMonthsKey(ym: string, delta: number) {
    const [y, m] = ym.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(ym: string) {
    const [y, m] = ym.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" })
        .format(new Date(y, m - 1, 1))
        .replace(".", "");
}

function monthsBetween(de: string, ate: string) {
    const out: string[] = [];
    let cur = de;
    let guard = 0;
    while (cur <= ate && guard < 240) {
        out.push(cur);
        cur = addMonthsKey(cur, 1);
        guard += 1;
    }
    return out;
}

/**
 * Métricas de vendas (crédito vendido / clientes novos) para o painel.
 * "Venda" = cota com `data_adesao` preenchida e `status` diferente de cancelada;
 * o crédito é o `valor_carta`. `de`/`ate` no formato YYYY-MM.
 */
export async function getVendasAnalytics(de: string, ate: string): Promise<VendasAnalytics | null> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) return null;

    const supa = getAdminClient();
    const { data } = await supa
        .from("cotas")
        .select("lead_id, status, data_adesao, valor_carta")
        .eq("org_id", profile.orgId);

    const rows = (data ?? []) as CotaVendaRow[];

    // Agrega por mês de adesão (apenas vendas válidas).
    const porMes = new Map<string, { credito: number; clientes: Set<string> }>();
    const now = new Date();
    const anoAtual = String(now.getFullYear());
    const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    let creditoAno = 0;
    let creditoMes = 0;
    const clientesMes = new Set<string>();

    for (const row of rows) {
        if (!row.data_adesao) continue;
        if ((row.status ?? "").toLowerCase() === "cancelada") continue;
        const ym = ymKey(row.data_adesao);
        const credito = Number(row.valor_carta ?? 0) || 0;

        const acc = porMes.get(ym) ?? { credito: 0, clientes: new Set<string>() };
        acc.credito += credito;
        if (row.lead_id) acc.clientes.add(row.lead_id);
        porMes.set(ym, acc);

        if (ym.startsWith(anoAtual)) creditoAno += credito;
        if (ym === mesAtual) {
            creditoMes += credito;
            if (row.lead_id) clientesMes.add(row.lead_id);
        }
    }

    const meses = monthsBetween(de, ate);
    const serie: VendasSeriePoint[] = meses.map((ym) => {
        const atual = porMes.get(ym);
        const anterior = porMes.get(addMonthsKey(ym, -12));
        return {
            mes: ym,
            label: monthLabel(ym),
            credito: atual?.credito ?? 0,
            creditoAnoAnterior: anterior?.credito ?? 0,
            clientes: atual?.clientes.size ?? 0,
        };
    });

    const creditoPeriodo = serie.reduce((s, p) => s + p.credito, 0);
    const clientesPeriodoSet = new Set<string>();
    let vendasPeriodo = 0;
    for (const row of rows) {
        if (!row.data_adesao) continue;
        if ((row.status ?? "").toLowerCase() === "cancelada") continue;
        const ym = ymKey(row.data_adesao);
        if (ym >= de && ym <= ate) {
            vendasPeriodo += 1;
            if (row.lead_id) clientesPeriodoSet.add(row.lead_id);
        }
    }

    return {
        de,
        ate,
        creditoAno,
        creditoMes,
        clientesNovosMes: clientesMes.size,
        creditoPeriodo,
        clientesNovosPeriodo: clientesPeriodoSet.size,
        vendasPeriodo,
        serie,
    };
}
