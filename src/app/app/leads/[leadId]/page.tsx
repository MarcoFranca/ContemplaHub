// src/app/app/leads/[leadId]/page.tsx
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";

import { LeadHeader } from "./LeadHeader";
import { LeadDiagnosticCard } from "./LeadDiagnosticCard";
import { LeadPropostasCard } from "./LeadPropostasCard";
import { LeadInfoCard } from "./LeadInfoCard";
import { LeadStrategiesCard } from "./LeadStrategiesCard";
import {LeadCotasCard} from "@/app/app/leads/[leadId]/LeadCotasCard"; // 👈 ADICIONA ISSO

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
    return data; // pode ser null
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
            situacao,
            data_adesao,
            numero_cota,
            grupo_codigo,
            valor_parcela,
            prazo,
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
    const supabase = await supabaseServer();

    const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .eq("org_id", orgId)
        .in("cota_id", cotasIds);

    if (error) throw error;
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

    const [lead, diagnostico, cotas] = await Promise.all([
        loadLead(leadId, profile.orgId),
        loadDiagnostic(leadId, profile.orgId),
        loadCotas(leadId, profile.orgId),
    ]);

    const contratos = await loadContratos(
        profile.orgId,
        cotas.map((c: any) => c.id)
    );

    if (!lead) notFound();

    return (
        <div className="h-full overflow-auto">
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                <LeadHeader lead={lead} />
                <Separator />
                <main className="grid gap-6 lg:grid-cols-[1.7fr_1.1fr]">
                    {/* COLUNA ESQUERDA */}
                    <div className="space-y-4">
                        <LeadDiagnosticCard
                            leadId={leadId}
                            leadName={lead.nome}
                            diagnostico={diagnostico}
                        />

                        <LeadPropostasCard leadId={leadId} />
                    </div>

                    {/* COLUNA DIREITA */}
                    <div className="space-y-4">
                        <LeadInfoCard lead={lead} />

                        {/* 👇 NOVO CARD DE ESTRATÉGIAS */}
                        <LeadStrategiesCard lead={lead} />
                    </div>
                    <div className="space-y-4">
                        <LeadInfoCard lead={lead}/>
                        <LeadCotasCard cotas={cotas} contratos={contratos} />
                    </div>

                </main>
            </div>
        </div>
    );
}
