"use server";

import { revalidatePath } from "next/cache";
import { backendAuthed } from "@/app/app/lances/actions/backend";

export type AzosPolicy = { id: string; azos_id: string; lead_id?: string | null; policy_number?: string | null; policy_url?: string | null; insured_name?: string | null; broker_name?: string | null; status?: string | null; starts_at?: string | null; ends_at?: string | null; total_monthly_premium?: number | string | null; late_payment_days?: number | null; overdue_invoices_count?: number | null; external_updated_at?: string | null };
export type AzosCommission = { id: string; azos_id: string; policy_azos_id?: string | null; policy_number?: string | null; insured_name?: string | null; commission_value?: number | string | null; commission_percentage?: number | string | null; paid_at?: string | null; status?: string | null; broker_agent_email?: string | null; invoice_sequence_number?: number | null; invoice_value?: number | string | null; invoice_paid_at?: string | null };
export type AzosPortfolioSummary = { apolices_ativas: number; apolices_em_atraso: number; apolices_inativas: number; premio_mensal_recorrente: number; premio_anualizado: number; premio_mensal_em_risco: number; ticket_medio_mensal: number; comissao_paga: number; comissao_programada: number; comissao_em_conferencia: number; comissao_a_receber: number; comissao_total: number; realizacao_comissao_pct: number };
export type AzosPortfolio = { apolices: AzosPolicy[]; comissoes: AzosCommission[]; resumo: AzosPortfolioSummary };
export type AzosPortfolioSync = {
  ok: boolean;
  propostas: { received: number; synced: number; pdfs_enviados: number };
  apolices: { received: number; synced: number; associadas_por_cpf: number };
  comissoes: { received: number; synced: number };
  avisos: string[];
};
export type AzosPortfolioSyncAction =
  | { ok: true; data: AzosPortfolioSync }
  | { ok: false; error: string };

export async function getAzosPortfolioAction(): Promise<AzosPortfolio> { return backendAuthed<AzosPortfolio>("/seguros/azos/carteira"); }

function readableSyncError(cause: unknown): string {
  if (!(cause instanceof Error)) return "Não foi possível sincronizar a Azos.";
  try {
    const parsed = JSON.parse(cause.message) as { detail?: string | { message?: string; recursos?: Record<string, string> } };
    if (typeof parsed.detail === "string") return parsed.detail;
    if (parsed.detail?.recursos) {
      const resources = Object.entries(parsed.detail.recursos).map(([name, detail]) => `${name}: ${detail}`).join("; ");
      return `${parsed.detail.message ?? "A sincronização falhou."} ${resources}`;
    }
    return parsed.detail?.message ?? cause.message;
  } catch {
    return cause.message;
  }
}

export async function syncAzosPortfolioAction(): Promise<AzosPortfolioSyncAction> {
  try {
    const data = await backendAuthed<AzosPortfolioSync>("/seguros/azos/carteira/sincronizar", {
      method: "POST",
      body: JSON.stringify({ limit: 100, offset: 0 }),
    });
    revalidatePath("/app/seguros-azos");
    return { ok: true, data };
  } catch (cause) {
    return { ok: false, error: readableSyncError(cause) };
  }
}
