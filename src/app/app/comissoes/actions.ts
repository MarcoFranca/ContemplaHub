"use server";

import { revalidatePath } from "next/cache";
import { getBackendUrl } from "@/lib/backend";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import type {
  ComissaoFilters,
  ComissaoLancamentosResponse,
  ComissaoLancamento,
  ComissaoResumo,
  ComissaoStatus,
  ParceiroOption,
  RepasseStatus,
  CompetenciasContratoResponse,
  ResumoFinanceiroContratoResponse,
  TimelineContratoResponse,
} from "./types";
import type { FinanceiroProjectionResponse } from "@/app/app/financeiro/pagamentos/types";

type Envelope<T> = {
  ok?: boolean;
  items?: T[];
  item?: T;
  resumo?: ComissaoResumo | null;
};

async function getBackendAuthContext() {
  const profile = await getCurrentProfile();
  if (!profile?.orgId) throw new Error("Organização inválida.");

  const supabase = await supabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error("Sessão inválida. Faça login novamente.");

  return { orgId: profile.orgId, accessToken };
}

async function backendAuthed<T>(path: string, init?: RequestInit): Promise<T> {
  const { orgId, accessToken } = await getBackendAuthContext();
  const baseUrl = getBackendUrl();

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Org-Id": orgId,
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ${res.status} ao chamar backend.`);
  }

  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

function qs(params: Record<string, string | null | undefined>) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    q.set(key, value);
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function listComissaoLancamentosAction(filters: ComissaoFilters = {}): Promise<ComissaoLancamentosResponse> {
  const query = qs({
    parceiro_id: filters.parceiro_id,
    contrato_id: filters.contrato_id,
    cota_id: filters.cota_id,
    status: filters.status || undefined,
    repasse_status: filters.repasse_status || undefined,
    competencia_de: filters.competencia_de,
    competencia_ate: filters.competencia_ate,
  });

  const data = await backendAuthed<Envelope<ComissaoLancamento>>(`/comissoes/lancamentos${query}`, {
    method: "GET",
  });

  return { items: data.items ?? [], resumo: data.resumo ?? null };
}

export async function getLancamentosContratoAction(contratoId: string): Promise<ComissaoLancamentosResponse> {
  const data = await backendAuthed<Envelope<ComissaoLancamento>>(`/comissoes/contratos/${contratoId}`, {
    method: "GET",
  });
  return { items: data.items ?? [], resumo: data.resumo ?? null };
}

export async function listParceirosOptionsAction(): Promise<ParceiroOption[]> {
  const data = await backendAuthed<{ items?: Array<{ id: string; nome: string }> }>(`/comissoes/parceiros?ativos=true`, {
    method: "GET",
  });
  return (data.items ?? []).map((item) => ({ id: item.id, nome: item.nome }));
}

export async function gerarLancamentosContratoAction(
  contratoId: string,
  sobrescrever = false,
): Promise<FinanceiroProjectionResponse> {
  const data = await backendAuthed<FinanceiroProjectionResponse>(`/comissoes/contratos/${contratoId}/gerar`, {
    method: "POST",
    body: JSON.stringify({ sobrescrever }),
  });

  revalidatePath("/app/comissoes");
  revalidatePath(`/app/contratos/${contratoId}`);
  return data;
}

export async function sincronizarEventosContratoAction(contratoId: string) {
  const data = await backendAuthed(`/comissoes/contratos/${contratoId}/sincronizar-eventos`, {
    method: "POST",
  });

  revalidatePath("/app/comissoes");
  revalidatePath(`/app/contratos/${contratoId}`);
  return data;
}

export async function updateLancamentoStatusAction(formData: FormData) {
  const lancamentoId = String(formData.get("lancamento_id") || "").trim();
  const status = String(formData.get("status") || "").trim() as ComissaoStatus;
  const competencia_real = String(formData.get("competencia_real") || "").trim();
  const observacoes = String(formData.get("observacoes") || "").trim();
  const refreshPath = String(formData.get("refresh_path") || "/app/comissoes");

  if (!lancamentoId) throw new Error("Lançamento inválido.");
  if (!["previsto", "disponivel", "pago", "cancelado"].includes(status)) throw new Error("Status inválido.");

  await backendAuthed(`/comissoes/lancamentos/${lancamentoId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      competencia_real: competencia_real || null,
      observacoes: observacoes || null,
    }),
  });

  revalidatePath("/app/comissoes");
  revalidatePath(refreshPath);
}

export async function updateRepasseAction(formData: FormData) {
  const lancamentoId = String(formData.get("lancamento_id") || "").trim();
  const repasse_status = String(formData.get("repasse_status") || "").trim() as RepasseStatus;
  const repasse_previsto_em = String(formData.get("repasse_previsto_em") || "").trim();
  const repasse_pago_em = String(formData.get("repasse_pago_em") || "").trim();
  const repasse_observacoes = String(formData.get("repasse_observacoes") || "").trim();
  const refreshPath = String(formData.get("refresh_path") || "/app/comissoes");

  if (!lancamentoId) throw new Error("Lançamento inválido.");
  if (!["pendente", "pago", "cancelado"].includes(repasse_status)) throw new Error("Status de repasse inválido.");

  await backendAuthed(`/comissoes/lancamentos/${lancamentoId}/repasse`, {
    method: "PATCH",
    body: JSON.stringify({
      repasse_status,
      repasse_previsto_em: repasse_previsto_em || null,
      repasse_pago_em: repasse_pago_em || null,
      repasse_observacoes: repasse_observacoes || null,
    }),
  });

  revalidatePath("/app/comissoes");
  revalidatePath(refreshPath);
}

