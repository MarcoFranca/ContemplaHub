import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/server";
import { getLancamentosContratoAction, getResumoFinanceiroContratoAction, getTimelineContratoAction } from "@/app/app/comissoes/actions";
import { getComissaoCotaAction, listParceirosForSelectAction } from "@/app/app/lances/actions/comissao-actions";

import { listFinanceiroContratoOptionsAction, listPagamentosByContratoAction } from "./actions";
import { ComissaoOperacionalWorkspace } from "./components/ComissaoOperacionalWorkspace";

type PageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getParam(value: string | string[] | undefined) {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
}

export default async function FinanceiroPagamentosPage({ searchParams }: PageProps) {
    const profile = await getCurrentProfile();
    if (!profile) {
        redirect("/login");
    }

    const params = searchParams ? await searchParams : {};
    const itemIdFromQuery = getParam(params.item_id);
    const contratoIdFromQuery = getParam(params.contrato_id);

    const contratos = await listFinanceiroContratoOptionsAction();
    const requestedSelectionId =
        itemIdFromQuery ||
        contratoIdFromQuery ||
        contratos[0]?.selection_id ||
        "";
    const contratoSelecionado =
        contratos.find((contrato) => contrato.selection_id === requestedSelectionId || contrato.contrato_id === requestedSelectionId) ??
        contratos[0] ??
        null;
    const selectedSelectionId = contratoSelecionado?.selection_id ?? "";

    const [parceirosDisponiveis, comissaoAtual, resumoFinanceiro, timeline, lancamentosResponse, pagamentosResponse] = await Promise.all([
        listParceirosForSelectAction(),
        contratoSelecionado?.cota_id ? getComissaoCotaAction(contratoSelecionado.cota_id) : Promise.resolve(null),
        contratoSelecionado?.tem_contrato && contratoSelecionado?.contrato_id
            ? getResumoFinanceiroContratoAction(contratoSelecionado.contrato_id)
            : Promise.resolve(null),
        contratoSelecionado?.tem_contrato && contratoSelecionado?.contrato_id ? getTimelineContratoAction(contratoSelecionado.contrato_id) : Promise.resolve(null),
        contratoSelecionado?.tem_contrato && contratoSelecionado?.contrato_id
            ? getLancamentosContratoAction(contratoSelecionado.contrato_id)
            : Promise.resolve({ items: [], resumo: null }),
        contratoSelecionado?.tem_contrato && contratoSelecionado?.contrato_id
            ? listPagamentosByContratoAction(contratoSelecionado.contrato_id)
            : Promise.resolve({ ok: true, items: [], total: 0 }),
    ]);

    return (
        <div className="h-full min-h-0 overflow-y-auto">
            <main className="grid min-h-full gap-6 px-4 py-6 pb-10 md:px-6">
                <ComissaoOperacionalWorkspace
                    key={`${selectedSelectionId}:${contratoSelecionado?.contrato_numero ?? "sem-numero"}:${comissaoAtual?.config?.id ?? "sem-config"}`}
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
            </main>
        </div>
    );
}
