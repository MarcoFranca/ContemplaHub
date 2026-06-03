"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { backendAuthed } from "@/app/app/lances/actions/backend";
import { gerarLancamentosContratoAction } from "@/app/app/comissoes/actions";
import { saveComissaoCotaAction } from "@/app/app/lances/actions/comissao-actions";
import type { CotaComissaoPayload } from "@/app/app/lances/types";
import { getCurrentProfile } from "@/lib/auth/server";

import type {
    FinanceiroContratoOption,
    FinanceiroComissaoActionResult,
    FinanceiroContratoNumeroResult,
    FinanceiroCronogramaPersistResult,
    FinanceiroPagamentoOperacaoResult,
    FinanceiroProjectionResponse,
    PagamentoActionState,
    PagamentoItem,
    PagamentoListResponse,
    PagamentoProcessamentoFeedback,
    PagamentoStatus,
} from "./types";

const pagamentoSchema = z.object({
    contrato_id: z.string().uuid(),
    competencia: z.string().min(1),
    valor: z.coerce.number().positive(),
    vencimento: z.string().min(1, "Informe o vencimento."),
    status: z.enum(["previsto", "emitido", "pago", "atrasado", "inadimplente", "cancelado"]),
    pago_em: z.string().optional(),
    observacoes: z.string().optional(),
});

function normalizeDateOnly(value?: string) {
    const trimmed = (value ?? "").trim();
    return trimmed ? trimmed : undefined;
}

function normalizeDateTime(value?: string) {
    const trimmed = (value ?? "").trim();
    return trimmed ? new Date(trimmed).toISOString() : undefined;
}

function buildPayload(input: z.infer<typeof pagamentoSchema>) {
    return {
        contrato_id: input.contrato_id,
        competencia: input.competencia,
        valor: input.valor,
        vencimento: normalizeDateOnly(input.vencimento),
        status: input.status,
        pago_em: normalizeDateTime(input.pago_em),
        observacoes: input.observacoes?.trim() || undefined,
        tipo: "parcela_mensal",
        origem: "manual",
    };
}

export async function listFinanceiroContratoOptionsAction() {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) return [];

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } },
    );

    const [cotasResp, contratosResp, configResp, parceirosResp] = await Promise.all([
        supabase
            .from("cotas")
            .select(`
                id,
                status,
                numero_cota,
                grupo_codigo,
                valor_carta,
                administradora_id,
                administradoras ( id, nome ),
                lead_id,
                leads ( id, nome )
            `)
            .eq("org_id", profile.orgId)
            .order("created_at", { ascending: false }),
        supabase
            .from("contratos")
            .select("id, numero, status, cota_id, created_at")
            .eq("org_id", profile.orgId)
            .order("created_at", { ascending: false }),
        supabase
            .from("cota_comissao_config")
            .select("cota_id, percentual_total, modo")
            .eq("org_id", profile.orgId)
            .eq("ativo", true),
        supabase
            .from("cota_comissao_parceiros")
            .select("cota_id, parceiro_id, percentual_parceiro, ativo, parceiros_corretores ( id, nome, ativo )")
            .eq("org_id", profile.orgId)
            .eq("ativo", true),
    ]);

    const cotas = cotasResp.data ?? [];
    const contratos = contratosResp.data ?? [];
    const configs = configResp.data ?? [];
    const parceiros = parceirosResp.data ?? [];

    const contratoByCota = new Map<string, (typeof contratos)[number]>();
    for (const contrato of contratos) {
        if (!contrato.cota_id || contratoByCota.has(contrato.cota_id)) continue;
        contratoByCota.set(contrato.cota_id, contrato);
    }

    const configByCota = new Map(
        configs
            .filter((row) => row.cota_id)
            .map((row) => [row.cota_id as string, row]),
    );

    const parceiroByCota = new Map<string, (typeof parceiros)[number]>();
    for (const parceiro of parceiros) {
        const cotaId = parceiro.cota_id as string | null;
        const parceiroData = parceiro.parceiros_corretores as { id?: string; nome?: string; ativo?: boolean } | null;
        if (!cotaId || !parceiroData?.ativo || parceiroByCota.has(cotaId)) continue;
        parceiroByCota.set(cotaId, parceiro);
    }

    return cotas.map((cota) => {
        const contrato = contratoByCota.get(cota.id);
        const config = configByCota.get(cota.id);
        const parceiro = parceiroByCota.get(cota.id);
        const parceiroData = (parceiro?.parceiros_corretores as { nome?: string } | null) ?? null;
        const lead = (cota.leads as { nome?: string } | null) ?? null;
        const administradora = (cota.administradoras as { nome?: string } | null) ?? null;

        return {
            selection_id: contrato?.id || `cota:${cota.id}`,
            tem_contrato: Boolean(contrato),
            contrato_id: contrato?.id || "",
            contrato_numero: contrato?.numero ?? null,
            contrato_status: contrato?.status ?? null,
            cota_status: cota.status ?? null,
            cota_id: cota.id,
            numero_cota: cota.numero_cota ?? null,
            grupo_codigo: cota.grupo_codigo ?? null,
            valor_carta: cota.valor_carta ?? null,
            cliente_nome: lead?.nome ?? null,
            administradora_nome: administradora?.nome ?? null,
            possui_comissao_ativa: Boolean(config),
            percentual_comissao: config?.percentual_total ?? null,
            modo_comissao: config?.modo ?? null,
            parceiro_vinculado: Boolean(parceiro),
            parceiro_nome: parceiroData?.nome ?? null,
            parceiro_percentual: parceiro?.percentual_parceiro ?? null,
        } satisfies FinanceiroContratoOption;
    });
}

