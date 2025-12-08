"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateContractStatus, type ContractStatus } from "@/app/app/leads/actions";

type CotaRow = {
    id: string;
    administradora_id: string | null;
    valor_carta: number | string | null;
    produto: string | null;
    data_adesao: string | null;
    numero_cota: string | null;
    grupo_codigo: string | null;
    prazo: number | null;
    forma_pagamento: string | null;
};

type ContratoRow = {
    id: string;
    org_id: string;
    cota_id: string | null;
    numero: string | null;
    data_assinatura: string | null;
    status: ContractStatus | string | null;
};

export function LeadCotasCard({
                                  cotas,
                                  contratos,
                              }: {
    cotas: CotaRow[];
    contratos: ContratoRow[];
}) {
    // índice contrato por cota
    const contratoByCota = React.useMemo(() => {
        const map = new Map<string, ContratoRow>();
        for (const k of contratos ?? []) {
            if (k.cota_id) map.set(k.cota_id, k);
        }
        return map;
    }, [contratos]);

    if (!cotas || cotas.length === 0) {
        return (
            <Card className="bg-slate-950/70 border-slate-800/80">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold">
                        Cotas & contratos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-slate-400">
                        Nenhuma cota ou contrato cadastrado ainda para este lead.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const statusLabel: Record<ContractStatus, string> = {
        pendente_assinatura: "Pendente assinatura",
        pendente_pagamento: "Pendente pagamento",
        alocado: "Alocado",
        contemplado: "Contemplado",
        cancelado: "Cancelado",
    };

    const statusClass: Record<ContractStatus, string> = {
        pendente_assinatura: "bg-amber-900/40 text-amber-200 border-amber-700",
        pendente_pagamento: "bg-yellow-900/40 text-yellow-200 border-yellow-700",
        alocado: "bg-emerald-900/40 text-emerald-200 border-emerald-700",
        contemplado: "bg-indigo-900/40 text-indigo-200 border-indigo-700",
        cancelado: "bg-red-900/40 text-red-200 border-red-700",
    };

    async function handleChangeStatus(
        contratoId: string,
        currentStatus: ContractStatus,
        newStatus: ContractStatus
    ) {
        if (currentStatus === newStatus) return; // 👈 evita cancelado→cancelado, etc.

        try {
            await updateContractStatus(contratoId, newStatus);
            toast.success("Status do contrato atualizado.");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao atualizar status do contrato.");
        }
    }


    return (
        <Card className="bg-slate-950/70 border-slate-800/80">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                    Cotas & contratos
                </CardTitle>
                <p className="text-[11px] text-slate-400 max-w-md">
                    Acompanhe as cotas vinculadas a este lead e atualize o status do
                    contrato conforme assinatura, pagamento e alocação.
                </p>
            </CardHeader>

            <CardContent className="space-y-3">
                {cotas.map((cota) => {
                    const contrato = cota.id ? contratoByCota.get(cota.id) : undefined;
                    const currentStatus =
                        (contrato?.status as ContractStatus | null) ?? "pendente_assinatura";

                    const valorCarta =
                        typeof cota.valor_carta === "number"
                            ? cota.valor_carta
                            : cota.valor_carta
                                ? Number(String(cota.valor_carta).replace(",", "."))
                                : null;

                    return (
                        <div
                            key={cota.id}
                            className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-3"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-semibold text-slate-100">
                                        Cota {cota.numero_cota ?? "—"}{" "}
                                        <span className="text-[11px] text-slate-400">
                      • Grupo {cota.grupo_codigo ?? "—"}
                    </span>
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        Produto:{" "}
                                        <span className="text-slate-200">
                      {cota.produto ?? "—"}
                    </span>{" "}
                                        {valorCarta && (
                                            <>
                                                • Carta:{" "}
                                                <span className="text-emerald-300">
                          {valorCarta.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                          })}
                        </span>
                                            </>
                                        )}
                                    </p>
                                    {cota.prazo && (
                                        <p className="text-[11px] text-slate-400">
                                            Prazo:{" "}
                                            <span className="text-slate-200">{cota.prazo} meses</span>
                                            {cota.forma_pagamento && (
                                                <>
                                                    {" "}
                                                    • Pagamento:{" "}
                                                    <span className="text-slate-200">
                            {cota.forma_pagamento}
                          </span>
                                                </>
                                            )}
                                        </p>
                                    )}
                                </div>

                                {contrato && (
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] px-2 py-0.5 border ${statusClass[currentStatus]}`}
                                    >
                                        {statusLabel[currentStatus]}
                                    </Badge>
                                )}
                            </div>

                            {contrato ? (
                                <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-3 items-end">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px]">
                                            Status do contrato
                                        </Label>
                                        <Select
                                            defaultValue={currentStatus}
                                            onValueChange={(v) =>
                                                handleChangeStatus(contrato.id, currentStatus, v as ContractStatus)
                                            }
                                        >
                                        <SelectTrigger className="h-8 text-xs bg-slate-950/60 border-slate-700">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pendente_assinatura">
                                                    Pendente assinatura
                                                </SelectItem>
                                                <SelectItem value="pendente_pagamento">
                                                    Pendente pagamento
                                                </SelectItem>
                                                <SelectItem value="alocado">Alocado</SelectItem>
                                                <SelectItem value="cancelado">Cancelado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[10px] text-slate-500">
                                            • Alocado ⇒ lead vai para <span className="font-semibold">Ativo</span> <br />
                                            • Cancelado ⇒ lead vai para{" "}
                                            <span className="font-semibold">Perdido</span>
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[11px]">Contrato</Label>
                                        <div className="text-[11px] text-slate-300 space-y-0.5">
                                            <p>
                                                Nº:{" "}
                                                <span className="font-medium">
                          {contrato.numero ?? "—"}
                        </span>
                                            </p>
                                            <p className="text-slate-400">
                                                Assinatura:{" "}
                                                <span className="text-slate-200">
                          {contrato.data_assinatura
                              ? new Date(
                                  contrato.data_assinatura
                              ).toLocaleDateString("pt-BR")
                              : "—"}
                        </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[11px] text-slate-500">
                                    Nenhum contrato vinculado a esta cota ainda. Gere o contrato
                                    arrastando o lead para a coluna <strong>Contrato</strong> no
                                    Kanban.
                                </p>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
