// src/app/app/leads/[leadId]/LeadInfoCard.tsx
import { Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrencyBRL } from "./leadUtils";

type LeadRow = {
    telefone: string | null;
    email: string | null;
    valor_interesse: number | null;
    prazo_meses: number | null;
};

export function LeadInfoCard({ lead }: { lead: LeadRow }) {
    const valorInteresse = lead.valor_interesse ?? null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">
                    Informações do cliente
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Telefone
                    </span>
                    <p>{lead.telefone ?? "—"}</p>
                </div>

                <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Email
                    </span>
                    <p>{lead.email ?? "—"}</p>
                </div>

                <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Valor de interesse
                    </span>
                    <p>{formatCurrencyBRL(valorInteresse)}</p>
                </div>

                <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Prazo desejado
                    </span>
                    <p>{lead.prazo_meses ? `${lead.prazo_meses} meses` : "—"}</p>
                </div>

                <Separator className="my-4" />

                <CardTitle className="text-xs flex items-center gap-1 text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    Estratégia rápida
                </CardTitle>
                <p className="text-muted-foreground text-xs">
                    Em breve esta seção será ligada ao motor de estratégias automáticas
                    (lances, combinações de cartas e recomendações).
                </p>
            </CardContent>
        </Card>
    );
}