export async function listPagamentosByContratoAction(contratoId: string) {
    return backendAuthed<PagamentoListResponse>(`/financeiro/contratos/${contratoId}/pagamentos`);
}

export async function listPagamentosByCotaAction(cotaId: string) {
    return backendAuthed<PagamentoListResponse>(`/financeiro/cotas/${cotaId}/pagamentos`);
}

export async function updateFinanceiroContratoNumeroAction(
    contratoId: string,
    numeroContrato: string,
): Promise<FinanceiroContratoNumeroResult> {
    try {
        const data = await backendAuthed<{ ok: boolean; item?: { contrato_numero?: string | null } }>(
            `/financeiro/contratos/${contratoId}/numero`,
            {
                method: "PUT",
                body: JSON.stringify({
                    numero_contrato: numeroContrato.trim(),
                }),
            },
        );

        revalidatePath("/app/financeiro/pagamentos");
        return {
            ok: true,
            contrato_numero: data.item?.contrato_numero || numeroContrato.trim(),
            message: "Numero do contrato atualizado com sucesso.",
        };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : "Nao foi possivel atualizar o numero do contrato.",
        };
    }
}

export async function saveFinanceiroComissaoConfigAction(
    cotaId: string,
    payload: CotaComissaoPayload,
): Promise<FinanceiroComissaoActionResult> {
    try {
        const comissao = await saveComissaoCotaAction(cotaId, payload);
        revalidatePath("/app/financeiro/pagamentos");
        revalidatePath("/app/comissoes");

        return {
            ok: true,
            comissao,
            message: "Configuracao comercial da comissao salva com sucesso.",
        };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : "Nao foi possivel salvar a configuracao da comissao.",
        };
    }
}

export async function generateFinanceiroProjectionAction(
    contratoId: string,
): Promise<FinanceiroComissaoActionResult> {
    try {
        const projection: FinanceiroProjectionResponse = await gerarLancamentosContratoAction(contratoId, false);
        revalidatePath("/app/financeiro/pagamentos");

        return {
            ok: true,
            projection,
            message: "Cronograma previsto gerado com sucesso.",
        };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : "Nao foi possivel gerar a previsao operacional.",
        };
    }
}

