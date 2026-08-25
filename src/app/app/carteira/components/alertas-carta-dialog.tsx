"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, BellRing, Plus, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    type CotaAlerta,
    listAlertasCartaAction,
    createAlertaAction,
    updateAlertaStatusAction,
} from "../actions/alertas";

function hoje() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmt(d: string) {
    const [y, m, dd] = d.slice(0, 10).split("-");
    return `${dd}/${m}/${y}`;
}

type Props = {
    cotaId: string;
    leadId: string | null;
    pendentes: number;
    proximaData: string | null;
};

export function AlertasCartaDialog({ cotaId, leadId, pendentes, proximaData }: Props) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [pending, start] = React.useTransition();
    const [alertas, setAlertas] = React.useState<CotaAlerta[]>([]);
    const [data, setData] = React.useState("");
    const [msg, setMsg] = React.useState("");

    const today = hoje();
    const vencido = proximaData != null && proximaData <= today;
    const cor = pendentes === 0
        ? "border-white/10 bg-white/[0.03] text-muted-foreground"
        : vencido
            ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
            : "border-sky-500/30 bg-sky-500/10 text-sky-300";

    function carregar() {
        start(async () => {
            setAlertas(await listAlertasCartaAction(cotaId));
        });
    }

    React.useEffect(() => {
        if (open) carregar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function criar() {
        if (!data || !msg.trim()) {
            toast.error("Informe data e mensagem.");
            return;
        }
        start(async () => {
            const res = await createAlertaAction({ cotaId, leadId, data, mensagem: msg });
            if (!res.ok) {
                toast.error(res.error || "Falha ao criar.");
                return;
            }
            setData("");
            setMsg("");
            toast.success("Alerta criado.");
            setAlertas(await listAlertasCartaAction(cotaId));
            router.refresh();
        });
    }

    function setStatus(id: string, status: "concluido" | "cancelado") {
        start(async () => {
            const res = await updateAlertaStatusAction(id, status);
            if (!res.ok) {
                toast.error(res.error || "Falha.");
                return;
            }
            setAlertas(await listAlertasCartaAction(cotaId));
            router.refresh();
        });
    }

    const pendentesLista = alertas.filter((a) => a.status === "pendente");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="outline" className={`relative h-8 w-8 rounded-xl ${cor}`} title="Alertas da carta">
                    {vencido ? <BellRing className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                    {pendentes > 0 ? (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-black">
                            {pendentes}
                        </span>
                    ) : null}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Alertas da carta</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    {/* novo alerta */}
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                        <div className="flex gap-2">
                            <div>
                                <Label className="text-xs text-muted-foreground">Data</Label>
                                <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="mt-1" />
                            </div>
                            <div className="flex-1">
                                <Label className="text-xs text-muted-foreground">Lembrete</Label>
                                <Input
                                    value={msg}
                                    onChange={(e) => setMsg(e.target.value)}
                                    placeholder="Ex.: dar lance fixo"
                                    className="mt-1"
                                    onKeyDown={(e) => e.key === "Enter" && criar()}
                                />
                            </div>
                        </div>
                        <Button size="sm" className="mt-2 w-full gap-1.5" disabled={pending} onClick={criar}>
                            <Plus className="h-4 w-4" /> Adicionar alerta
                        </Button>
                    </div>

                    {/* lista */}
                    <div className="space-y-1.5">
                        {pendentesLista.length === 0 ? (
                            <p className="py-2 text-center text-sm text-muted-foreground">Nenhum alerta pendente.</p>
                        ) : (
                            pendentesLista.map((a) => {
                                const due = a.data <= today;
                                return (
                                    <div
                                        key={a.id}
                                        className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs ${due ? "border-amber-500/30 bg-amber-500/10" : "border-white/10"}`}
                                    >
                                        <span className="min-w-0">
                                            <span className={`font-medium ${due ? "text-amber-300" : "text-foreground"}`}>{fmt(a.data)}</span>{" "}
                                            <span className="text-muted-foreground">· {a.mensagem}</span>
                                        </span>
                                        <span className="flex shrink-0 gap-1">
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-300" title="Concluir" disabled={pending} onClick={() => setStatus(a.id, "concluido")}>
                                                <Check className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-red-300" title="Cancelar" disabled={pending} onClick={() => setStatus(a.id, "cancelado")}>
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
