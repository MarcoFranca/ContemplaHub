// src/app/app/leads/[leadId]/LeadDiagnosticCard.tsx
import { Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DiagnosticSheet } from "@/app/app/leads/ui/DiagnosticSheet";
import { formatCurrencyBRL } from "./leadUtils";

type DiagnosticoRow = {
    objetivo_principal?: string | null;
    perfil_psico?: string | null;
    prazo_alvo_meses?: number | null;
    parcela_conforto?: number | null;
    comentario_consultor?: string | null;
};

export function LeadDiagnosticCard({
                                       leadId,
                                       leadName,
                                       diagnostico,
                                   }: {
    leadId: string;
    leadName: string | null;
    diagnostico: DiagnosticoRow | null;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                        Diagnóstico do lead
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Visão geral da situação do cliente, perfil e capacidade de
                        estratégia.
                    </p>
                </div>

                <DiagnosticSheet leadId={leadId} leadName={leadName} />
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
                {diagnostico ? (
                    <>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    Objetivo principal
                                </span>
                                <p className="font-medium">
                                    {diagnostico.objetivo_principal ?? "—"}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    Perfil
                                </span>
                                <p className="font-medium">
                                    {diagnostico.perfil_psico ?? "—"}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    Prazo alvo
                                </span>
                                <p className="font-medium">
                                    {diagnostico.prazo_alvo_meses
                                        ? `${diagnostico.prazo_alvo_meses} meses`
                                        : "—"}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    Parcela confortável
                                </span>
                                <p className="font-medium">
                                    {formatCurrencyBRL(diagnostico.parcela_conforto ?? null)}
                                </p>
                            </div>
                        </div>

                        {diagnostico.comentario_consultor && (
                            <div className="pt-2 border-t border-border/60">
                                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    Observações / leitura consultiva
                                </span>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {diagnostico.comentario_consultor}
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-xs text-muted-foreground">
                        Nenhum diagnóstico preenchido ainda para este lead.{" "}
                        <span className="text-emerald-400">
                            Clique no botão acima para criar ou editar o diagnóstico.
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
