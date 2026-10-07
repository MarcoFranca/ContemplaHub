"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Repeat2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    getUltimoLanceAction,
    repetirUltimoLanceAction,
    type UltimoLanceResumo,
} from "@/app/app/lances/actions/repetir-lance-actions";

const brl = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const pct = (v: number | null | undefined) =>
    v == null ? "—" : `${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

const tipoLabel = (t: string | null | undefined) => {
    const v = (t ?? "").toLowerCase();
    if (v === "fixo") return "Fixo";
    if (v === "livre") return "Livre";
    return v ? v.charAt(0).toUpperCase() + v.slice(1) : "—";
};

const fmtData = (iso: string | null | undefined) => {
    if (!iso) return "—";
    try {
        return new Intl.DateTimeFormat("pt-BR").format(new Date(iso));
    } catch {
        return iso;
    }
};

export function RepetirLanceDialog({
    cotaId,
    competencia,
    assembleiaPrevista,
    compact,
}: {
    cotaId: string;
    competencia: string;
    assembleiaPrevista?: string | null;
    compact?: boolean;
}) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [carregando, setCarregando] = React.useState(false);
    const [salvando, setSalvando] = React.useState(false);
    const [ultimo, setUltimo] = React.useState<UltimoLanceResumo | null>(null);
    const [assembleia, setAssembleia] = React.useState("");

    React.useEffect(() => {
        if (!open) return;
        setUltimo(null);
        setCarregando(true);
        setAssembleia(assembleiaPrevista ?? competencia ?? "");
        getUltimoLanceAction(cotaId)
            .then(setUltimo)
            .catch(() => setUltimo(null))
            .finally(() => setCarregando(false));
    }, [open, cotaId, competencia, assembleiaPrevista]);

    const confirmar = async () => {
        if (!ultimo || !assembleia) return;
        setSalvando(true);
        try {
            const res = await repetirUltimoLanceAction(cotaId, competencia, assembleia);
            if (!res.ok) {
                toast.error(res.error || "Não foi possível repetir o lance.");
                return;
            }
            toast.success("Lance repetido e baixa do mês registrada.");
            setOpen(false);
            router.refresh();
        } finally {
            setSalvando(false);
        }
    };

    const comp = ultimo?.composicao;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size={compact ? "icon" : "sm"}
                    title="Repetir último lance"
                    className="border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
                >
                    <Repeat2 className={compact ? "h-4 w-4" : "mr-1.5 h-3.5 w-3.5"} />
                    {!compact && "Repetir lance"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Repetir último lance</DialogTitle>
                </DialogHeader>

                {carregando ? (
                    <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Buscando último lance...
                    </div>
                ) : !ultimo ? (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-sm text-amber-300">
                        Esta carta ainda não tem um lance registrado para repetir.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-muted-foreground">Último lance</span>
                                <span className="text-xs text-muted-foreground">
                                    {fmtData(ultimo.assembleia_data)}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">{tipoLabel(ultimo.tipo)}</Badge>
                                <Badge variant="outline">{pct(ultimo.percentual)}</Badge>
                                <Badge variant="outline">{brl(ultimo.valor ?? 0)}</Badge>
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">
                            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                                Composição do pagamento
                            </p>
                            <div className="space-y-1">
                                <Linha rotulo="Embutido" valor={comp?.embutido ?? 0} />
                                <Linha rotulo="FGTS" valor={comp?.fgts ?? 0} />
                                <Linha rotulo="Outro recurso" valor={comp?.outro ?? 0} />
                                <Linha rotulo="Recurso próprio" valor={comp?.proprio ?? 0} />
                                <div className="mt-1 flex justify-between border-t border-white/5 pt-1">
                                    <span className="font-medium text-foreground">Total do lance</span>
                                    <span className="font-semibold text-foreground">{brl(ultimo.valor ?? 0)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Data da assembleia</Label>
                            <Input
                                type="date"
                                value={assembleia}
                                onChange={(e) => setAssembleia(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                O lance será registrado na competência atual e o mês ficará baixado.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setOpen(false)} disabled={salvando}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmar}
                                disabled={!assembleia || salvando}
                                className="bg-sky-600 text-white hover:bg-sky-500"
                            >
                                {salvando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Confirmar e repetir
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: number }) {
    return (
        <div className="flex justify-between">
            <span className="text-muted-foreground">{rotulo}</span>
            <span className="text-foreground">{brl(valor)}</span>
        </div>
    );
}
