"use client";

import * as React from "react";
import Link from "next/link";
import { Fragment } from "react";
import { Printer, ArrowLeft, Pencil, RotateCcw } from "lucide-react";

export type LinhaDoc = {
    id: string;
    cliente: string;
    grupo: string;
    cota: string;
    competencia: string; // YYYY-MM
    competenciaLabel: string;
    parcela: string;
    valor: number;
    pagoEmLabel?: string | null;
};

type Props = {
    parceiroNome: string;
    cpfCnpj?: string | null;
    orgNome: string;
    emitidoEm: string;
    mesLabel: string;
    voltarHref: string;
    docTitleBase: string; // ex.: "Repasses - Fulano - 2026-10_201530"
    aPagar: LinhaDoc[];
    pagos: LinhaDoc[];
};

const money = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

// "1234.5" | "1.234,50" | "R$ 1.234,50" -> 1234.5
function parseReais(s: string): number {
    const raw = (s || "").replace(/[^\d.,-]/g, "");
    if (!raw) return 0;
    const normalized = raw.replace(/\./g, "").replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
}

type Modo = "apagar" | "pagos";

export function RepasseDocument({
    parceiroNome,
    cpfCnpj,
    orgNome,
    emitidoEm,
    mesLabel,
    voltarHref,
    docTitleBase,
    aPagar,
    pagos,
}: Props) {
    const [modo, setModo] = React.useState<Modo>("apagar");
    const [editando, setEditando] = React.useState(false);
    // Overrides de valor por id de linha (quando o parceiro/gestor ajusta à mão).
    const [overrides, setOverrides] = React.useState<Record<string, number>>({});

    const linhasBase = modo === "apagar" ? aPagar : pagos;
    const valorDe = (l: LinhaDoc) => (l.id in overrides ? overrides[l.id] : l.valor);

    // Título do documento (nome do arquivo no "Salvar como PDF").
    React.useEffect(() => {
        const sufixo = modo === "apagar" ? "a-pagar" : "pagos";
        const anterior = document.title;
        document.title = `${docTitleBase} - ${sufixo}`;
        return () => {
            document.title = anterior;
        };
    }, [docTitleBase, modo]);

    // Agrupa por cliente, preservando ordem por competência.
    const porCliente = React.useMemo(() => {
        const mapa = new Map<string, LinhaDoc[]>();
        const ordenadas = [...linhasBase].sort((a, b) => a.competencia.localeCompare(b.competencia));
        for (const l of ordenadas) {
            const arr = mapa.get(l.cliente) ?? [];
            arr.push(l);
            mapa.set(l.cliente, arr);
        }
        return Array.from(mapa.entries()).sort(
            (a, b) =>
                b[1].reduce((s, l) => s + valorDe(l), 0) - a[1].reduce((s, l) => s + valorDe(l), 0),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [linhasBase, overrides]);

    const total = linhasBase.reduce((s, l) => s + valorDe(l), 0);
    const foiEditado = Object.keys(overrides).length > 0;

    const isPagos = modo === "pagos";
    const tituloSecao = isPagos ? "Repasses pagos" : "A pagar neste mês";
    const corResumo = isPagos ? "neutral" : "emerald";

    return (
        <div className="mx-auto max-w-[800px]">
            {/* Controles (não imprime) */}
            <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
                <Link href={voltarHref} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </Link>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Alternância de modo */}
                    <div className="inline-flex overflow-hidden rounded-lg border border-neutral-300">
                        <button
                            type="button"
                            onClick={() => setModo("apagar")}
                            className={`px-3 py-1.5 text-sm font-medium ${modo === "apagar" ? "bg-emerald-600 text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
                        >
                            A pagar
                        </button>
                        <button
                            type="button"
                            onClick={() => setModo("pagos")}
                            className={`px-3 py-1.5 text-sm font-medium ${modo === "pagos" ? "bg-neutral-800 text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"}`}
                        >
                            Pagos
                        </button>
                    </div>

                    {/* Editar valores */}
                    <button
                        type="button"
                        onClick={() => setEditando((v) => !v)}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${editando ? "border-amber-400 bg-amber-50 text-amber-700" : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"}`}
                    >
                        <Pencil className="h-4 w-4" />
                        {editando ? "Concluir edição" : "Editar valores"}
                    </button>

                    {foiEditado && (
                        <button
                            type="button"
                            onClick={() => setOverrides({})}
                            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                            title="Voltar aos valores do sistema"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Restaurar
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                    >
                        <Printer className="h-4 w-4" />
                        Salvar PDF / Imprimir
                    </button>
                </div>
            </div>

            {editando && (
                <div className="no-print mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
                    Ajuste os valores diretamente na coluna Valor. Útil para alinhar com o repasse da Porto quando há diferença de centavos. Isso muda apenas este documento, não altera os dados do sistema.
                </div>
            )}

            <div id="repasse-print" className="mx-auto max-w-[800px] rounded-lg bg-white p-8 shadow-sm">
                {/* Cabeçalho */}
                <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900">Demonstrativo de Repasses</h1>
                        <p className="mt-0.5 text-sm text-neutral-500">{orgNome}</p>
                    </div>
                    <div className="text-right text-xs text-neutral-500">
                        <div>Emitido em {emitidoEm}</div>
                        <div>Competência: {mesLabel}</div>
                        <div className="mt-0.5 font-semibold text-neutral-600">
                            {isPagos ? "Repasses pagos" : "A pagar neste mês"}
                        </div>
                    </div>
                </div>

                {/* Parceiro */}
                <div className="mt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Parceiro</div>
                    <div className="text-lg font-semibold text-neutral-900">{parceiroNome}</div>
                    {cpfCnpj ? <div className="text-sm text-neutral-500">{cpfCnpj}</div> : null}
                </div>

                {/* Resumo */}
                <div className="mt-5">
                    <div className={`rounded-lg border p-4 ${corResumo === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-neutral-200 bg-neutral-50"}`}>
                        <div className={`text-[11px] font-semibold uppercase tracking-wider ${corResumo === "emerald" ? "text-emerald-700" : "text-neutral-600"}`}>
                            {isPagos ? "Total pago" : "A pagar neste mês"}
                        </div>
                        <div className={`mt-1 text-2xl font-bold ${corResumo === "emerald" ? "text-emerald-700" : "text-neutral-800"}`}>
                            {money(total)}
                        </div>
                        <div className={`text-xs ${corResumo === "emerald" ? "text-emerald-700/70" : "text-neutral-500"}`}>
                            {linhasBase.length} repasse(s){foiEditado ? " · valores ajustados manualmente" : ""}
                        </div>
                    </div>
                </div>

                {/* Tabela */}
                <div className="mt-6">
                    <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-700">{tituloSecao}</h2>
                    {porCliente.length === 0 ? (
                        <p className="text-sm text-neutral-400">
                            {isPagos ? "Nenhum repasse pago ainda." : "Nenhum repasse a pagar até este mês."}
                        </p>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-neutral-300 text-left text-[11px] uppercase tracking-wider text-neutral-400">
                                    <th className="py-1.5 pr-2">Cliente</th>
                                    <th className="py-1.5 px-2">Grupo / Cota</th>
                                    <th className="py-1.5 px-2">Competência</th>
                                    {isPagos && <th className="py-1.5 px-2">Pago em</th>}
                                    <th className="py-1.5 px-2 text-center">Parcela</th>
                                    <th className="py-1.5 pl-2 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {porCliente.map(([cliente, linhas]) => {
                                    const sub = linhas.reduce((s, l) => s + valorDe(l), 0);
                                    const colBeforeValor = isPagos ? 5 : 4;
                                    return (
                                        <Fragment key={cliente}>
                                            {linhas.map((l, i) => (
                                                <tr key={l.id} className="border-b border-neutral-100">
                                                    <td className="py-1.5 pr-2 font-medium text-neutral-800">{i === 0 ? cliente : ""}</td>
                                                    <td className="py-1.5 px-2 text-neutral-600">{l.grupo} · {l.cota}</td>
                                                    <td className="py-1.5 px-2 text-neutral-600">{l.competenciaLabel}</td>
                                                    {isPagos && <td className="py-1.5 px-2 text-neutral-600">{l.pagoEmLabel ?? "—"}</td>}
                                                    <td className="py-1.5 px-2 text-center tabular-nums text-neutral-700">{l.parcela}</td>
                                                    <td className="py-1.5 pl-2 text-right tabular-nums text-neutral-900">
                                                        <ValorCell
                                                            editavel={editando}
                                                            valor={valorDe(l)}
                                                            editado={l.id in overrides}
                                                            onChange={(n) =>
                                                                setOverrides((prev) => ({ ...prev, [l.id]: n }))
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                            {linhas.length > 1 ? (
                                                <tr className="border-b border-neutral-200 text-xs">
                                                    <td className="py-1 pr-2 text-neutral-400" colSpan={colBeforeValor}>Subtotal {cliente}</td>
                                                    <td className="py-1 pl-2 text-right font-semibold tabular-nums text-neutral-700">{money(sub)}</td>
                                                </tr>
                                            ) : null}
                                        </Fragment>
                                    );
                                })}
                                <tr className="border-t-2 border-neutral-800">
                                    <td className="py-2 pr-2 font-bold text-neutral-900" colSpan={isPagos ? 5 : 4}>
                                        {isPagos ? "Total pago" : "Total a pagar"}
                                    </td>
                                    <td className={`py-2 pl-2 text-right text-base font-bold tabular-nums ${isPagos ? "text-neutral-900" : "text-emerald-700"}`}>
                                        {money(total)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>

                <p className="mt-8 border-t border-neutral-200 pt-3 text-[11px] text-neutral-400">
                    Documento gerado automaticamente pelo ContemplaHub.
                    {isPagos
                        ? " Relação de repasses já efetivados ao parceiro."
                        : " Valores de repasse sujeitos à confirmação do pagamento do cliente."}
                </p>
            </div>
        </div>
    );
}

function ValorCell({
    editavel,
    valor,
    editado,
    onChange,
}: {
    editavel: boolean;
    valor: number;
    editado: boolean;
    onChange: (n: number) => void;
}) {
    const [texto, setTexto] = React.useState<string>(valor.toFixed(2).replace(".", ","));

    React.useEffect(() => {
        setTexto(valor.toFixed(2).replace(".", ","));
    }, [valor]);

    if (!editavel) {
        return (
            <span className={editado ? "font-semibold text-amber-700" : undefined}>
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor || 0)}
            </span>
        );
    }

    return (
        <input
            value={texto}
            inputMode="decimal"
            onChange={(e) => setTexto(e.target.value)}
            onBlur={() => onChange(parseReais(texto))}
            className="w-28 rounded border border-amber-300 bg-amber-50/60 px-2 py-0.5 text-right tabular-nums text-neutral-900 focus:border-amber-500 focus:outline-none"
        />
    );
}
