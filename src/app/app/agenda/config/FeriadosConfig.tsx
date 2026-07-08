"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarOff, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    type FeriadoCustom,
    addFeriadoCustomAction,
    deleteFeriadoCustomAction,
} from "../actions";

function fmtData(iso: string) {
    const [y, m, d] = iso.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
}

export function FeriadosConfig({ initial }: { initial: FeriadoCustom[] }) {
    const router = useRouter();
    const [pending, start] = React.useTransition();
    const [data, setData] = React.useState("");
    const [nome, setNome] = React.useState("");
    const [uf, setUf] = React.useState("");

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
                <CalendarOff className="h-4 w-4 text-amber-400" /> Feriados estaduais/municipais
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
                Os feriados nacionais já são reconhecidos automaticamente. Cadastre aqui os estaduais e municipais. Todos bloqueiam o dia para agendamento.
            </p>

            {initial.length ? (
                <div className="mt-3 space-y-1">
                    {initial.map((f) => (
                        <div key={f.id} className="flex items-center justify-between rounded-md border border-white/10 px-2.5 py-1.5 text-xs">
                            <span>
                                {fmtData(f.data)} • {f.nome}
                                {f.uf ? ` (${f.uf})` : ""}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-300"
                                disabled={pending}
                                onClick={() =>
                                    start(async () => {
                                        const res = await deleteFeriadoCustomAction(f.id);
                                        if (!res.ok) {
                                            toast.error(res.error || "Falha.");
                                            return;
                                        }
                                        router.refresh();
                                    })
                                }
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-end gap-2">
                <div>
                    <Label className="text-xs text-muted-foreground">Data</Label>
                    <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="mt-1" />
                </div>
                <div className="flex-1 min-w-[160px]">
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <Input placeholder="Ex.: Aniversário da cidade" value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1" />
                </div>
                <div className="w-20">
                    <Label className="text-xs text-muted-foreground">UF</Label>
                    <Input placeholder="SP" maxLength={2} value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} className="mt-1" />
                </div>
                <Button
                    variant="outline"
                    className="gap-1.5"
                    disabled={pending}
                    onClick={() =>
                        start(async () => {
                            const res = await addFeriadoCustomAction(data, nome, uf);
                            if (!res.ok) {
                                toast.error(res.error || "Falha.");
                                return;
                            }
                            setData("");
                            setNome("");
                            setUf("");
                            toast.success("Feriado adicionado.");
                            router.refresh();
                        })
                    }
                >
                    <Plus className="h-4 w-4" /> Adicionar
                </Button>
            </div>
        </div>
    );
}
