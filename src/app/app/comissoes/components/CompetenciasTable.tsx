"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CotaPagamentoCompetencia } from "../types";
import { CompetenciaPagamentoDialog } from "./CompetenciaPagamentoDialog";
import { CompetenciaStatusBadge } from "./status-badges";

export function CompetenciasTable({
                                      items,
                                      title = "Competências mensais",
                                  }: {
    items: CotaPagamentoCompetencia[];
    title?: string;
}) {
    return (
        <Card className="border-border/35 bg-card/15">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <span className="text-xs text-muted-foreground">
                        {items.length} competência{items.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/25 hover:bg-transparent">
                            <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Competência</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Boleto</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pagamento</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assembleia</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Comissão</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                            <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id} className="border-border/15 transition-colors hover:bg-white/2">
                                <TableCell className="pl-6">
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
                                    <div className={item.pago ? "text-emerald-300" : "text-muted-foreground"}>
                                        {item.pago ? "Pago" : "Não pago"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {item.pago_em ? formatDateTime(item.pago_em) : "—"}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div>{labelBool(item.participou_assembleia)}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {item.motivo_nao_participacao
                                            || (item.participou_assembleia ? "Sorteio" : "—")}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className={item.gera_comissao ? "text-emerald-300" : "text-muted-foreground"}>
                                        {item.gera_comissao ? "Gera" : "Não gera"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {item.valor_pago ? `Pago ${formatMoney(item.valor_pago)}` : "—"}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <CompetenciaStatusBadge status={item.status} />
                                </TableCell>

                                <TableCell className="pr-6 text-right">
                                    <CompetenciaPagamentoDialog item={item} />
                                </TableCell>
                            </TableRow>
                        ))}

                        {!items.length ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-14 text-center text-sm text-muted-foreground">
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
