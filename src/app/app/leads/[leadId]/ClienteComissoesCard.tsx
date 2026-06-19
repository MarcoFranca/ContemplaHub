import Link from "next/link";
import { ArrowRight, CircleDollarSign } from "lucide-react";
import { formatCurrencyBRL } from "./leadUtils";

export type ComissoesResumo = {
    previsto: number;
    disponivel: number;
    pago: number;
    repassePendente: number;
    totalLancamentos: number;
};

export function ClienteComissoesCard({ resumo, leadId }: { resumo: ComissoesResumo; leadId: string }) {
    const tiles = [
        { label: "Previsto", value: resumo.previsto, cls: "text-foreground" },
        { label: "Disponível", value: resumo.disponivel, cls: "text-sky-300" },
        { label: "Pago", value: resumo.pago, cls: "text-emerald-300" },
        { label: "Repasse pendente", value: resumo.repassePendente, cls: "text-amber-300" },
    ];

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h3 className="inline-flex items-center gap-2 text-base font-semibold">
                    <CircleDollarSign className="h-4 w-4 text-emerald-400" />
                    Comissões do cliente
                </h3>
                <Link
                    href={`/app/leads/${leadId}/financeiro`}
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                >
                    Ver financeiro <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            {resumo.totalLancamentos === 0 ? (
                <p className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
                    Nenhum lançamento de comissão gerado para as cartas deste cliente.
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {tiles.map((t) => (
                        <div key={t.label} className="rounded-xl border border-white/10 bg-black/15 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t.label}</p>
                            <p className={`mt-1 text-base font-semibold ${t.cls}`}>{formatCurrencyBRL(t.value)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
