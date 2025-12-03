// src/app/app/leads/[leadId]/LeadPropostasList.tsx
"use client";

import useSWR from "swr";
import Link from "next/link";
import { FileSignature, Trash2, Ban, Send, CheckCircle2 } from "lucide-react";
import { deleteProposta, updatePropostaStatus } from "@/app/app/leads/actions.propostas";
import { toast } from "sonner";

async function fetcher(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao carregar propostas");
    return res.json();
}

const statusLabel: Record<string, string> = {
    rascunho: "Rascunho",
    enviada: "Enviada",
    aprovada: "Aprovada",
    recusada: "Recusada",
    inativa: "Inativa",
};

const statusClass: Record<string, string> = {
    rascunho: "bg-slate-800 text-slate-200 border-slate-600",
    enviada: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
    aprovada: "bg-blue-900/40 text-blue-300 border-blue-700",
    recusada: "bg-red-900/40 text-red-300 border-red-700",
    inativa: "bg-zinc-900/60 text-zinc-300 border-zinc-700",
};

// tipinho mínimo pra evitar "any"
type LeadProposalListItem = {
    id: string;
    titulo: string | null;
    campanha: string | null;
    status: string | null;
    created_at: string | null;
    public_hash: string | null;
};

export function LeadPropostasList({ leadId }: { leadId: string }) {
    const { data, error, isLoading, mutate } = useSWR<LeadProposalListItem[]>(
        `/api/lead-propostas/lead/${leadId}`,
        fetcher
    );

    async function handleStatus(id: string, status: string) {
        try {
            await updatePropostaStatus(id, status);
            toast.success("Status da proposta atualizado");
            mutate(); // recarrega a lista
        } catch (err) {
            console.error(err);
            toast.error("Erro ao atualizar status da proposta");
        }
    }

    async function handleDelete(id: string) {
        const ok = window.confirm(
            "Tem certeza que deseja remover esta proposta? Essa ação não pode ser desfeita."
        );
        if (!ok) return;

        try {
            await deleteProposta(id);
            toast.success("Proposta removida");
            mutate(); // recarrega a lista
        } catch (err) {
            console.error(err);
            toast.error("Erro ao remover proposta");
        }
    }

    if (isLoading) {
        return <p className="text-xs text-muted-foreground">Carregando propostas...</p>;
    }

    if (error) {
        return <p className="text-xs text-red-500">Erro ao carregar propostas.</p>;
    }

    if (!data || data.length === 0) {
        return (
            <p className="text-xs text-muted-foreground">
                Nenhuma proposta criada ainda para este lead.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {data.map((p) => {
                const status = p.status ?? "rascunho";
                const createdAt = p.created_at
                    ? new Date(p.created_at).toLocaleString("pt-BR")
                    : null;

                return (
                    <div
                        key={p.id}
                        className="flex justify-between items-center gap-3 p-3 rounded-lg border bg-card/80 hover:bg-accent/60 transition"
                    >
                        <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">
                  {p.titulo ?? "Proposta sem título"}
                </span>
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border ${
                                        statusClass[status] ?? statusClass.rascunho
                                    }`}
                                >
                  {statusLabel[status] ?? status}
                </span>
                            </div>

                            <span className="text-[11px] text-muted-foreground truncate">
                {p.campanha ?? "—"}
              </span>

                            {createdAt && (
                                <span className="text-[10px] text-muted-foreground">
                  Criada em {createdAt}
                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {/* Abrir visão do cliente */}
                            {p.public_hash && (
                                <Link
                                    href={`/propostas/${p.public_hash}`}
                                    className="text-xs inline-flex items-center gap-1 text-emerald-400 hover:underline"
                                >
                                    <FileSignature className="h-3.5 w-3.5" />
                                    Ver como cliente
                                </Link>
                            )}

                            {/* Ações rápidas de status */}
                            <button
                                type="button"
                                onClick={() => handleStatus(p.id, "enviada")}
                                className="text-[11px] inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200"
                            >
                                <Send className="h-3 w-3" />
                                Enviar
                            </button>

                            {/* 🔥 Nova rota interna da proposta */}
                            {p.public_hash && (
                                <Link
                                    href={`/app/leads/${leadId}/propostas/${p.id}`}
                                    className="text-[11px] text-sky-300 hover:text-sky-200"
                                >
                                    Detalhes internos
                                </Link>
                            )}

                            <button
                                type="button"
                                onClick={() => handleStatus(p.id, "aprovada")}
                                className="text-[11px] inline-flex items-center gap-1 text-blue-300 hover:text-blue-200"
                            >
                                <CheckCircle2 className="h-3 w-3" />
                                Aprovada
                            </button>

                            <button
                                type="button"
                                onClick={() => handleStatus(p.id, "inativa")}
                                className="text-[11px] inline-flex items-center gap-1 text-amber-300 hover:text-amber-200"
                            >
                                <Ban className="h-3 w-3" />
                                Inativar
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDelete(p.id)}
                                className="text-[11px] inline-flex items-center gap-1 text-red-400 hover:text-red-300"
                            >
                                <Trash2 className="h-3 w-3" />
                                Remover
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
