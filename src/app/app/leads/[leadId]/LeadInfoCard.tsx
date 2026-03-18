// src/app/app/leads/[leadId]/LeadInfoCard.tsx
import {
    CalendarRange,
    Mail,
    Phone,
    Sparkles,
    Target,
    UserRound,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrencyBRL } from "./leadUtils";

type LeadRow = {
    nome?: string | null;
    telefone: string | null;
    email: string | null;
    valor_interesse: number | null;
    prazo_meses: number | null;
};

function InfoItem({
                      icon,
                      label,
                      value,
                  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                {icon}
                {label}
            </div>
            <p className="mt-2 text-sm font-medium text-foreground break-words">
                {value}
            </p>
        </div>
    );
}

export function LeadInfoCard({ lead }: { lead: LeadRow }) {
    const valorInteresse = lead.valor_interesse ?? null;

    return (
        <Card className="border-white/10 bg-white/5">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
            <UserRound className="h-4 w-4 text-emerald-300" />
          </span>
                    Informações do cliente
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid gap-3">
                    <InfoItem
                        icon={<Phone className="h-3.5 w-3.5 text-emerald-300" />}
                        label="Telefone"
                        value={lead.telefone ?? "—"}
                    />

                    <InfoItem
                        icon={<Mail className="h-3.5 w-3.5 text-emerald-300" />}
                        label="Email"
                        value={lead.email ?? "—"}
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                        <InfoItem
                            icon={<Target className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Valor de interesse"
                            value={formatCurrencyBRL(valorInteresse)}
                        />

                        <InfoItem
                            icon={<CalendarRange className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Prazo desejado"
                            value={lead.prazo_meses ? `${lead.prazo_meses} meses` : "—"}
                        />
                    </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
                        <Sparkles className="h-4 w-4" />
                        Estratégia rápida
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-emerald-50/80">
                        Esta área pode servir como bloco de leitura imediata do consultor,
                        destacando conforto de parcela, ticket alvo e próximos passos antes
                        do diagnóstico completo.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}