// src/app/app/leads/[leadId]/propostas/nova/page.tsx
import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NovaPropostaForm } from "./NovaPropostaForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadLead(leadId: string, orgId: string) {
    const supabase = await supabaseServer();

    console.log("DEBUG loadLead params", { leadId, orgId });

    const { data, error } = await supabase
        .from("leads")
        .select("id, nome, telefone, email, origem, valor_interesse, prazo_meses")
        .eq("org_id", orgId)
        .eq("id", leadId)
        .maybeSingle();

    if (error) {
        console.error("ERROR loadLead:", error);
        throw error;
    }
    if (!data) return null;
    return data;
}

export default async function NovaPropostaPage({
                                                   params,
                                               }: {
    params: Promise<{ leadId: string }>;
}) {
    const { leadId } = await params;

    const profile = await getCurrentProfile();
    if (!profile?.orgId) {
        throw new Error("Org inválida");
    }

    const lead = await loadLead(leadId, String(profile.orgId));
    if (!lead) {
        notFound();
    }

    const nome = lead.nome ?? "Cliente";
    const origem = lead.origem ?? "—";

    return (
        // 🔥 ocupa 100% da altura do main do AppShell
        <div className="h-full">
            {/* container interno vira uma coluna flexível */}
            <div className="max-w-5xl mx-auto h-full flex flex-col px-4 py-6 md:py-8">
                {/* HEADER FIXO DENTRO DA PÁGINA */}
                <header className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/app/leads/${leadId}`}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Voltar para o lead
                        </Link>
                        <div className="h-5 w-px bg-border" />
                        <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-400">
                Nova proposta
              </span>
                            <span className="text-sm md:text-base font-semibold">
                {nome}
              </span>
                        </div>
                    </div>

                    <Badge variant="outline" className="text-[11px]">
                        Origem: {origem}
                    </Badge>
                </header>

                {/* 🔥 área que realmente rola: flex-1 + overflow-y-auto */}
                <main className="mt-4 flex-1 overflow-y-auto">
                    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] items-start pb-8">
                        {/* CARD ESQUERDA - FORM */}
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-sm md:text-base">
                                    Configurar proposta
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Suspense fallback={<div>Carregando formulário...</div>}>
                                    <NovaPropostaForm
                                        leadId={leadId}
                                        defaultNomeCliente={nome}
                                        defaultValorInteresse={lead.valor_interesse}
                                        defaultPrazoMeses={lead.prazo_meses}
                                    />
                                </Suspense>
                            </CardContent>
                        </Card>

                        {/* CARD DIREITA - ORIENTAÇÕES */}
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-sm md:text-base">
                                    Orientações rápidas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <p>
                                    Use esta tela para transformar o interesse do cliente em uma
                                    proposta consultiva, com 1 ou mais cenários de carta.
                                </p>
                                <ul className="list-disc ml-5 space-y-1">
                                    <li>Comece com o cenário “raiz” (ex.: 1x carta 500k com redutor).</li>
                                    <li>Adicione cenários alternativos (2 cartas, sem redutor, prazo menor…).</li>
                                    <li>
                                        Preencha o comentário do consultor com a lógica por trás da estratégia.
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
