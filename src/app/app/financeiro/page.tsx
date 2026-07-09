export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/server";
import { listComissaoLancamentosAction } from "@/app/app/comissoes/actions";
import type { ComissaoLancamento } from "@/app/app/comissoes/types";

import { FinanceiroPanorama } from "./components/FinanceiroPanorama";

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function monthKey(item: ComissaoLancamento) {
  return (
    item.competencia_real ||
    item.competencia_prevista ||
    item.repasse_pago_em?.slice(0, 7) ||
    item.pago_em?.slice(0, 7) ||
    "sem_competencia"
  );
}

function monthLabel(key: string) {
  if (key === "sem_competencia") return "Sem mes";
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(new Date(year, month - 1, 1));
}

function aggregateTimeline(items: ComissaoLancamento[]) {
  const buckets = new Map<string, {
    mes: string;
    label: string;
    projetado: number;
    pago: number;
    cancelado: number;
    repassePendente: number;
    repassePago: number;
  }>();

  for (const item of items) {
    const key = monthKey(item);
    const bucket = buckets.get(key) ?? {
      mes: key,
      label: monthLabel(key),
      projetado: 0,
      pago: 0,
      cancelado: 0,
      repassePendente: 0,
      repassePago: 0,
    };

    const valor = toNumber(item.valor_liquido);
    if (item.status === "pago") bucket.pago += valor;
    else if (item.status === "cancelado") bucket.cancelado += valor;
    else bucket.projetado += valor;

    if (item.beneficiario_tipo === "parceiro") {
      if (item.repasse_status === "pendente") bucket.repassePendente += valor;
      if (item.repasse_status === "pago") bucket.repassePago += valor;
    }

    buckets.set(key, bucket);
  }

  return [...buckets.values()]
    .sort((a, b) => a.mes.localeCompare(b.mes))
    .slice(-12);
}

function aggregateContracts(items: ComissaoLancamento[]) {
  const buckets = new Map<string, {
    contratoId: string;
    contratoNumero: string;
    cliente: string;
    cota: string;
    empresaReceber: number;
    empresaPaga: number;
    repassePendente: number;
  }>();

  for (const item of items) {
    const key = item.contrato_id || item.cota_id || item.id;
    const bucket = buckets.get(key) ?? {
      contratoId: item.contrato_id,
      contratoNumero: item.contrato_numero || "Sem contrato",
      cliente: item.cliente_nome || "Cliente nao informado",
      cota: item.numero_cota || "—",
      empresaReceber: 0,
      empresaPaga: 0,
      repassePendente: 0,
    };

    const valor = toNumber(item.valor_liquido);
    if (item.beneficiario_tipo === "empresa") {
      if (item.status === "pago") bucket.empresaPaga += valor;
      if (item.status !== "pago" && item.status !== "cancelado") bucket.empresaReceber += valor;
    }

    if (item.beneficiario_tipo === "parceiro" && item.repasse_status === "pendente") {
      bucket.repassePendente += valor;
    }

    buckets.set(key, bucket);
  }

  return [...buckets.values()]
    .sort((a, b) => (b.empresaReceber + b.repassePendente) - (a.empresaReceber + a.repassePendente))
    .slice(0, 8);
}

export default async function FinanceiroPage() {
  const profile = await getCurrentProfile();
  if (!profile?.orgId) {
    redirect("/login");
  }

  const data = await listComissaoLancamentosAction();
  const items = data.items ?? [];

  const totals = items.reduce(
    (acc, item) => {
      const valor = toNumber(item.valor_liquido);

      if (item.beneficiario_tipo === "empresa") {
        if (item.status === "pago") acc.empresaPago += valor;
        else if (item.status === "cancelado") acc.cancelado += valor;
        else if (item.status === "disponivel") acc.empresaDisponivel += valor;
        else acc.empresaProjetada += valor;
      }

      if (item.beneficiario_tipo === "parceiro") {
        if (item.repasse_status === "pendente") acc.repassePendente += valor;
        if (item.repasse_status === "pago") acc.repassePago += valor;
      }

      return acc;
    },
    {
      empresaProjetada: 0,
      empresaDisponivel: 0,
      empresaPago: 0,
      repassePendente: 0,
      repassePago: 0,
      cancelado: 0,
    },
  );

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <main className="grid min-h-full gap-6 px-4 py-6 pb-10 md:px-6">
        <FinanceiroPanorama
          resumo={{
            totalLancamentos: items.length,
            empresaProjetada: totals.empresaProjetada,
            empresaDisponivel: totals.empresaDisponivel,
            empresaPago: totals.empresaPago,
            repassePendente: totals.repassePendente,
            repassePago: totals.repassePago,
            cancelado: totals.cancelado,
          }}
          timeline={aggregateTimeline(items)}
          contratosCriticos={aggregateContracts(items)}
        />
      </main>
    </div>
  );
}
