export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import {
    getLancamentosContratoAction,
    getResumoFinanceiroContratoAction,
    getTimelineContratoAction,
} from "@/app/app/comissoes/actions";
import { getComissaoCotaAction, listParceirosForSelectAction } from "@/app/app/lances/actions/comissao-actions";
import {
    listFinanceiroContratoOptionsAction,
    listPagamentosByContratoAction,
} from "@/app/app/financeiro/pagamentos/actions";
import { ComissaoOperacionalWorkspace } from "@/app/app/financeiro/pagamentos/components/ComissaoOperacionalWorkspace";

type PageProps = {
    params: Promise<{ leadId: string }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ClienteFinanceiroPage({ params, searchParams }: PageProps) {
    const { leadId } = await params;
    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error("Org inválida");

    const supabase = await supabaseServer();
    const { data: lead } = await supabase
        .from("leads")
        .select("id, nome")
        .eq("org_id", profile.orgId)
        .eq("id", leadId)
        .maybeSingle();
    if (!lead) notFound();

    const sp = searchParams ? await searchParams : {};
    const requested = getParam(sp.contrato_id) || getParam(sp.item_id);

    // Reusa a mesma fonte do Financeiro/Pagamentos, mas filtra só as cartas deste cliente.
    const todas = await listFinanceiroContratoOptionsAction();
    const contratos = todas.filter((c) => c.lead_id === leadId);

    const contratoSelecionado =
        contratos.find((c) => c.selection_id === requested || c.contrato_id === requested) ??
        contratos[0] ??
        null;
    const selectedSelectionId = contratoSelecionado?.selection_id ?? "";

    const [parceirosDisponiveis, comissaoAtual, resumoFinanceiro, timeline, lancamentosResponse, pagamentosResponse] =
        await Promise.all([
            listParceirosForSelectAction(),
            contratoSelecionado?.cota_id ? getComissaoCotaAction(contratoSelecionado.cota_id) : Promise.resolve(null),
            contratoSelecionado?.tem_contrato && contratoSelecionado?.contrato_id
                ? getResumoFinanceiroContratoAction(contratoSelecionado.contrato_id)
                : Promise.resolve(null),
            contratoSelecionado?.tem_contrato && contratoSelecionado?.contrato_id
                ? getTimelineContratoAction(contratoSelecionado.contrato_id)
                : Promise.resolve(null),
            contratoSelecionado?.tem_contrato && contratoSelecionado?.contrato_id
                ? getLancamentosContratoAction(contratoSelecionado.contrato_id)
                : Promise.resolve({ items: [], resumo: null }),
            contratoSelecionado?.tem_contrato && contratoSelecionado?.contrato_id
                ? listPagamentosByContratoAction(contratoSelecionado.contrato_id)
                : Promise.resolve({ ok: true, items: [], total: 0 }),
        ]);

    return (
        <div className="h-full min-h-0 overflow-y-auto">
            <main className="grid min-h-full gap-4 px-4 py-6 pb-10 md:px-6">
                <div>
                    <Link
                        href={`/app/leads/${leadId}`}
                        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Voltar ao cliente
                    </Link>
                    <h1 className="mt-1 text-xl font-semibold">Financeiro — {lead.nome ?? "Cliente"}</h1>
                    <p className="text-sm text-muted-foreground">
                        Configure a comissão, gere e confirme o cronograma e faça a gestão (baixa, pagamento) das cartas deste cliente.
                    </p>
                </div>

                {contratos.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
                        Este cliente ainda não tem cartas para gestão financeira.
                    </p>
                ) : (
                  <>
                    {contratos.length > 1 ? (
                        <div className="flex flex-wrap gap-2">
                            {contratos.map((c) => {
                                const ativo = c.selection_id === selectedSelectionId;
                                return (
                                    <Link
                                        key={c.selection_id}
                                        href={`/app/leads/${leadId}/financeiro?contrato_id=${encodeURIComponent(c.selection_id)}`}
                                        className={`rounded-full border px-3 py-1.5 text-xs ${
                                            ativo
                                                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                                                : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Cota {c.numero_cota || "—"} · Grupo {c.grupo_codigo || "—"}
                                    </Link>
                                );
                            })}
                        </div>
                    ) : null}

                    <ComissaoOperacionalWorkspace
                        key={`${selectedSelectionId}:${contratoSelecionado?.contrato_numero ?? "sem-numero"}:${comissaoAtual?.config?.id ?? "sem-config"}`}
                        basePath={`/app/leads/${leadId}/financeiro`}
                        showCartaSelector={false}
                        contratos={contratos}
                        selectedContratoId={selectedSelectionId}
                        contratoSelecionado={contratoSelecionado}
                        comissaoAtual={comissaoAtual}
                        parceirosDisponiveis={parceirosDisponiveis}
                        resumoFinanceiro={resumoFinanceiro}
                        timeline={timeline}
                        lancamentos={lancamentosResponse.items}
                        pagamentos={pagamentosResponse.items}
                    />
                  </>
                )}
            </main>
        </div>
    );
}
