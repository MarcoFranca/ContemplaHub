import { Badge } from "@/components/ui/badge";
import type { ComissaoStatus, CompetenciaStatus, RepasseStatus } from "../types";

const COMISSAO_STATUS_STYLES: Record<ComissaoStatus, string> = {
  previsto: "bg-slate-500/12 text-slate-300 border-slate-500/25",
  disponivel: "bg-amber-500/12 text-amber-300 border-amber-500/25",
  pago: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
  cancelado: "bg-rose-500/12 text-rose-300 border-rose-500/25",
};

const COMISSAO_STATUS_LABELS: Record<ComissaoStatus, string> = {
  previsto: "Previsto",
  disponivel: "Disponível",
  pago: "Pago",
  cancelado: "Cancelado",
};

export function ComissaoStatusBadge({ status }: { status: ComissaoStatus }) {
  return (
    <Badge variant="outline" className={COMISSAO_STATUS_STYLES[status]}>
      {COMISSAO_STATUS_LABELS[status]}
    </Badge>
  );
}

const REPASSE_STATUS_STYLES: Record<RepasseStatus, string> = {
  nao_aplicavel: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  pendente: "bg-amber-500/12 text-amber-300 border-amber-500/25",
  pago: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
  cancelado: "bg-rose-500/12 text-rose-300 border-rose-500/25",
};

const REPASSE_STATUS_LABELS: Record<RepasseStatus, string> = {
  nao_aplicavel: "N/A",
  pendente: "Pendente",
  pago: "Pago",
  cancelado: "Cancelado",
};

export function RepasseStatusBadge({ status }: { status: RepasseStatus }) {
  return (
    <Badge variant="outline" className={REPASSE_STATUS_STYLES[status]}>
      {REPASSE_STATUS_LABELS[status]}
    </Badge>
  );
}

const COMPETENCIA_STATUS_STYLES: Record<CompetenciaStatus, string> = {
  prevista: "bg-slate-500/12 text-slate-300 border-slate-500/25",
  sem_boleto: "bg-orange-500/12 text-orange-300 border-orange-500/25",
  aguardando_pagamento: "bg-amber-500/12 text-amber-300 border-amber-500/25",
  paga_sem_assembleia: "bg-sky-500/12 text-sky-300 border-sky-500/25",
  elegivel_comissao: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
  cancelada: "bg-rose-500/12 text-rose-300 border-rose-500/25",
};

const COMPETENCIA_STATUS_LABELS: Record<CompetenciaStatus, string> = {
  prevista: "Prevista",
  sem_boleto: "Sem boleto",
  aguardando_pagamento: "Aguardando pagamento",
  paga_sem_assembleia: "Paga (sem assembleia)",
  elegivel_comissao: "Elegível p/ comissão",
  cancelada: "Cancelada",
};

export function CompetenciaStatusBadge({ status }: { status: CompetenciaStatus }) {
  return (
    <Badge variant="outline" className={COMPETENCIA_STATUS_STYLES[status] ?? COMPETENCIA_STATUS_STYLES.prevista}>
      {COMPETENCIA_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
