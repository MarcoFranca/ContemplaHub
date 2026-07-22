"use server";

import { getBackendUrl } from "@/lib/backend";
import { getBackendAuthContext } from "@/app/app/lances/actions/backend";
import type { AzosProfileInput, AzosQuoteInput } from "./schema";

export type AzosProfession = { _id: string; name: string };
export type AzosCoverage = { coverage_code: string; commercial_name: string; available: boolean; can_be_sold_alone: boolean; parent: string[]; children: string[]; capital: { max_covered_capital: number; max_shared_coverage_capital: number; capital_multiple: number } };
export type AzosQuoteResult = { id?: string; total_premium?: number; discount?: { discounted_premium_value?: number; annual_discounted_value?: number }; coverages?: Array<{ title: string; code: string; capital: number; premium: number; error?: string | null }> };
export type AzosPublicProposal = { id: string; public_hash: string; public_url: string; whatsapp_message: string; expires_at: string };
type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function azosRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { orgId, accessToken } = await getBackendAuthContext();
  const response = await fetch(`${getBackendUrl()}${path}`, { ...init, cache: "no-store", headers: { "Content-Type": "application/json", "X-Org-Id": orgId, Authorization: `Bearer ${accessToken}`, ...(init?.headers ?? {}) } });
  if (!response.ok) throw new Error((await response.text()) || "Não foi possível concluir a solicitação com a Azos.");
  return response.json() as Promise<T>;
}

function actionError(error: unknown): string { return error instanceof Error ? error.message : "Ocorreu um erro inesperado."; }

export async function listAzosProfessionsAction(): Promise<ActionResult<AzosProfession[]>> {
  try { return { ok: true, data: await azosRequest<AzosProfession[]>("/seguros/azos/profissoes") }; } catch (error) { return { ok: false, error: actionError(error) }; }
}

export async function listAzosCoveragesAction(leadId: string, profile: AzosProfileInput): Promise<ActionResult<AzosCoverage[]>> {
  try { return { ok: true, data: await azosRequest<AzosCoverage[]>(`/seguros/azos/leads/${encodeURIComponent(leadId)}/coberturas`, { method: "POST", body: JSON.stringify({ perfil: profile }) }) }; } catch (error) { return { ok: false, error: actionError(error) }; }
}

export async function createAzosQuoteAction(leadId: string, payload: AzosQuoteInput): Promise<ActionResult<AzosQuoteResult>> {
  try { return { ok: true, data: await azosRequest<AzosQuoteResult>(`/seguros/azos/leads/${encodeURIComponent(leadId)}/cotacoes`, { method: "POST", body: JSON.stringify(payload) }) }; } catch (error) { return { ok: false, error: actionError(error) }; }
}

export async function publishAzosQuoteAction(quoteId: string): Promise<ActionResult<AzosPublicProposal>> {
  try { return { ok: true, data: await azosRequest<AzosPublicProposal>(`/seguros/azos/cotacoes/${encodeURIComponent(quoteId)}/publicar`, { method: "POST" }) }; } catch (error) { return { ok: false, error: actionError(error) }; }
}
