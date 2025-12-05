"use client";

import * as React from "react";
import { useOptimistic, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeadCardItem } from "./LeadCardItem";
import { toast } from "sonner";
import { ContractSheet } from "@/components/app/ContractSheet";
import { fireConfetti } from "@/lib/ui/confetti";
import { ColumnHeaderStats } from "@/app/app/leads/ui/ColumnHeaderStats";

// 👇 tipos centralizados
import type {
    Stage,
    LeadCard,
    KanbanMetrics,
} from "@/app/app/leads/types";

type OptimisticAction = { id: string; from: Stage; to: Stage };
export type AdminOption = { id: string; nome: string };

// zona próxima da borda que ativa o scroll e velocidade máx
const EDGE_PX = 96;
const MAX_SPEED = 28;

type Props = {
    initialColumns: Record<Stage, LeadCard[]>;
    stages: Stage[];
    onMove: (leadId: string, to: Stage) => Promise<void>;
    contractOptions: { administradoras: AdminOption[] };
    metrics?: KanbanMetrics | null;
};

const stageLabels: Record<Stage, { label: string; color: string }> = {
    novo: { label: "Novo", color: "bg-emerald-500/20" },
    diagnostico: { label: "Diagnóstico", color: "bg-sky-500/20" },
    proposta: { label: "Proposta", color: "bg-indigo-500/20" },
    negociacao: { label: "Negociação", color: "bg-yellow-500/20" },
    contrato: { label: "Contrato", color: "bg-orange-500/20" },
    ativo: { label: "Ativo", color: "bg-green-600/20" },
    perdido: { label: "Perdido", color: "bg-red-500/20" },
};

