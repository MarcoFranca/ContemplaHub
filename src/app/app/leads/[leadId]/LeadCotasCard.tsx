"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

export function LeadCotasCard({
                                  cotas,
                                  contratos,
                              }: {
    cotas: any[];
    contratos: any[];
}) {
    return (
        <Card className="bg-slate-900/60 border border-slate-800">
            <CardHeader>
                <CardTitle className="text-base font-semibold">
                    Cartas adquiridas (Cotas)
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {cotas.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                        Nenhuma carta contratada por este cliente.
                    </p>
                )}

                {cotas.map((cota) => {
                    const contrato = contratos.find(
                        (ct) => ct.cota_id === cota.id
                    );

                    return (
                        <div
                            key={cota.id}
                            className="border border-slate-700 rounded-lg p-4 bg-slate-900/40"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                        {cota.produto === "imobiliario"
                                            ? "Imobiliário"
                                            : "Auto"}{" "}
                                        • R$
                                        {Number(cota.valor_carta).toLocaleString(
                                            "pt-BR"
                                        )}
                                    </span>

                                    <span className="text-xs text-slate-400">
                                        Administradora: {cota.administradora_id}
                                    </span>
                                </div>

                                <Badge
                                    variant="outline"
                                    className="text-[10px] capitalize"
                                >
                                    {cota.situacao}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                                <p>
                                    <strong className="text-slate-300">
                                        Grupo:
                                    </strong>{" "}
                                    {cota.grupo_codigo ?? "—"}
                                </p>

                                <p>
                                    <strong className="text-slate-300">
                                        Cota:
                                    </strong>{" "}
                                    {cota.numero_cota ?? "—"}
                                </p>

                                <p>
                                    <strong className="text-slate-300">
                                        Prazo:
                                    </strong>{" "}
                                    {cota.prazo} meses
                                </p>

                                <p>
                                    <strong className="text-slate-300">
                                        Forma pgto:
                                    </strong>{" "}
                                    {cota.forma_pagamento ?? "—"}
                                </p>

                                {cota.data_adesao && (
                                    <p className="col-span-2">
                                        <strong className="text-slate-300">
                                            Adesão:
                                        </strong>{" "}
                                        {new Date(
                                            cota.data_adesao
                                        ).toLocaleDateString("pt-BR")}
                                    </p>
                                )}
                            </div>

                            {/* CONTRATO */}
                            <div className="mt-3 pt-3 border-t border-slate-700">
                                {contrato ? (
                                    <Link
                                        href={`/app/contratos/${contrato.id}`}
                                        className="text-xs inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200"
                                    >
                                        <FileCheck className="h-3.5 w-3.5" />
                                        Ver contrato assinado
                                    </Link>
                                ) : (
                                    <span className="text-xs inline-flex items-center gap-1 text-amber-300">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        Nenhum contrato anexado
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
