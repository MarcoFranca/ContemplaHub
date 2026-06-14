"use client";

import Link from "next/link";
import { Building2, ExternalLink, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ComissaoLancamento } from "../types";
import { ComissaoStatusBadge, RepasseStatusBadge } from "./status-badges";
import { LancamentoStatusDialog } from "./LancamentoStatusDialog";
import { RepasseDialog } from "./RepasseDialog";
import { LancamentoQuickActions } from "./LancamentoQuickActions";

type Props = {
  items: ComissaoLancamento[];
  refreshPath: string;
  title?: string;
  showContratoLink?: boolean;
};

const EVENTO_LABELS: Record<string, string> = {
  adesao: "Adesão",
  primeira_cobranca_valida: "1ª Cobrança",
  proxima_cobranca: "Próx. Cobrança",
  contemplacao: "Contemplação",
  manual: "Manual",
};

export function LancamentosTable({ items, refreshPath, title = "Lançamentos", showContratoLink = true }: Props) {
  return (
    <Card className="border-border/35 bg-card/15">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <span className="text-xs text-muted-foreground">
            {items.length} registro{items.length !== 1 ? "s" : ""}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/25 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Beneficiário
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Evento
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Competência
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Valor
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Repasse
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                className="border-border/15 transition-colors hover:bg-white/2"
              >
                <TableCell className="pl-6">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                        item.beneficiario_tipo === "empresa"
                          ? "bg-sky-500/10 text-sky-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {item.beneficiario_tipo === "empresa" ? (
                        <Building2 className="h-3.5 w-3.5" />
                      ) : (
                        <User className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium leading-tight">
                        {item.beneficiario_tipo === "empresa"
                          ? "Empresa"
                          : (item.parceiros_corretores?.nome ?? "Parceiro")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        #{item.contrato_id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm">{EVENTO_LABELS[item.tipo_evento] ?? item.tipo_evento}</div>
                  <div className="text-xs text-muted-foreground">Parcela {item.ordem}</div>
                </TableCell>

                <TableCell>
                  <div className="text-sm">
                    {item.competencia_prevista
                      ? new Date(item.competencia_prevista).toLocaleDateString("pt-BR", {
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </div>
                  {item.competencia_real && (
                    <div className="text-xs text-emerald-400">
                      Real:{" "}
                      {new Date(item.competencia_real).toLocaleDateString("pt-BR", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <div className="text-sm font-semibold">{money(item.valor_bruto)}</div>
                  {item.beneficiario_tipo === "parceiro" && Number(item.valor_imposto || 0) > 0 && (
                    <div className="text-xs text-muted-foreground">
                      liq. {money(item.valor_liquido)}
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <ComissaoStatusBadge status={item.status} />
                </TableCell>

                <TableCell>
                  <RepasseStatusBadge status={item.repasse_status} />
                </TableCell>

                <TableCell className="pr-6">
                  <div className="flex items-center justify-end gap-1.5">
                    {showContratoLink && (
                      <Link href={`/app/contratos/${item.contrato_id}`}>
                        <button className="inline-flex h-7 items-center justify-center gap-1 rounded-lg border border-border/40 px-2 text-xs transition-colors hover:bg-white/5">
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </Link>
                    )}
                    {item.beneficiario_tipo === "empresa" && <LancamentoQuickActions item={item} />}
                    <LancamentoStatusDialog lancamento={item} refreshPath={refreshPath} />
                    <RepasseDialog lancamento={item} refreshPath={refreshPath} />
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-14 text-center text-sm text-muted-foreground">
                  Nenhum lançamento encontrado para os filtros aplicados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function money(v: number | string | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(v || 0)
  );
}
