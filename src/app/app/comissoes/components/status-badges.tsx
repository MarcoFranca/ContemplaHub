import { Badge } from "@/components/ui/badge";
import type { ComissaoStatus, RepasseStatus } from "../types";

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
