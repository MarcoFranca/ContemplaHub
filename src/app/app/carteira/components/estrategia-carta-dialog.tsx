"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { updateEstrategiaCartaAction } from "../actions/estrategia";

type Props = {
    cotaId: string;
    objetivo: string | null;
    prazoLance: string | null;
    valorLance: number | null;
    embutidoPct: number | null;
    observacao: string | null;
};

function num(v: string): number | null {
    if (v.trim() === "") return null;
    const n = Number(v.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
}

export function EstrategiaCartaDialog(props: Props) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [pending, start] = React.useTransition();

    const [objetivo, setObjetivo] = React.useState(props.objetivo ?? "");
    const [prazo, setPrazo] = React.useState(props.prazoLance ?? "");
    const [valor, setValor] = React.useState(props.valorLance != null ? String(props.valorLance) : "");
    const [embutido, setEmbutido] = React.useState(props.embutidoPct != null ? String(props.embutidoPct) : "");
    const [obs, setObs] = React.useState(props.observacao ?? "");

    const temEstrategia =
        !!props.objetivo || !!props.prazoLance || props.valorLance != null || props.embutidoPct != null || !!props.observacao;

    React.useEffect(() => {
        if (!open) return;
        setObjetivo(props.objetivo ?? "");
        setPrazo(props.prazoLance ?? "");
        setValor(props.valorLance != null ? String(props.valorLance) : "");
        setEmbutido(props.embutidoPct != null ? String(props.embutidoPct) : "");
        setObs(props.observacao ?? "");
    }, [open, props]);

    function salvar() {
        start(async () => {
            const res = await updateEstrategiaCartaAction(props.cotaId, {
                estrategia_objetivo: objetivo.trim() || null,
                estrategia_prazo_lance: prazo.trim() || null,
                estrategia_valor_lance: num(valor),
                estrategia_embutido_pct: num(embutido),
                estrategia_observacao: obs.trim() || null,
            });
            if (!res.ok) {
                toast.error(res.error || "Falha ao salvar.");
                return;
            }
            toast.success("Estratégia salva.");
            setOpen(false);
            router.refresh();
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className={`h-8 rounded-xl border-white/10 ${temEstrategia ? "bg-emerald-500/10 text-emerald-300" : "bg-white/[0.03]"}`}
                    title="Estratégia da carta"
                >
                    <Target className="mr-1.5 h-3.5 w-3.5" />
                    {temEstrategia ? "Estratégia" : "Definir estratégia"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Estratégia da carta</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs text-muted-foreground">Objetivo / uso</Label>
                        <Input
                            value={objetivo}
                            onChange={(e) => setObjetivo(e.target.value)}
                            placeholder="Ex.: comprar imóvel para alugar"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Prazo para dar lance</Label>
                        <Input
                            value={prazo}
                            onChange={(e) => setPrazo(e.target.value)}
                            placeholder="Ex.: esperar 1 ano, próxima assembleia"
                            className="mt-1"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs text-muted-foreground">Reserva para lance (R$)</Label>
                            <Input
                                inputMode="numeric"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                placeholder="150000"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Embutido planejado (%)</Label>
                            <Input
                                inputMode="numeric"
                                value={embutido}
                                onChange={(e) => setEmbutido(e.target.value)}
                                placeholder="40"
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Observação</Label>
                        <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={3} className="mt-1" placeholder="Detalhes da estratégia combinada com o cliente" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
                        Cancelar
                    </Button>
                    <Button onClick={salvar} disabled={pending}>
                        {pending ? "Salvando..." : "Salvar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
