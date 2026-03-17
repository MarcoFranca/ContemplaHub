import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

type FinancialData = {
    previsto: number;
    disponivel: number;
    pago: number;
    repassePendente: number;
    porAdministradora: Array<{
        label: string;
        value: number;
    }>;
};

function formatBRL(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export function DashboardFinancial({ data }: { data: FinancialData }) {
    const max = Math.max(...data.porAdministradora.map((item) => item.value), 1);

    return (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-5">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Financeiro de comissões</h2>
                <p className="text-sm text-muted-foreground">
                    Previsto, disponível, pago e gargalos de repasse em um único bloco.
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">Previsto</p>
                    <p className="mt-1 text-2xl font-semibold">{formatBRL(data.previsto)}</p>
                </div>

                <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">Disponível</p>
                    <p className="mt-1 text-2xl font-semibold">{formatBRL(data.disponivel)}</p>
                </div>

                <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">Pago</p>
                    <p className="mt-1 text-2xl font-semibold">{formatBRL(data.pago)}</p>
                </div>

                <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">Repasse pendente</p>
                    <p className="mt-1 text-2xl font-semibold">{formatBRL(data.repassePendente)}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Comissão por administradora</p>
                </div>

                <div className="space-y-3">
                    {data.porAdministradora.map((item) => (
                        <div key={item.label} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>{item.label}</span>
                                <span className="text-muted-foreground">{formatBRL(item.value)}</span>
                            </div>

                            <div className="h-2 rounded-full bg-muted">
                                <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{ width: `${(item.value / max) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <Link href="/app/comissoes" className="inline-flex items-center gap-1 text-sm text-primary">
                    Abrir comissões <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}