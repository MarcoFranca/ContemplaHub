"use client";

import { useOptimistic, useTransition, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createContractFromLead, type AdminOption, type GrupoOption } from "../actions";

type Stage =
    | "novo"
    | "diagnostico"
    | "proposta"
    | "negociacao"
    | "fechamento"
    | "ativo"
    | "perdido";

export type Lead = {
    id: string;
    nome: string | null;
    etapa: Stage;
    telefone?: string | null;
    email?: string | null;
    origem?: string | null;
    utm_source?: string | null;
    valor_interesse?: string | null;
    created_at?: string;
};

type OptimisticAction = { id: string; from: Stage; to: Stage };

export default function KanbanBoard({
                                        initialColumns,
                                        stages,
                                        onMove,
                                        contractOptions,
                                    }: {
    initialColumns: Record<Stage, Lead[]>;
    stages: Stage[];
    onMove: (leadId: string, to: Stage) => Promise<void>;
    contractOptions: { administradoras: AdminOption[]; grupos: GrupoOption[] };
}) {
    const [isPending, start] = useTransition();

    const [columns, setColumns] = useOptimistic<Record<Stage, Lead[]>, OptimisticAction>(
        initialColumns,
        (state, action) => {
            if (action.from === action.to) return state;
            const fromList = [...state[action.from]];
            const toList = [...state[action.to]];
            const idx = fromList.findIndex((l) => l.id === action.id);
            if (idx >= 0) {
                const [lead] = fromList.splice(idx, 1);
                const moved: Lead = { ...lead, etapa: action.to };
                toList.unshift(moved);
                return { ...state, [action.from]: fromList, [action.to]: toList };
            }
            return state;
        }
    );

    function onDragStart(ev: React.DragEvent, lead: Lead) {
        ev.dataTransfer.setData("text/plain", JSON.stringify(lead));
    }

    function onDrop(ev: React.DragEvent, to: Stage) {
        ev.preventDefault();
        const raw = ev.dataTransfer.getData("text/plain");
        if (!raw) return;
        try {
            const lead = JSON.parse(raw) as Lead;
            const from = lead.etapa;
            start(async () => {
                setColumns({ id: lead.id, from, to });
                await onMove(lead.id, to);
            });
        } catch {
            // ignore parse errors
        }
    }

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 xl:grid-cols-7">
            {stages.map((s) => (
                <Card key={s} className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-sm capitalize">{s}</CardTitle>
                    </CardHeader>
                    <CardContent
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => onDrop(e, s)}
                        className="min-h-[60vh] space-y-2"
                    >
                        {columns[s].map((l) => (
                            <div
                                key={l.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, l)}
                                className="rounded-lg border border-white/10 bg-white/10 p-3 cursor-grab active:cursor-grabbing"
                            >
                                <p className="font-medium">{l.nome ?? "—"}</p>
                                <p className="text-xs text-muted-foreground">
                                    {l.telefone ?? l.email ?? "—"} • {l.origem ?? l.utm_source ?? "site"}
                                </p>

                                {l.etapa === "fechamento" && (
                                    <div className="mt-2">
                                        <CreateContractDialog
                                            leadId={l.id}
                                            leadName={l.nome ?? "Cliente"}
                                            administradoras={contractOptions.administradoras}
                                            grupos={contractOptions.grupos}
                                            onSuccess={() => {
                                                toast.success("Contrato criado. Cliente movido para Carteira.");
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                        {columns[s].length === 0 && (
                            <p className="text-xs text-muted-foreground">Arraste cards para cá.</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ============== Modal CreateContractDialog ===================

function CreateContractDialog({
                                  leadId,
                                  leadName,
                                  administradoras,
                                  grupos,
                                  onSuccess,
                              }: {
    leadId: string;
    leadName: string;
    administradoras: AdminOption[];
    grupos: GrupoOption[];
    onSuccess?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [admId, setAdmId] = useState<string>("");

    const gruposFiltrados = useMemo(
        () => grupos.filter((g) => g.administradoraId === admId),
        [grupos, admId]
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Gerar contrato</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Novo contrato — {leadName}</DialogTitle>
                </DialogHeader>

                {/* IMPORTANTE:
            - action server vai processar/validar de verdade
            - aqui só evitamos submit vazio e damos feedback */}
                <form
                    action={createContractFromLead} // agora retorna Promise<void>
                    onSubmit={(e) => {
                        const form = e.currentTarget as HTMLFormElement;
                        const fd = new FormData(form);
                        if (!fd.get("administradoraId") || !fd.get("grupoId") || !fd.get("valorCarta")) {
                            e.preventDefault();
                            return;
                        }
                        setOpen(false);
                        toast.loading("Criando contrato…");
                        onSuccess?.();
                    }}
                    className="space-y-3"
                >


                    <input type="hidden" name="leadId" value={leadId}/>

                    <div className="grid gap-2">
                        <Label>Administradora</Label>
                        <select
                            name="administradoraId"
                            value={admId}
                            onChange={(e) => setAdmId(e.target.value)}
                            className="h-9 rounded-md bg-background border px-2 text-sm"
                            required
                        >
                            <option value="">Selecione…</option>
                            {administradoras.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Grupo</Label>
                        <select
                            name="grupoId"
                            className="h-9 rounded-md bg-background border px-2 text-sm"
                            required
                        >
                            <option value="">Selecione…</option>
                            {gruposFiltrados.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.codigo ?? g.id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Produto</Label>
                        <select name="produto" defaultValue="imobiliario"
                                className="h-9 rounded-md bg-background border px-2 text-sm">
                            <option value="imobiliario">Imobiliário</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Valor da carta</Label>
                        <Input name="valorCarta" placeholder="Ex.: 350.000,00" required/>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label>Data de adesão (opcional)</Label>
                            <Input type="date" name="dataAdesao"/>
                        </div>
                        <div className="grid gap-2">
                            <Label>Data de assinatura (opcional)</Label>
                            <Input type="date" name="dataAssinatura"/>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Nº do contrato (opcional)</Label>
                        <Input name="numero" placeholder="Ex.: 2025-000123"/>
                    </div>

                    <DialogFooter>
                        <Button type="submit">Criar contrato</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
