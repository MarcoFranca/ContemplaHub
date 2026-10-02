export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { Fragment } from "react";
import { notFound } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getParceiroExtratoAction } from "../../../actions";
import type { ComissaoLancamento } from "@/app/app/comissoes/types";
import { PrintControls } from "./PrintControls";

type PageProps = { params: Promise<{ parceiroId: string }> };

const money = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const mesVigente = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const monthKey = (iso?: string | null) => (iso || "").slice(0, 7);
const monthLabel = (key: string) => {
    if (!key) return "—";
    const [y, m] = key.split("-");
    const s = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(Number(y), Number(m) - 1, 1));
    return s.charAt(0).toUpperCase() + s.slice(1);
};
const isAtraso = (it: ComissaoLancamento) => (it.observacoes || "").includes("INADIMPLENTE");

type Linha = { cliente: string; cota: string; grupo: string; competencia: string; valor: number; parcela: string };

export default async function RepassePrintPage({ params }: PageProps) {
    const { parceiroId } = await params;
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    const extrato = await getParceiroExtratoAction(parceiroId).catch(() => null);
    if (!extrato?.parceiro) notFound();

    const parceiro = extrato.parceiro;
    const items: ComissaoLancamento[] = extrato.items ?? [];
    const mes = mesVigente();

    const { data: org } = await supabaseAdmin.from("orgs").select("nome").eq("id", me.orgId).maybeSingle();

    // Parcela X de Y por cota (não conta puladas: parcelas puladas não têm lançamento).
    // Para cada cota, ordena as parcelas de repasse por competência e numera 1..N.
    const naoCanceladas = items.filter((it) => it.status !== "cancelado");
    const parcelaInfo = new Map<string, string>(); // lancamento.id -> "X/Y"
    const porCota = new Map<string, ComissaoLancamento[]>();
    for (const it of naoCanceladas) {
        const arr = porCota.get(it.cota_id) ?? [];
        arr.push(it);
        porCota.set(it.cota_id, arr);
    }
    for (const arr of porCota.values()) {
        const ordenadas = [...arr].sort((a, b) =>
            monthKey(a.competencia_prevista).localeCompare(monthKey(b.competencia_prevista)),
        );
        const total = ordenadas.length;
        ordenadas.forEach((it, i) => parcelaInfo.set(it.id, `${i + 1}/${total}`));
    }

    const toLinha = (it: ComissaoLancamento): Linha => ({
        cliente: it.cliente_nome || "Cliente sem nome",
        cota: it.numero_cota || "—",
        grupo: it.grupo_codigo || "—",
        competencia: monthKey(it.competencia_prevista),
        valor: Number(it.valor_liquido || 0),
        parcela: parcelaInfo.get(it.id) ?? "—",
    });

    const pendentes = items.filter((it) => it.repasse_status === "pendente" && it.status !== "cancelado");
    const aPagar = pendentes
        .filter((it) => monthKey(it.competencia_prevista) && monthKey(it.competencia_prevista) <= mes && !isAtraso(it))
        .map(toLinha);

    const totalAPagar = aPagar.reduce((s, l) => s + l.valor, 0);

    // Agrupa "a pagar" por cliente
    const porCliente = new Map<string, Linha[]>();
    for (const l of aPagar.sort((a, b) => a.competencia.localeCompare(b.competencia))) {
        const arr = porCliente.get(l.cliente) ?? [];
        arr.push(l);
        porCliente.set(l.cliente, arr);
    }
    const clientes = Array.from(porCliente.entries()).sort(
        (a, b) => b[1].reduce((s, l) => s + l.valor, 0) - a[1].reduce((s, l) => s + l.valor, 0),
    );

    const agora = new Date();
    const emitidoEm = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(agora);
    const voltarHref = `/app/parceiros/${parceiroId}`;
    const carimbo = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}_${String(agora.getHours()).padStart(2, "0")}${String(agora.getMinutes()).padStart(2, "0")}`;
    const nomeSanitizado = (parceiro.nome || "parceiro").replace(/[\\/:*?"<>|]+/g, "").trim();
    const docTitle = `Repasses - ${nomeSanitizado} - ${mes} - ${carimbo}`;

    return (
        <div style={{ background: "#eef0f2" }} className="h-full overflow-y-auto p-4 text-neutral-900">
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #repasse-print, #repasse-print * { visibility: visible !important; }
                    #repasse-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; margin: 0 !important; }
                    .no-print { display: none !important; }
                    @page { margin: 16mm; }
                }
            `}</style>

            <div className="mx-auto max-w-[800px]">
                <PrintControls voltarHref={voltarHref} docTitle={docTitle} />

                <div id="repasse-print" className="mx-auto max-w-[800px] rounded-lg bg-white p-8 shadow-sm">
                    {/* Cabeçalho */}
                    <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900">Demonstrativo de Repasses</h1>
                            <p className="mt-0.5 text-sm text-neutral-500">{org?.nome ?? "ContemplaHub"}</p>
                        </div>
                        <div className="text-right text-xs text-neutral-500">
                            <div>Emitido em {emitidoEm}</div>
                            <div>Competência: {monthLabel(mes)}</div>
                        </div>
                    </div>

                    {/* Parceiro */}
                    <div className="mt-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Parceiro</div>
                        <div className="text-lg font-semibold text-neutral-900">{parceiro.nome}</div>
                        {parceiro.cpf_cnpj ? <div className="text-sm text-neutral-500">{parceiro.cpf_cnpj}</div> : null}
                    </div>

                    {/* Resumo */}
                    <div className="mt-5">
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">A pagar neste mês</div>
                            <div className="mt-1 text-2xl font-bold text-emerald-700">{money(totalAPagar)}</div>
                            <div className="text-xs text-emerald-700/70">{aPagar.length} repasse(s)</div>
                        </div>
                    </div>

                    {/* A pagar neste mês */}
                    <div className="mt-6">
                        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-700">A pagar neste mês</h2>
                        {clientes.length === 0 ? (
                            <p className="text-sm text-neutral-400">Nenhum repasse a pagar até este mês.</p>
                        ) : (
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-300 text-left text-[11px] uppercase tracking-wider text-neutral-400">
                                        <th className="py-1.5 pr-2">Cliente</th>
                                        <th className="py-1.5 px-2">Grupo / Cota</th>
                                        <th className="py-1.5 px-2">Competência</th>
                                        <th className="py-1.5 px-2 text-center">Parcela</th>
                                        <th className="py-1.5 pl-2 text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientes.map(([cliente, linhas]) => {
                                        const sub = linhas.reduce((s, l) => s + l.valor, 0);
                                        return (
                                            <Fragment key={cliente}>
                                                {linhas.map((l, i) => (
                                                    <tr key={`${cliente}-${i}`} className="border-b border-neutral-100">
                                                        <td className="py-1.5 pr-2 font-medium text-neutral-800">{i === 0 ? cliente : ""}</td>
                                                        <td className="py-1.5 px-2 text-neutral-600">{l.grupo} · {l.cota}</td>
                                                        <td className="py-1.5 px-2 text-neutral-600">{monthLabel(l.competencia)}</td>
                                                        <td className="py-1.5 px-2 text-center tabular-nums text-neutral-700">{l.parcela}</td>
                                                        <td className="py-1.5 pl-2 text-right tabular-nums text-neutral-900">{money(l.valor)}</td>
                                                    </tr>
                                                ))}
                                                {linhas.length > 1 ? (
                                                    <tr className="border-b border-neutral-200 text-xs">
                                                        <td className="py-1 pr-2 text-neutral-400" colSpan={4}>Subtotal {cliente}</td>
                                                        <td className="py-1 pl-2 text-right font-semibold tabular-nums text-neutral-700">{money(sub)}</td>
                                                    </tr>
                                                ) : null}
                                            </Fragment>
                                        );
                                    })}
                                    <tr className="border-t-2 border-neutral-800">
                                        <td className="py-2 pr-2 font-bold text-neutral-900" colSpan={4}>Total a pagar</td>
                                        <td className="py-2 pl-2 text-right text-base font-bold tabular-nums text-emerald-700">{money(totalAPagar)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>

                    <p className="mt-8 border-t border-neutral-200 pt-3 text-[11px] text-neutral-400">
                        Documento gerado automaticamente pelo ContemplaHub. Valores de repasse sujeitos à confirmação do pagamento do cliente.
                    </p>
                </div>
            </div>
        </div>
    );
}