export async function persistFinanceiroCronogramaAction(
    contratoId: string,
): Promise<FinanceiroCronogramaPersistResult> {
    try {
        const result = await backendAuthed<{
            ok: boolean;
            pagamentos_processados: number;
            pagamentos_criados: number;
            pagamentos_atualizados: number;
            pagamentos_cancelados: number;
        }>(`/financeiro/contratos/${contratoId}/cronograma`, {
            method: "POST",
        });

        revalidatePath("/app/financeiro/pagamentos");
        revalidatePath("/app/comissoes");
        return {
            ok: true,
            pagamentos_processados: result.pagamentos_processados,
            pagamentos_criados: result.pagamentos_criados,
            pagamentos_atualizados: result.pagamentos_atualizados,
            pagamentos_cancelados: result.pagamentos_cancelados,
            message: `Cronograma operacional confirmado com ${result.pagamentos_processados} parcelas processadas.`,
        };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : "Nao foi possivel persistir o cronograma operacional.",
        };
    }
}

export async function updateFinanceiroPagamentoStatusAction(
    item: PagamentoItem,
    status: PagamentoStatus,
): Promise<FinanceiroPagamentoOperacaoResult> {
    try {
        await backendAuthed(`/financeiro/pagamentos/${item.id}`, {
            method: "PUT",
            body: JSON.stringify({
                contrato_id: item.contrato_id,
                competencia: item.competencia,
                valor: Number(item.valor),
                vencimento: item.vencimento,
                status,
                pago_em: status === "pago" ? item.pago_em || new Date().toISOString() : undefined,
                observacoes: item.observacoes || undefined,
                tipo: item.tipo || "parcela_mensal",
                origem: item.origem || "manual",
            }),
        });

        revalidatePath("/app/financeiro/pagamentos");
        revalidatePath("/app/comissoes");
        return {
            ok: true,
            pagamento_id: item.id,
            pagamentos_afetados: 1,
            message:
                status === "pago"
                    ? "Parcela marcada como paga e comissão reprocessada."
                    : status === "inadimplente"
                      ? "Parcela marcada como inadimplente e comissão bloqueada."
                      : status === "cancelado"
                        ? "Parcela cancelada e comissão reprocessada."
                        : "Parcela atualizada com sucesso.",
        };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : "Nao foi possivel atualizar o status da parcela.",
        };
    }
}

export async function skipFinanceiroPagamentoAction(
    pagamentoId: string,
): Promise<FinanceiroPagamentoOperacaoResult> {
    try {
        const result = await backendAuthed<{ ok: boolean; pagamento_id: string; pagamentos_afetados: number; message?: string }>(
            `/financeiro/pagamentos/${pagamentoId}/pular`,
            { method: "POST" },
        );
        revalidatePath("/app/financeiro/pagamentos");
        revalidatePath("/app/comissoes");
        return {
            ok: true,
            pagamento_id: result.pagamento_id,
            pagamentos_afetados: result.pagamentos_afetados,
            message: result.message || "Competencia pulada com sucesso.",
        };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : "Nao foi possivel pular a competencia.",
        };
    }
}

export async function cancelFinanceiroFuturePaymentsAction(
    pagamentoId: string,
): Promise<FinanceiroPagamentoOperacaoResult> {
    try {
        const result = await backendAuthed<{ ok: boolean; pagamento_id: string; pagamentos_afetados: number; message?: string }>(
            `/financeiro/pagamentos/${pagamentoId}/cancelar-futuro`,
            { method: "POST" },
        );
        revalidatePath("/app/financeiro/pagamentos");
        revalidatePath("/app/comissoes");
        return {
            ok: true,
            pagamento_id: result.pagamento_id,
            pagamentos_afetados: result.pagamentos_afetados,
            message: result.message || "Recebimentos futuros cancelados com sucesso.",
        };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : "Nao foi possivel cancelar os recebimentos futuros.",
        };
    }
}

