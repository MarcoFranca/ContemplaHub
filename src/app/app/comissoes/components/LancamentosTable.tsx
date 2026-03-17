"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ComissaoLancamento } from "../types";
import { ComissaoStatusBadge, RepasseStatusBadge } from "./status-badges";
import { LancamentoStatusDialog } from "./LancamentoStatusDialog";
import { RepasseDialog } from "./RepasseDialog";

type Props = {
  items: ComissaoLancamento[];
  refreshPath: string;
  title?: string;
};

export function LancamentosTable({ items, refreshPath, title = "Lançamentos" }: Props) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beneficiário</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Competência</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Repasse</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">
                    {item.beneficiario_tipo === "empresa" ? "Empresa" : item.parceiros_corretores?.nome || "Parceiro"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.beneficiario_tipo === "empresa" ? `Contrato ${item.contrato_id.slice(0, 8)}` : `Líquido ${formatMoney(item.valor_liquido)}`}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="capitalize">{labelEvento(item.tipo_evento)}</div>
                  <div className="text-xs text-muted-foreground">Parcela {item.ordem}</div>
                </TableCell>
                <TableCell>
                  <div>{formatDate(item.competencia_prevista)}</div>
                  <div className="text-xs text-muted-foreground">Real: {formatDate(item.competencia_real)}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{formatMoney(item.valor_bruto)}</div>
                  {item.beneficiario_tipo === "parceiro" ? (
                    <div className="text-xs text-muted-foreground">Imp. {formatMoney(item.valor_imposto)}</div>
                  ) : null}
                </TableCell>
                <TableCell><ComissaoStatusBadge status={item.status} /></TableCell>
                <TableCell><RepasseStatusBadge status={item.repasse_status} /></TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/app/contratos/${item.contrato_id}`} className="inline-flex">
                      <button className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm hover:bg-white/5">
                        <ExternalLink className="mr-2 h-4 w-4" />Contrato
                      </button>
                    </Link>
                    <LancamentoStatusDialog lancamento={item} refreshPath={refreshPath} />
                    <RepasseDialog lancamento={item} refreshPath={refreshPath} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!items.length ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Nenhum lançamento encontrado para os filtros aplicados.
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

function labelEvento(value: string) {
  const map: Record<string, string> = {
    adesao: "Adesão",
    primeira_cobranca_valida: "1ª cobrança válida",
    proxima_cobranca: "Próxima cobrança",
    contemplacao: "Contemplação",
    manual: "Manual",
  };
  return map[value] ?? value;
}
