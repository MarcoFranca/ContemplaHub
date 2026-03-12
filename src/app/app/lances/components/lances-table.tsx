import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { LanceActions } from "./lance-actions";
import type { LanceCartaListItem } from "../types";

type Props = {
    items: LanceCartaListItem[];
    competencia: string;
};

function money(v?: number | null) {
    if (v == null) return "—";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(v);
}

function fmtDate(v?: string | null) {
    if (!v) return "—";
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: "UTC",
    }).format(new Date(`${v}T00:00:00`));
}

function statusVariant(status: string) {
    switch (status) {
        case "ativa":
        case "feito":
        case "planejado":
            return "default";
        case "contemplada":
            return "secondary";
        case "cancelada":
        case "sem_lance":
            return "outline";
        default:
            return "outline";
    }
}

export function LancesTable({ items, competencia }: Props) {
    if (!items.length) {
        return (
            <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                Nenhuma carta encontrada com os filtros atuais.
            </div>
        );
    }

    return (
        <div className="rounded-xl border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Operadora</TableHead>
                        <TableHead>Grupo / Cota</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Valor carta</TableHead>
                        <TableHead>Assembleia</TableHead>
                        <TableHead>Status carta</TableHead>
                        <TableHead>Status mês</TableHead>
                        <TableHead className="w-[280px]">Ações</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.cota_id}>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="font-medium">{item.cliente_nome || "Sem nome"}</div>
                                    <Link
                                        href={`/app/lances/${item.cota_id}?competencia=${competencia}`}
                                        className="text-xs text-emerald-400 hover:underline"
                                    >
                                        Ver detalhe da carta
                                    </Link>
                                </div>
                            </TableCell>

                            <TableCell>{item.administradora_nome || "—"}</TableCell>

                            <TableCell>
                                <div className="space-y-1">
                                    <div>Grupo: <span className="font-medium">{item.grupo_codigo}</span></div>
                                    <div>Cota: <span className="font-medium">{item.numero_cota}</span></div>
                                </div>
                            </TableCell>

                            <TableCell className="capitalize">{item.produto}</TableCell>

                            <TableCell>{money(item.valor_carta)}</TableCell>

                            <TableCell>
                                {item.tem_pendencia_configuracao ? (
                                    <span className="text-amber-500 text-xs">Sem regra configurada</span>
                                ) : (
                                    <div className="space-y-1">
                                        <div>{fmtDate(item.assembleia_prevista)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            origem: {item.assembleia_dia_origem || "—"}
                                        </div>
                                    </div>
                                )}
                            </TableCell>

                            <TableCell>
                                <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                            </TableCell>

                            <TableCell>
                                <Badge variant={statusVariant(item.status_mes)}>{item.status_mes}</Badge>
                            </TableCell>

                            <TableCell>
                                <LanceActions item={item} competencia={competencia} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}