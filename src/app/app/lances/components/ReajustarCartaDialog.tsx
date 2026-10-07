"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TrendingUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    reajustarCartaAction,
    getReajustesCartaAction,
    type ReajustesResumo,
} from "@/app/app/lances/actions/reajuste-actions";

const brl = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

// Converte texto digitado (reais, formato BR) em número de reais.
function parseReais(s: string): number {
    const raw = (s || "").replace(/[^\d.,]/g, "");
    if (!raw) return 0;
    const normalized = raw.replace(/\./g, "").replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
}

const fmtData = (iso: string) => {
    try {
        return new Intl.DateTimeFormat("pt-BR").format(new Date(iso));
    } catch {
        return iso;
    }
};

export function ReajustarCartaDialog({
    cotaId,
    valorAtual,
    valorParcelaAtual,
}: {
    cotaId: string;
    valorAtual: number;
    valorParcelaAtual: number;
}) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [texto, setTexto] = React.useState("");
    const [salvando, setSalvando] = React.useState(false);
    const [resumo, setResumo] = React.useState<ReajustesResumo | null>(null);

    React.useEffect(() => {
        if (!open) return;
        setTexto("");
        getReajustesCartaAction(cotaId).then(setResumo).catch(() => setResumo(null));
    }, [open, cotaId]);

    const novo = parseReais(texto);
    const valido = novo > 0 && valorAtual > 0;
    const pct = valido ? (novo / valorAtual - 1) * 100 : 0;
    const novaParcela = valido && valorParcelaAtual > 0 ? (valorParcelaAtual * novo) / valorAtual : valorParcelaAtual;

    const aplicar = async () => {
        if (!valido) return;
        setSalvando(true);
        try {
            const res = await reajustarCartaAction(cotaId, novo);
            if (!res.ok) {
                toast.error(res.error || "Não foi possível reajustar.");
                return;
            }
            toast.success(`Carta reajustada (${res.percentual! >= 0 ? "+" : ""}${res.percentual}%).`);
            setOpen(false);
            router.refresh();
        } finally {
            setSalvando(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Reajustar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reajustar valor da carta</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Valor atual</span>
                            <span className="font-semibold text-foreground">{brl(valorAtual)}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                            <span className="text-muted-foreground">Parcela atual</span>
                            <span className="text-foreground">{brl(valorParcelaAtual)}</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Novo valor da carta</Label>
                        <Input
                            inputMode="decimal"
                            placeholder="ex.: 550000 ou 550.000,00"
                            value={texto}
                            onChange={(e) => setTexto(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {valido && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Novo valor</span>
                                <span className="font-semibold text-foreground">{brl(novo)}</span>
                            </div>
                            <div className="mt-1 flex justify-between">
                                <span className="text-muted-foreground">Variação</span>
                                <span className={pct >= 0 ? "font-semibold text-emerald-300" : "font-semibold text-rose-300"}>
                                    {pct >= 0 ? "+" : ""}
                                    {pct.toFixed(2)}%
                                </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                                <span className="text-muted-foreground">Nova parcela (proporcional)</span>
                                <span className="text-foreground">{brl(novaParcela)}</span>
                            </div>
                        </div>
                    )}

                    {/* Histórico / valorização */}
                    {resumo && (
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Inicial {brl(resumo.valorInicial)} → Atual {brl(resumo.valorAtual)}
                                </span>
                                <span className={resumo.valorizacaoPct >= 0 ? "font-semibold text-emerald-300" : "font-semibold text-rose-300"}>
                                    {resumo.valorizacaoPct >= 0 ? "+" : ""}
                                    {resumo.valorizacaoPct.toFixed(2)}%
                                </span>
                            </div>
                            {resumo.reajustes.length > 0 && (
                                <ul className="mt-2 space-y-1 border-t border-white/5 pt-2 text-muted-foreground">
                                    {resumo.reajustes.slice(0, 5).map((r) => (
                                        <li key={r.id} className="flex justify-between">
                                            <span>{fmtData(r.created_at)}</span>
                                            <span>
                                                {brl(Number(r.valor_carta_anterior ?? 0))} → {brl(Number(r.valor_carta_novo))}
                                                {r.percentual != null ? ` (${Number(r.percentual) >= 0 ? "+" : ""}${Number(r.percentual).toFixed(1)}%)` : ""}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={salvando}>
                            Cancelar
                        </Button>
                        <Button onClick={aplicar} disabled={!valido || salvando} className="bg-emerald-600 text-white hover:bg-emerald-500">
                            {salvando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Aplicar reajuste
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
