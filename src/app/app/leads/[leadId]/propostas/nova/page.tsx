// src/app/app/leads/[leadId]/propostas/nova/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { NewProposalForm } from "./NovaPropostaForm";

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
    return data;
}

export default async function NovaPropostaPage({
                                                   params,
                                               }: {
    params: Promise<{ leadId: string }>;
}) {
    const { leadId } = await params;

    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error("Org inválida");

    const lead = await loadLead(leadId, profile.orgId);
    if (!lead) notFound();

    return (
        <div className="h-full isolate overflow-auto relative text-slate-50">
            <div className="h-full isolate overflow-auto relative text-slate-50">

                <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                    {/* breadcrumb + título */}
                    <header className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Link
                                href={`/app/leads/${leadId}`}
                                className="text-xs text-slate-400 hover:text-slate-100"
                            >
                                ← Voltar para o lead
                            </Link>
                        </div>

                        <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-emerald-200">
            Nova Proposta
          </span>
                    </header>

                    {/* card com info do cliente */}
                    <Card className="border-emerald-500/20 bg-slate-950/80">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center justify-between gap-3">
                                <span>{lead.nome ?? "Cliente sem nome"}</span>
                                <span className="text-xs text-slate-400">
                Origem: {lead.origem ?? "—"}
              </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-slate-300 flex flex-wrap gap-4">
                            <div>
                                <span className="font-semibold text-slate-100">Telefone</span>{" "}
                                <span>{lead.telefone ?? "—"}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-100">E-mail</span>{" "}
                                <span>{lead.email ?? "—"}</span>
                            </div>
                            <div>
              <span className="font-semibold text-slate-100">
                Valor interesse
              </span>{" "}
                                <span>{lead.valor_interesse ?? "—"}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator className="bg-slate-700/70" />

                    {/* formulário bonito de proposta */}
                    <NewProposalForm leadId={leadId} leadName={lead.nome ?? ""} />
                </div>
            </div>
        </div>
    );
}