export async function getCompetenciasContratoAction(contratoId: string): Promise<CompetenciasContratoResponse> {
  return backendAuthed<CompetenciasContratoResponse>(`/comissoes/contratos/${contratoId}/competencias`, {
    method: "GET",
  });
}

export async function getResumoFinanceiroContratoAction(contratoId: string): Promise<ResumoFinanceiroContratoResponse> {
  return backendAuthed<ResumoFinanceiroContratoResponse>(`/comissoes/contratos/${contratoId}/resumo-financeiro`, {
    method: "GET",
  });
}

export async function getTimelineContratoAction(contratoId: string): Promise<TimelineContratoResponse> {
  return backendAuthed<TimelineContratoResponse>(`/comissoes/contratos/${contratoId}/timeline`, {
    method: "GET",
  });
}

export async function processarPagamentoComissaoAction(pagamentoId: string, refreshPath = "/app/comissoes") {
  const data = await backendAuthed(`/comissoes/pagamentos/${pagamentoId}/processar`, {
    method: "POST",
  });

  revalidatePath("/app/comissoes");
  revalidatePath(refreshPath);
  return data;
}

/**
 * Reverte um lançamento para "previsto" (desfaz baixa ou cancelamento incorretos).
 */
export async function reverterPrevistoAction(lancamentoId: string) {
  await backendAuthed(`/comissoes/lancamentos/${lancamentoId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "previsto",
      competencia_real: null,
      observacoes: "Revertido para previsto manualmente.",
    }),
  });
  revalidatePath("/app/comissoes");
}

/**
 * Marca o lançamento para cobrança ativa (cliente em atraso no boleto).
 * Mantém o lançamento como "previsto" mas sinaliza com flag de inadimplência.
 */
export async function marcarParaCobrancaAction(lancamentoId: string, motivo = "") {
  const obs = `⚠ INADIMPLENTE${motivo ? `: ${motivo}` : ""}`;
  await backendAuthed(`/comissoes/lancamentos/${lancamentoId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "previsto",
      competencia_real: null,
      observacoes: obs,
    }),
  });
  revalidatePath("/app/comissoes");
}

/**
 * Remove o flag de inadimplência de um lançamento (cliente regularizou).
 */
export async function removerFlagCobrancaAction(lancamentoId: string) {
  await backendAuthed(`/comissoes/lancamentos/${lancamentoId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "previsto",
      competencia_real: null,
      observacoes: null,
    }),
  });
  revalidatePath("/app/comissoes");
}

/**
 * Marca um único lançamento como pago (ação direta, sem FormData).
 * Usada nos botões "Dar baixa" inline da visão operacional.
 */
export async function marcarPagoAction(
  lancamentoId: string,
  obs = "Baixa registrada na operação mensal."
) {
  await backendAuthed(`/comissoes/lancamentos/${lancamentoId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "pago", competencia_real: null, observacoes: obs }),
  });
  revalidatePath("/app/comissoes");
}

/**
 * Marca um lançamento como cancelado (cota cancelada / não será mais pago).
 */
export async function marcarCanceladoAction(
  lancamentoId: string,
  obs = "Cancelado na operação mensal."
) {
  await backendAuthed(`/comissoes/lancamentos/${lancamentoId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "cancelado", competencia_real: null, observacoes: obs }),
  });
  revalidatePath("/app/comissoes");
}

/**
 * Dá baixa em lote em vários lançamentos de uma vez.
 * Usada no botão "Dar baixa em lote" da visão do mês atual.
 */
export async function marcarLotePagoAction(lancamentoIds: string[]) {
  await Promise.all(
    lancamentoIds.map((id) =>
      backendAuthed(`/comissoes/lancamentos/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "pago",
          competencia_real: null,
          observacoes: "Baixa em lote — operação mensal.",
        }),
      })
    )
  );
  revalidatePath("/app/comissoes");
}

export async function marcarRepassePagoAction(formData: FormData) {
  const lancamentoId = String(formData.get("lancamento_id") || "").trim();
  const pagoEm = String(formData.get("pago_em") || "").trim();
  const observacoes = String(formData.get("observacoes") || "").trim();
  const refreshPath = String(formData.get("refresh_path") || "/app/comissoes");

  if (!lancamentoId) throw new Error("Lançamento inválido.");

  await backendAuthed(`/comissoes/lancamentos/${lancamentoId}/marcar-repasse-pago`, {
    method: "POST",
    body: JSON.stringify({
      pago_em: pagoEm || null,
      observacoes: observacoes || null,
    }),
  });

  revalidatePath("/app/comissoes");
  revalidatePath(refreshPath);
}