type FinanceiroBackendActionResponse = {
    ok: boolean;
    item?: PagamentoItem;
    competencia?: {
        id?: string;
        status?: string;
    };
    processamento?: {
        competencia?: {
            id?: string;
            status?: string;
        };
        processamento?: {
            items?: Array<{
                id?: string;
                status?: string;
            }>;
        };
    };
};

function summarizeProcessamento(result: FinanceiroBackendActionResponse): PagamentoProcessamentoFeedback {
    const competencia = result?.processamento?.competencia ?? result?.competencia ?? null;
    const processamento = result?.processamento?.processamento ?? result?.processamento ?? null;
    const items = Array.isArray(processamento?.items) ? processamento.items : [];
    const firstLancamento = items[0] ?? null;
    const lancamentoStatus = firstLancamento?.status;

    return {
        pagamentoId: result?.item?.id,
        contratoId: result?.item?.contrato_id,
        competenciaId: competencia?.id,
        competenciaStatus: competencia?.status,
        lancamentoId: firstLancamento?.id,
        lancamentoStatus,
        comissaoGerada: Boolean(firstLancamento),
        comissaoBloqueada: lancamentoStatus === "previsto",
        comissaoCancelada: lancamentoStatus === "cancelado",
    };
}

function buildSuccessMessage(verb: "criado" | "atualizado", summary: PagamentoProcessamentoFeedback) {
    if (summary.comissaoCancelada) {
        return `Pagamento ${verb}. Competência processada e comissão cancelada.`;
    }
    if (summary.comissaoBloqueada) {
        return `Pagamento ${verb}. Competência gerada e comissão bloqueada.`;
    }
    if (summary.comissaoGerada) {
        return `Pagamento ${verb}. Competência gerada e comissão processada.`;
    }
    return `Pagamento ${verb}. Competência processada sem lançamento de comissão.`;
}

function parseFormData(formData: FormData) {
    return pagamentoSchema.parse({
        contrato_id: formData.get("contrato_id"),
        competencia: formData.get("competencia"),
        valor: formData.get("valor"),
        vencimento: formData.get("vencimento"),
        status: formData.get("status") as PagamentoStatus,
        pago_em: formData.get("pago_em"),
        observacoes: formData.get("observacoes"),
    });
}

export async function createPagamentoAction(_: PagamentoActionState, formData: FormData): Promise<PagamentoActionState> {
    try {
        const parsed = parseFormData(formData);
        const result = await backendAuthed<FinanceiroBackendActionResponse>("/financeiro/pagamentos", {
            method: "POST",
            body: JSON.stringify(buildPayload(parsed)),
        });

        revalidatePath("/app/financeiro/pagamentos");
        const processing = summarizeProcessamento(result);
        return {
            ok: true,
            item: result.item,
            processing,
            message: buildSuccessMessage("criado", processing),
        };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : "Nao foi possivel criar o pagamento.",
        };
    }
}

export async function updatePagamentoAction(_: PagamentoActionState, formData: FormData): Promise<PagamentoActionState> {
    const pagamentoId = String(formData.get("pagamento_id") || "");
    if (!pagamentoId) {
        return { ok: false, error: "Pagamento nao informado." };
    }

    try {
        const parsed = parseFormData(formData);
        const result = await backendAuthed<FinanceiroBackendActionResponse>(`/financeiro/pagamentos/${pagamentoId}`, {
            method: "PUT",
            body: JSON.stringify(buildPayload(parsed)),
        });

        revalidatePath("/app/financeiro/pagamentos");
        const processing = summarizeProcessamento(result);
        return {
            ok: true,
            item: result.item,
            processing,
            message: buildSuccessMessage("atualizado", processing),
        };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : "Nao foi possivel atualizar o pagamento.",
        };
    }
}
