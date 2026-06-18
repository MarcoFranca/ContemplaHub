import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";

import { LeadHeader } from "./LeadHeader";
import { LeadDiagnosticCard } from "./LeadDiagnosticCard";
import { LeadPropostasCard } from "./LeadPropostasCard";
import { LeadInfoCard } from "./LeadInfoCard";
import { LeadStrategiesCard } from "./LeadStrategiesCard";
import { LeadCotasCard } from "@/app/app/leads/[leadId]/LeadCotasCard";
import { LeadMetaAdsCard } from "@/app/app/leads/[leadId]/LeadMetaAdsCard";
import { listContractOptions } from "@/app/app/leads/actions";
import { ClienteResumoExecutivo, type ResumoExecutivo } from "./ClienteResumoExecutivo";
import { ClienteComissoesCard, type ComissoesResumo } from "./ClienteComissoesCard";
import { ClienteTimelineCard, type TimelineEvento } from "./ClienteTimelineCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadLead(leadId: string, orgId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("org_id", orgId)
        .eq("id", leadId)
        .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return data;
}

async function loadDiagnostic(leadId: string, orgId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
        .from("lead_diagnosticos")
        .select("*")
        .eq("org_id", orgId)
        .eq("lead_id", leadId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

async function loadCotas(leadId: string, orgId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
        .from("cotas")
        .select(`
      id,
      org_id,
      lead_id,
      administradora_id,
      valor_carta,
      produto,
      data_adesao,
      numero_cota,
      grupo_codigo,
      status,
      valor_parcela,
      prazo,
      assembleia_dia,
      autorizacao_gestao,
      tipo_lance_preferencial,
      estrategia,
      objetivo,
      forma_pagamento,
      indice_correcao,
      parcela_reduzida,
      percentual_reducao,
      valor_parcela_sem_redutor,
      embutido_permitido,
      embutido_max_percent,
      fgts_permitido
    `)
        .eq("org_id", orgId)
        .eq("lead_id", leadId);

    if (error) throw error;
    return data ?? [];
}

async function loadContratos(orgId: string, cotasIds: string[]) {
    if (cotasIds.length === 0) return [];

    const supabase = await supabaseServer();

    const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .eq("org_id", orgId)
        .in("cota_id", cotasIds);

    if (error) throw error;
    return data ?? [];
}

function toNum(v: number | string | null | undefined) {
    if (v == null || v === "") return 0;
    return Number(v) || 0;
}

async function loadComissoes(orgId: string, cotasIds: string[]) {
    if (cotasIds.length === 0) return [];
    const supabase = await supabaseServer();
    const { data, error } = await supabase
        .from("comissao_lancamentos")
        .select("id, cota_id, status, repasse_status, beneficiario_tipo, valor_bruto, valor_liquido")
        .eq("org_id", orgId)
        .in("cota_id", cotasIds);
    if (error) throw error;
    return data ?? [];
}

async function loadAtividades(leadId: string, orgId: string) {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
        .from("activities")
        .select("id, tipo, titulo, descricao, data, created_at")
        .eq("org_id", orgId)
        .eq("lead_id", leadId)
        .order("data", { ascending: false })
        .limit(15);
    if (error) return [];
    return data ?? [];
}

async function loadOpcoesFixo(orgId: string, cotasIds: string[]) {
    if (cotasIds.length === 0) return [];
    const supabase = await supabaseServer();
    const { data, error } = await supabase
        .from("cota_lance_fixo_opcoes")
        .select("id, cota_id, percentual, ordem, ativo, observacoes, created_at")
        .eq("org_id", orgId)
        .in("cota_id", cotasIds);
    if (error) return [];
    return data ?? [];
}

async function loadLancesCliente(orgId: string, cotasIds: string[]) {
    if (cotasIds.length === 0) return [];
    const supabase = await supabaseServer();
    const { data, error } = await supabase
        .from("lances")
        .select("id, cota_id, assembleia_data, tipo, resultado, created_at")
        .eq("org_id", orgId)
        .in("cota_id", cotasIds)
        .order("assembleia_data", { ascending: false })
        .limit(15);
    if (error) return [];
    return data ?? [];
}

export default async function LeadDetailsPage({
                                                  params,
                                              }: {
    params: Promise<{ leadId: string }>;
}) {
    const { leadId } = await params;

    const profile = await getCurrentProfile();
    if (!profile?.orgId) {
        throw new Error("Org inválida");
    }

    const [lead, diagnostic, cotas, contractOptions] = await Promise.all([
        loadLead(leadId, profile.orgId),
        loadDiagnostic(leadId, profile.orgId),
        loadCotas(leadId, profile.orgId),
        listContractOptions(),
    ]);

    const cotasIds = cotas.map((c: { id: string }) => c.id);
    const [contratos, comissoes, atividades, lancesCliente, opcoesFixo] = await Promise.all([
        loadContratos(profile.orgId, cotasIds),
        loadComissoes(profile.orgId, cotasIds),
        loadAtividades(leadId, profile.orgId),
        loadLancesCliente(profile.orgId, cotasIds),
        loadOpcoesFixo(profile.orgId, cotasIds),
    ]);

    const opcoesByCota: Record<string, typeof opcoesFixo> = {};
    for (const op of opcoesFixo) {
        const k = (op as { cota_id?: string | null }).cota_id ?? "";
        if (!k) continue;
        (opcoesByCota[k] ??= []).push(op);
    }

    const now = new Date();
    const competencia = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    if (!lead) notFound();

    // ---- Panorama: KPIs do cliente ----
    const ativas = cotas.filter(
        (c: { status?: string | null }) => c.status !== "cancelada" && c.status !== "contemplada"
    );
    const carteiraSobGestao = ativas.reduce(
        (acc: number, c: { valor_carta?: number | string | null }) => acc + toNum(c.valor_carta),
        0
    );

    const comissaoPrevista = comissoes
        .filter((l) => l.status === "previsto" || l.status === "disponivel")
        .reduce((acc: number, l) => acc + toNum(l.valor_bruto), 0);
    const comissaoDisponivel = comissoes
        .filter((l) => l.status === "disponivel")
        .reduce((acc: number, l) => acc + toNum(l.valor_liquido), 0);
    const comissaoPaga = comissoes
        .filter((l) => l.status === "pago")
        .reduce((acc: number, l) => acc + toNum(l.valor_liquido), 0);
    const repassePendente = comissoes
        .filter((l) => l.beneficiario_tipo === "parceiro" && l.repasse_status === "pendente")
        .reduce((acc: number, l) => acc + toNum(l.valor_liquido), 0);

    const resumo: ResumoExecutivo = {
        totalCartas: cotas.length,
        cartasAtivas: ativas.length,
        carteiraSobGestao,
        comissaoPrevista,
        comissaoPaga,
        totalContratos: contratos.length,
    };

    const comissoesResumo: ComissoesResumo = {
        previsto: comissaoPrevista,
        disponivel: comissaoDisponivel,
        pago: comissaoPaga,
        repassePendente,
        totalLancamentos: comissoes.length,
    };

    // ---- Timeline (atividades + lances + propostas + contratos) ----
    const timeline: TimelineEvento[] = [
        ...atividades.map((a) => ({
            id: a.id,
            tipo: "atividade" as const,
            titulo: a.titulo || a.tipo || "Atividade",
            descricao: a.descricao ?? null,
            data: a.data ?? a.created_at ?? null,
        })),
        ...lancesCliente.map((l) => ({
            id: l.id,
            tipo: "lance" as const,
            titulo: `Lance ${l.tipo ?? ""}`.trim(),
            descricao: l.resultado ? `Resultado: ${l.resultado}` : null,
            data: l.assembleia_data ?? l.created_at ?? null,
        })),
        ...contratos.map((c: { id: string; numero?: string | null; created_at?: string | null; status?: string | null }) => ({
            id: c.id,
            tipo: "contrato" as const,
            titulo: `Contrato ${c.numero ?? ""}`.trim(),
            descricao: c.status ? `Status: ${c.status}` : null,
            data: c.created_at ?? null,
        })),
    ]
        .filter((e) => e.data)
        .sort((a, b) => new Date(b.data as string).getTime() - new Date(a.data as string).getTime())
        .slice(0, 12);

    return (
        <div className="h-full overflow-auto">
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                <LeadHeader lead={lead} />

                <ClienteResumoExecutivo resumo={resumo} />

                <Separator />

                <main className="grid gap-6 lg:grid-cols-[1.3fr_1.2fr]">
                    <div className="space-y-4">
                        <LeadCotasCard
                            leadId={leadId}
                            leadName={lead.nome}
                            cotas={cotas}
                            contratos={contratos}
                            administradoras={contractOptions.administradoras}
                            opcoesByCota={opcoesByCota}
                            competencia={competencia}
                        />

                        <ClienteComissoesCard resumo={comissoesResumo} />

                        <LeadDiagnosticCard
                            leadId={leadId}
                            leadName={lead.nome}
                        />

                        <LeadPropostasCard leadId={leadId} />
                    </div>

                    <div className="space-y-4">
                        <LeadInfoCard lead={lead} />
                        <ClienteTimelineCard eventos={timeline} />
                        <LeadMetaAdsCard lead={lead} diagnostic={diagnostic} />
                        <LeadStrategiesCard lead={lead} />
                    </div>
                </main>
            </div>
        </div>
    );
}
