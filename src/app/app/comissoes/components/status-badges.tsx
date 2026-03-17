import { Badge } from "@/components/ui/badge";
import type { ComissaoStatus, RepasseStatus } from "../types";

export function ComissaoStatusBadge({ status }: { status: ComissaoStatus }) {
  const map: Record<ComissaoStatus, string> = {
    previsto: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    disponivel: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    pago: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    cancelado: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  };

  return <Badge variant="outline" className={map[status]}>{status}</Badge>;
}

export function RepasseStatusBadge({ status }: { status: RepasseStatus }) {
  const map: Record<RepasseStatus, string> = {
    nao_aplicavel: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    pendente: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    pago: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    cancelado: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  };

  return <Badge variant="outline" className={map[status]}>{status === "nao_aplicavel" ? "n/a" : status}</Badge>;
}
