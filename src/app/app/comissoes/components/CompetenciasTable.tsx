"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CotaPagamentoCompetencia } from "../types";

export function CompetenciasTable({
                                      items,
                                      title = "Competências mensais",
                                  }: {
    items: CotaPagamentoCompetencia[];
    title?: string;
}) {
    return (
        <Card className="bg-white/5 border-white/10">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Competência</TableHead>
                            <TableHead>Boleto</TableHead>
                            <TableHead>Pagamento</TableHead>
                            <TableHead>Assembleia</TableHead>
                            <TableHead>Comissão</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="font-medium">{formatCompetencia(item.competencia)}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Venc.: {formatDate(item.vencimento)}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div>{item.tem_boleto ? "Sim" : "Não"}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {item.tem_boleto ? formatMoney(item.boleto_valor) : "Sem boleto"}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div>{item.pago ? "Pago" : "Não pago"}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {item.pago_em ? formatDateTime(item.pago_em) : "—"}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div>{labelBool(item.participou_assembleia)}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {item.motivo_nao_participacao || "—"}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div>{item.gera_comissao ? "Gera" : "Não gera"}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {item.valor_pago ? `Pago ${formatMoney(item.valor_pago)}` : "—"}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <span className="text-sm">{labelStatus(item.status)}</span>
                                </TableCell>
                            </TableRow>
                        ))}

                        {!items.length ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                                    Nenhuma competência encontrada.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function formatMoney(value: number | string | null | undefined) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("pt-BR");
}

function formatDateTime(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleString("pt-BR");
}

function formatCompetencia(value: string) {
    const d = new Date(value);
    return d.toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" });
}

function labelBool(value?: boolean | null) {
    if (value === true) return "Participou";
    if (value === false) return "Não participou";
    return "—";
}

function labelStatus(value: string) {
    const map: Record<string, string> = {
        prevista: "Prevista",
        sem_boleto: "Sem boleto",
        aguardando_pagamento: "Aguardando pagamento",
        paga_sem_assembleia: "Paga sem assembleia",
        elegivel_comissao: "Elegível p/ comissão",
        cancelada: "Cancelada",
    };
    return map[value] ?? value;
}