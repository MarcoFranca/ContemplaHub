"use client";

import Link from "next/link";
import { ExternalLink, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HistoricoLanceItem = {
  id: string;
  assembleia_data?: string | null;
  tipo?: string | null;
  percentual?: number | null;
  valor?: number | null;
  origem?: string | null;
  resultado?: string | null;
  created_at?: string | null;
};

type Contemplacao = {
  id: string;
  motivo: string;
  lance_percentual?: number | null;
  data: string;
} | null;

type Props = {
  cotaId: string;
  historicoLances: HistoricoLanceItem[];
  contemplacao?: Contemplacao;
};

function money(v?: number | string | null) {
  if (v == null) return "—";
  const num = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(num)) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

function fmtPercent(v?: number | string | null) {
  if (v == null) return "—";
  const num = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(num)) return "—";
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(num)}%`;
}

function fmtDate(v?: string | null) {
  if (!v) return "—";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${v}T00:00:00`));
}

function resultadoBadgeClass(resultado?: string | null) {
  switch ((resultado ?? "").toLowerCase()) {
    case "contemplado":
      return "border-emerald-500/25 bg-emerald-500/12 text-emerald-300";
    case "desclassificado":
      return "border-rose-500/25 bg-rose-500/12 text-rose-300";
    case "nao_contemplado":
    case "não_contemplado":
      return "border-slate-500/25 bg-slate-500/12 text-slate-300";
    default:
      return "border-amber-500/25 bg-amber-500/12 text-amber-300";
  }
}

export function HistoricoLancesPanel({ cotaId, historicoLances, contemplacao }: Props) {
  return (
    <Card className="border-border/35 bg-card/15">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Histórico de lances</CardTitle>
          <Link
            href={`/app/lances/${cotaId}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-emerald-300"
          >
            Ver carta completa
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {contemplacao && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3 text-sm">
            <Trophy className="h-4 w-4 text-emerald-300" />
            <div>
              <span className="font-medium text-emerald-300">Contemplada</span>{" "}
              <span className="text-muted-foreground">
                em {fmtDate(contemplacao.data)}
                {contemplacao.lance_percentual != null && (
                  <> · lance {fmtPercent(contemplacao.lance_percentual)}</>
                )}
                {contemplacao.motivo && <> · {contemplacao.motivo}</>}
              </span>
            </div>
          </div>
        )}

        {historicoLances.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/40 p-4 text-center text-sm text-muted-foreground">
            Nenhum lance registrado até o momento.
          </div>
        ) : (
          <div className="space-y-2">
            {historicoLances.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/30 bg-card/20 px-3 py-2.5 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={resultadoBadgeClass(item.resultado)}>
                    {item.resultado || "Pendente"}
                  </Badge>
                  <span className="text-muted-foreground">{item.tipo || "Tipo não informado"}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {fmtPercent(item.percentual)} · {money(item.valor)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Assembleia {fmtDate(item.assembleia_data)}
                    {item.origem && <> · {item.origem}</>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