export default function KanbanBoard({
                                        initialColumns,
                                        stages,
                                        onMove,
                                        contractOptions,
                                        metrics,
                                    }: Props) {
    const [, start] = useTransition();

    const [columns, setColumns] = useOptimistic<
        Record<Stage, LeadCard[]>,
        OptimisticAction
    >(
        initialColumns,
        (state, action) => {
            if (action.from === action.to) return state;
            const fromList = [...state[action.from]];
            const toList = [...state[action.to]];
            const idx = fromList.findIndex((l) => l.id === action.id);
            if (idx >= 0) {
                const [lead] = fromList.splice(idx, 1);
                const moved: LeadCard = { ...lead, etapa: action.to };
                toList.unshift(moved);
                return { ...state, [action.from]: fromList, [action.to]: toList };
            }
            return state;
        }
    );

    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const draggingRef = React.useRef(false);
    const rafRef = React.useRef<number | null>(null);
    const speedRef = React.useRef(0); // velocidade dinâmica (px/frame)

    // === Drawer de contrato controlado ===
    const [contractLead, setContractLead] = React.useState<{ id: string; nome: string } | null>(null);

    function openContractDrawerFor(id: string, nome: string) {
        setContractLead({ id, nome });
    }

    function closeContractDrawer() {
        setContractLead(null);
    }

    function onDragStart(ev: React.DragEvent, lead: LeadCard) {
        ev.dataTransfer.setData("text/plain", JSON.stringify(lead));
        draggingRef.current = true;
    }

    function onDrop(ev: React.DragEvent, to: Stage) {
        ev.preventDefault();
        draggingRef.current = false;
        stopAutoScroll();
        const raw = ev.dataTransfer.getData("text/plain");
        if (!raw) return;
        try {
            const lead = JSON.parse(raw) as LeadCard;
            const from = lead.etapa;

            if (to === "contrato") {
                openContractDrawerFor(lead.id, lead.nome ?? "Cliente");
                return;
            }

            start(async () => {
                setColumns({ id: lead.id, from, to });
                await onMove(lead.id, to);
                toast.info(`Lead movido para: ${stageLabels[to].label}`);
            });
        } catch {
            // ignore JSON parse error
        }
    }

    // ---- Auto-scroll baseado em dragover global ----
    function stopAutoScroll() {
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        speedRef.current = 0;
    }

    function loop() {
        const el = containerRef.current;
        if (!el || !draggingRef.current) {
            rafRef.current = null;
            return;
        }
        const speed = speedRef.current;
        if (speed !== 0) {
            const max = el.scrollWidth - el.clientWidth;
            const next = Math.min(max, Math.max(0, el.scrollLeft + speed));
            el.scrollLeft = next;
        }
        rafRef.current = requestAnimationFrame(loop);
    }

    React.useEffect(() => {
        function handleDragOver(e: DragEvent) {
            if (!draggingRef.current) return;
            const el = containerRef.current;
            if (!el) return;

            const rect = el.getBoundingClientRect();
            const x = e.clientX;

            const distLeft = Math.max(0, x - rect.left);
            const distRight = Math.max(0, rect.right - x);

            let speed = 0;
            if (distLeft <= EDGE_PX) {
                const pct = 1 - distLeft / EDGE_PX;
                if (el.scrollLeft > 0) speed = -Math.ceil(pct * MAX_SPEED);
            } else if (distRight <= EDGE_PX) {
                const pct = 1 - distRight / EDGE_PX;
                const max = el.scrollWidth - el.clientWidth;
                if (el.scrollLeft < max) speed = Math.ceil(pct * MAX_SPEED);
            }

            speedRef.current = speed;
            if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
            e.preventDefault();
        }

        function handleDragEnd() {
            draggingRef.current = false;
            stopAutoScroll();
        }

        document.addEventListener("dragover", handleDragOver, { passive: false });
        document.addEventListener("dragend", handleDragEnd);
        return () => {
            document.removeEventListener("dragover", handleDragOver as any);
            document.removeEventListener("dragend", handleDragEnd);
            stopAutoScroll();
        };
    }, []);

    return (
        <>
            <div
                ref={containerRef}
                className="relative h-full overflow-x-auto overflow-y-hidden flex flex-nowrap gap-3 md:gap-4 [scrollbar-width:thin] will-change-[scroll-position] bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(16,185,129,0.06),transparent_60%),radial-gradient(1000px_500px_at_90%_110%,rgba(59,130,246,0.05),transparent_60%)] bg-no-repeat"
            >
                {stages.map((s) => (
                    <Card
                        key={s}
                        className="bg-white/5 border-white/10 overflow-hidden flex-none w-[70vw] xs:w-[72vw] sm:w-[260px] md:w-[280px] xl:w-[300px] h-full"
                    >
                        <ColumnHeaderStats
                            stage={s}
                            count={columns[s].length}
                            avgDays={metrics?.avgDays?.[s]}
                            conversion={metrics?.conversion?.[s]}
                            diagCompletionPct={metrics?.diagCompletionPct?.[s]}
                            readinessAvg={metrics?.readinessAvg?.[s]}
                            tFirstContactAvgMin={metrics?.tFirstContactAvgMin?.[s]}
                        />

                        <CardHeader
                            className={`text-sm p-4 text-center font-semibold tracking-wide capitalize ${stageLabels[s].color}`}
                        >
                            <CardTitle className="text-sm font-semibold tracking-wide capitalize">
                                {s}
                            </CardTitle>
                        </CardHeader>

                        <CardContent
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => onDrop(e, s)}
                            className="h-[calc(100%-48px)] overflow-y-auto p-2 md:p-3 space-y-3 [scrollbar-width:thin]"
                        >
                            {columns[s].map((l) => (
                                <LeadCardItem
                                    key={l.id}
                                    lead={l}
                                    onDragStart={onDragStart}
                                />
                            ))}
                            {columns[s].length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Arraste cards para cá.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Drawer de contrato quando soltar em “contrato” */}
            {contractLead && (
                <ContractSheet
                    open={!!contractLead}
                    onOpenChange={(v) => !v && closeContractDrawer()}
                    leadId={contractLead.id}
                    leadName={contractLead.nome}
                    administradoras={contractOptions.administradoras}
                    onSuccess={async () => {
                        toast.success(
                            <span>
                Contrato criado e cliente movido para a Carteira.{" "}
                                <a
                                    href="/app/carteira"
                                    className="underline text-emerald-300 hover:text-emerald-200 ml-1"
                                >
                  Ver Carteira →
                </a>
              </span>
                        );
                        await fireConfetti();
                    }}
                />
            )}
        </>
    );
}
