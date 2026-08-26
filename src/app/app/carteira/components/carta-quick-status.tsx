"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreVertical, Trophy, XCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    contemplarCartaAction,
    cancelarCartaAction,
    reativarCartaAction,
} from "../actions/carta-status";

function hoje() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CartaQuickStatus({ cotaId, situacao }: { cotaId: string; situacao: string | null }) {
    const router = useRouter();
    const [pending, start] = React.useTransition();
    const [dialog, setDialog] = React.useState<null | "contemplar" | "cancelar">(null);
    const [motivo, setMotivo] = React.useState<"sorteio" | "lance" | "outro">("sorteio");
    const [data, setData] = React.useState(hoje());
    const [obs, setObs] = React.useState("");

    const st = (situacao ?? "").toLowerCase();
    const contemplada = st === "contemplada";
    const cancelada = st === "cancelada";

    function run(p: Promise<{ ok: boolean; error?: string }>, sucesso: string) {
        start(async () => {
            const res = await p;
            if (!res.ok) {
                toast.error(res.error || "Falha.");
                return;
            }
            toast.success(sucesso);
            setDialog(null);
            router.refresh();
        });
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-xl border-white/10 bg-white/[0.03]" title="Ações da carta">
                        <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                    {!contemplada ? (
                        <DropdownMenuItem className="gap-2 text-amber-300" onClick={() => setDialog("contemplar")}>
                            <Trophy className="h-3.5 w-3.5" /> Contemplar
                        </DropdownMenuItem>
                    ) : null}
                    {!contemplada && !cancelada ? (
                        <DropdownMenuItem className="gap-2 text-red-300" onClick={() => setDialog("cancelar")}>
                            <XCircle className="h-3.5 w-3.5" /> Cancelar
                        </DropdownMenuItem>
                    ) : null}
                    {contemplada || cancelada ? (
                        <DropdownMenuItem
                            className="gap-2"
                            onClick={() => run(reativarCartaAction(cotaId), "Carta reativada.")}
                        >
                            <RotateCcw className="h-3.5 w-3.5" /> Reativar
                        </DropdownMenuItem>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Contemplar */}
            <Dialog open={dialog === "contemplar"} onOpenChange={(o) => !o && setDialog(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Contemplar carta</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label className="text-xs text-muted-foreground">Motivo</Label>
                            <select
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value as "sorteio" | "lance" | "outro")}
                                className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-2 py-1.5 text-sm"
                            >
                                <option value="sorteio">Sorteio</option>
                                <option value="lance">Lance</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Data da contemplação</Label>
                            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="mt-1" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" disabled={pending} onClick={() => setDialog(null)}>
                            Cancelar
                        </Button>
                        <Button
                            className="gap-1.5 bg-amber-500 text-black hover:bg-amber-400"
                            disabled={pending}
                            onClick={() => run(contemplarCartaAction(cotaId, motivo, data), "Carta contemplada.")}
                        >
                            <Trophy className="h-4 w-4" /> Contemplar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancelar */}
            <Dialog open={dialog === "cancelar"} onOpenChange={(o) => !o && setDialog(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Cancelar carta</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            A carta será marcada como cancelada. Você pode reativá-la depois.
                        </p>
                        <div>
                            <Label className="text-xs text-muted-foreground">Observação (opcional)</Label>
                            <Input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Motivo do cancelamento" className="mt-1" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" disabled={pending} onClick={() => setDialog(null)}>
                            Voltar
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-1.5 border-red-500/30 text-red-300 hover:bg-red-500/10"
                            disabled={pending}
                            onClick={() => run(cancelarCartaAction(cotaId, obs), "Carta cancelada.")}
                        >
                            <XCircle className="h-4 w-4" /> Cancelar carta
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
