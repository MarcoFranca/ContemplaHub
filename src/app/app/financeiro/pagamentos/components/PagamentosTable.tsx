import Link from "next/link";

import type { PagamentoItem } from "../types";

type PagamentosTableProps = {
    pagamentos: PagamentoItem[];
    selectedContratoId: string;
};

function formatMoney(value: string) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(Number(value));
}

function formatDate(value?: string | null) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

export function PagamentosTable({ pagamentos, selectedContratoId }: PagamentosTableProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50">
            <div className="border-b border-white/10 px-5 py-4">
                <h2 className="text-base font-semibold text-white">Ultimos pagamentos do contrato</h2>
                <p className="text-sm text-slate-400">
                    Historico operacional para revisar competencia, vencimento, status e reabrir edicoes.
                </p>
            </div>

            {pagamentos.length === 0 ? (
                <div className="px-5 py-10 text-sm text-slate-400">Nenhum pagamento cadastrado para este contrato.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10 text-sm">
                        <thead className="bg-white/[0.02] text-left text-slate-400">
                            <tr>
                                <th className="px-5 py-3 font-medium">Competencia</th>
                                <th className="px-5 py-3 font-medium">Valor</th>
                                <th className="px-5 py-3 font-medium">Vencimento</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Pago em</th>
                                <th className="px-5 py-3 font-medium">Contrato / Cota</th>
                                <th className="px-5 py-3 font-medium text-right">Acoes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-200">
                            {pagamentos.map((pagamento) => (
                                <tr key={pagamento.id}>
                                    <td className="px-5 py-4">{formatDate(pagamento.competencia)}</td>
                                    <td className="px-5 py-4 font-medium text-white">{formatMoney(pagamento.valor)}</td>
                                    <td className="px-5 py-4">{formatDate(pagamento.vencimento)}</td>
                                    <td className="px-5 py-4">
                                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs uppercase tracking-wide text-slate-300">
                                            {pagamento.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">{formatDate(pagamento.pago_em)}</td>
                                    <td className="px-5 py-4">
                                        <div className="grid gap-1">
                                            <span className="text-white">
                                                {pagamento.contrato_numero || "Sem numero"} / Cota {pagamento.numero_cota || "-"}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {pagamento.cliente_nome || "Cliente sem nome"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <Link
                                            href={`/app/financeiro/pagamentos?contrato_id=${selectedContratoId}&edit_pagamento_id=${pagamento.id}`}
                                            className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
                                        >
                                            Editar
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
