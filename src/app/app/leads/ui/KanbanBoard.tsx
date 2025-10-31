// src/app/app/leads/ui/KanbanBoard.tsx
"use client";

import { useOptimistic, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Stage = "novo" | "diagnostico" | "proposta" | "negociacao" | "fechamento" | "ativo" | "perdido";

type Lead = {
    id: string; nome: string; etapa: Stage;
    telefone?: string; email?: string;
    origem?: string; utm_source?: string;
    valor_interesse?: string;
    created_at?: string;
};

export default function KanbanBoard({
                                        initialColumns,
                                        stages,
                                        onMove,
                                    }: {
    initialColumns: Record<Stage, Lead[]>;
    stages: Stage[];
    onMove: (leadId: string, to: Stage) => Promise<void>;
}) {
    const [isPending, start] = useTransition();
    const [columns, setColumns] = useOptimistic(initialColumns, (state, action: { id: string; from: Stage; to: Stage }) => {
        if (action.from === action.to) return state;
        const fromList = [...state[action.from]];
        const toList = [...state[action.to]];
        const idx = fromList.findIndex(l => l.id === action.id);
        if (idx >= 0) {
            const [lead] = fromList.splice(idx, 1);
            lead.etapa = action.to;
            toList.unshift(lead);
            return { ...state, [action.from]: fromList, [action.to]: toList };
        }
        return state;
    });

    function onDragStart(ev: React.DragEvent, lead: Lead) {
        ev.dataTransfer.setData("text/plain", JSON.stringify(lead));
    }

    function onDrop(ev: React.DragEvent, to: Stage) {
        ev.preventDefault();
        try {
            const lead: Lead = JSON.parse(ev.dataTransfer.getData("text/plain"));
            const from = lead.etapa;
            start(async () => {
                setColumns({ id: lead.id, from, to } as any);
                await onMove(lead.id, to);
            });
        } catch {}
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
                                <p className="font-medium">{l.nome}</p>
                                <p className="text-xs text-muted-foreground">
                                    {l.telefone ?? l.email ?? "—"} • {l.origem ?? l.utm_source ?? "site"}
                                </p>
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
