import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileSignature, Sparkles } from "lucide-react";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { LeadPropostasList } from "./LeadPropostasList"; // vamos criar já já
import { Separator } from "@/components/ui/separator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// -------------------------------
//  LOAD DO LEAD
// -------------------------------
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

// -------------------------------
//  PAGE
// -------------------------------
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

    const lead = await loadLead(leadId, profile.orgId);
    if (!lead) notFound();

    return (
        <div className="h-full overflow-auto">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

                {/* ----------------------- HEADER ----------------------- */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/app/leads"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Voltar
                        </Link>

                        <div className="h-5 w-px bg-border" />

                        <div className="flex flex-col">
                            <span className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-400">
                                Lead
                            </span>
                            <span className="text-lg font-semibold">{lead.nome}</span>
                        </div>
                    </div>

                    <Badge variant="outline" className="text-[11px]">
                        Origem: {lead.origem ?? "—"}
                    </Badge>
                </header>

                <Separator />

                {/* ----------------------- GRID PRINCIPAL ----------------------- */}
                <main className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

                    {/* -------- LEFT: PROPOSTAS -------- */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold">
                                    Propostas
                                </CardTitle>

                                <Link
                                    href={`/app/leads/${leadId}/propostas/nova`}
                                    className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                                >
                                    <FileSignature className="h-3.5 w-3.5" />
                                    Nova proposta
                                </Link>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <LeadPropostasList leadId={leadId} />
                        </CardContent>
                    </Card>

                    {/* -------- RIGHT: INFORMAÇÕES DO LEAD -------- */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">
                                Informações do cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">

                            <div>
                                <strong>Telefone:</strong> {lead.telefone ?? "—"}
                            </div>

                            <div>
                                <strong>Email:</strong> {lead.email ?? "—"}
                            </div>

                            <div>
                                <strong>Valor de interesse:</strong>{" "}
                                {lead.valor_interesse ?? "—"}
                            </div>

                            <div>
                                <strong>Prazo desejado:</strong>{" "}
                                {lead.prazo_meses ? `${lead.prazo_meses} meses` : "—"}
                            </div>

                            <Separator className="my-4" />

                            <CardTitle className="text-xs flex items-center gap-1 text-emerald-400">
                                <Sparkles className="h-3.5 w-3.5" />
                                Estratégia rápida
                            </CardTitle>
                            <p className="text-muted-foreground text-xs">
                                Em breve conectamos essa seção ao painel de estratégias.
                            </p>

                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
