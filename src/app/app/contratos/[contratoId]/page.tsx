import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileDown } from "lucide-react";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// ------------------------------------------
// LOAD DO CONTRATO
// ------------------------------------------
async function loadContrato(contratoId: string, orgId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
        .from("contratos")
        .select("*, cotas(*)")
        .eq("org_id", orgId)
        .eq("id", contratoId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export default async function ContratoDetailsPage({
                                                      params,
                                                  }: {
    params: Promise<{ contratoId: string }>;
}) {
    const { contratoId } = await params;

    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error("Org inválida");

    const contrato = await loadContrato(contratoId, profile.orgId);

    if (!contrato) notFound();

    const cota = contrato.cotas;

    return (
        <div className="h-full overflow-auto px-4 py-6 max-w-4xl mx-auto space-y-6">
            {/* VOLTAR */}
            <div className="flex items-center gap-2">
                <Link
                    href={`/app/leads/${cota.lead_id}`}
                    className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Voltar para lead
                </Link>
            </div>

            {/* HEADER */}
            <Card className="bg-slate-900/70 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-lg">
                        Contrato da Cota {cota.grupo_codigo}-{cota.numero_cota}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p>
                        <strong>Status:</strong> {contrato.status ?? "—"}
                    </p>

                    <p>
                        <strong>Assinado em:</strong>{" "}
                        {contrato.data_assinatura
                            ? new Date(contrato.data_assinatura).toLocaleDateString("pt-BR")
                            : "—"}
                    </p>

                    <p>
                        <strong>Cota ID:</strong> {cota.id}
                    </p>

                    {contrato.pdf_path && (
                        <Link
                            href={contrato.pdf_path}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                        >
                            <FileDown className="h-4 w-4" />
                            Baixar contrato (PDF)
                        </Link>
                    )}
                </CardContent>
            </Card>

            {/* DADOS DA COTA */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Informações da Cota</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                        <p>
                            <strong>Produto:</strong> {cota.produto}
                        </p>
                        <p>
                            <strong>Valor da carta:</strong>{" "}
                            R$
                            {Number(cota.valor_carta).toLocaleString("pt-BR")}
                        </p>
                        <p>
                            <strong>Prazo:</strong> {cota.prazo} meses
                        </p>
                        <p>
                            <strong>Situação:</strong> {cota.situacao}
                        </p>
                        <p>
                            <strong>Grupo:</strong> {cota.grupo_codigo}
                        </p>
                        <p>
                            <strong>Nº Cota:</strong> {cota.numero_cota}
                        </p>
                    </div>

                    {cota.data_adesao && (
                        <p>
                            <strong>Adesão:</strong>{" "}
                            {new Date(cota.data_adesao).toLocaleDateString("pt-BR")}
                        </p>
                    )}

                    <Separator />

                    <p className="text-xs text-muted-foreground">
                        Mais informações detalhadas serão adicionadas em breve (andamento da cota,
                        lances enviados, assembleias, histórico, anexos, observações…)
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
