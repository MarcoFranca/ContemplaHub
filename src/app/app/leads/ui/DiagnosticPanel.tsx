// src/app/app/leads/ui/DiagnosticPanel.tsx
"use client";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { diagnosticSchema, type DiagnosticForm } from "@/lib/validators/diagnostic";
import { saveLeadDiagnostic, getLeadDiagnostic } from "../actions.diagnostic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function normalizeFromDb(row: any): DiagnosticForm {
    // DiagnosticForm é INPUT → pode receber number | string | undefined sem conflito
    return {
        objetivo: row.objetivo ?? "",
        prazoMetaMeses: row.prazoMetaMeses ?? undefined,
        preferenciaProduto: row.preferenciaProduto ?? undefined,
        regiaoPreferencia: row.regiaoPreferencia ?? undefined,

        rendaMensal: row.rendaMensal ?? undefined,                 // string/number ok
        reservaInicial: row.reservaInicial ?? undefined,
        comprometimentoMaxPct: row.comprometimentoMaxPct ?? undefined,
        rendaProvada: !!row.rendaProvada,

        valorCartaAlvo: row.valorCartaAlvo ?? undefined,
        prazoAlvoMeses: row.prazoAlvoMeses ?? undefined,
        estrategiaLance: row.estrategiaLance ?? undefined,
        lanceBasePct: row.lanceBasePct ?? undefined,
        lanceMaxPct: row.lanceMaxPct ?? undefined,
        janelaPreferidaSemanas: row.janelaPreferidaSemanas ?? undefined,

        consentScope: row.consentScope ?? undefined,
        consentTs: row.consentTs ?? undefined,                      // pode vir string/Date, schema coerce
        extras: row.extras ?? undefined,
    };
}

export function DiagnosticPanel({ leadId }: { leadId: string }) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<DiagnosticForm>({
        resolver: zodResolver(diagnosticSchema),
        defaultValues: { rendaProvada: false },
    });

    useEffect(() => {
        startTransition(async () => {
            const existing = await getLeadDiagnostic(leadId);
            if (existing) form.reset(normalizeFromDb(existing));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leadId]);

    const onSubmit = form.handleSubmit(async (values) => {
        // values = DiagnosticForm (input). A action faz o parse/coerce.
        const res = await saveLeadDiagnostic(leadId, values);
        if (res.ok) toast.success(res.created ? "Diagnóstico criado" : "Diagnóstico atualizado");
    });

    return (
        <Card className="border-emerald-900/30 bg-slate-900/50">
            <CardHeader><CardTitle>Diagnóstico Consultivo</CardTitle></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <div>
                        <Label>Objetivo</Label>
                        <Input {...form.register("objetivo")} placeholder="morar / renda / troca" />
                    </div>
                    <div>
                        <Label>Preferência de produto</Label>
                        <Select
                            value={form.watch("preferenciaProduto") ?? undefined}
                            onValueChange={(v) => form.setValue("preferenciaProduto", v as any)}
                        >
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="imovel">Imóvel</SelectItem>
                                <SelectItem value="auto">Auto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Prazo alvo (meses)</Label>
                        <Input type="number" {...form.register("prazoAlvoMeses", { valueAsNumber: true })} />
                    </div>
                    <div>
                        <Label>Valor da carta (R$)</Label>
                        <Input type="number" step="0.01" {...form.register("valorCartaAlvo", { valueAsNumber: true })} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label>Renda mensal (R$)</Label>
                        <Input type="number" step="0.01" {...form.register("rendaMensal", { valueAsNumber: true })} />
                    </div>
                    <div>
                        <Label>Comprometimento máx. (%)</Label>
                        <Input type="number" step="0.1" {...form.register("comprometimentoMaxPct", { valueAsNumber: true })} />
                    </div>
                    <div>
                        <Label>Estratégia de lance</Label>
                        <Select
                            value={form.watch("estrategiaLance") ?? undefined}
                            onValueChange={(v) => form.setValue("estrategiaLance", v as any)}
                        >
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="livre">Livre</SelectItem>
                                <SelectItem value="fixo">Fixo</SelectItem>
                                <SelectItem value="embutido">Embutido</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="pt-2">
                        <Button onClick={onSubmit} disabled={isPending}>Salvar diagnóstico</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
