// src/app/app/leads/[leadId]/LeadPropostasList.tsx
"use client";

import useSWR from "swr";
import Link from "next/link";
import {
    FileSignature,
    Trash2,
    Ban,
    Send,
    CheckCircle2,
    LayoutTemplate,
    ExternalLink,
} from "lucide-react";
import {
    deleteProposta,
    updatePropostaStatus,
} from "@/app/app/leads/actions.propostas";
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
    rascunho: "bg-slate-900/70 text-slate-200 border-slate-600",
    enviada: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
    aprovada: "bg-blue-900/40 text-blue-300 border-blue-700",
    recusada: "bg-red-900/40 text-red-300 border-red-700",
    inativa: "bg-zinc-900/60 text-zinc-300 border-zinc-700",
};

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
        fetcher,
    );

    async function handleStatus(id: string, status: string) {
        try {
            await updatePropostaStatus(id, status);
            toast.success("Status da proposta atualizado");
            mutate();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao atualizar status da proposta");
        }
    }

    async function handleDelete(id: string) {
        const ok = window.confirm(
            "Tem certeza que deseja remover esta proposta? Essa ação não pode ser desfeita.",
        );
        if (!ok) return;

        try {
            await deleteProposta(id);
            toast.success("Proposta removida");
            mutate();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao remover proposta");
        }
    }

    if (isLoading) {
        return (
            <p className="text-xs text-muted-foreground">Carregando propostas...</p>
        );
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
                        className="rounded-lg border border-slate-800/80 bg-slate-950/70
                       hover:border-emerald-500/50 hover:bg-slate-900/80
                       transition-colors px-3 py-3 space-y-2"
                    >
                        {/* Linha 1: título + status + campanha + data */}
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="font-medium text-sm truncate max-w-[260px]">
                {p.titulo ?? "Proposta sem título"}
              </span>

                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border
                            ${statusClass[status] ?? statusClass.rascunho}`}
                            >
                {statusLabel[status] ?? status}
              </span>

                            <span className="text-[11px] text-slate-400 truncate">
                {p.campanha ?? "—"}
              </span>

                            {createdAt && (
                                <span className="ml-auto text-[10px] text-slate-500">
                  Criada em {createdAt}
                </span>
                            )}
                        </div>

                        {/* Linha 2: ações - com wrap para não empurrar o grid */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            {/* Grupo 1: navegação */}
                            <div className="flex flex-wrap items-center gap-2">
                                {p.public_hash && (
                                    <Link
                                        href={`/propostas/${p.public_hash}`}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full
                               bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        Ver como cliente
                                    </Link>
                                )}

                                {p.public_hash && (
                                    <Link
                                        href={`/app/leads/${leadId}/propostas/${p.id}`}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full
                               bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
                                    >
                                        <LayoutTemplate className="h-3 w-3" />
                                        Detalhes internos
                                    </Link>
                                )}
                            </div>

                            {/* separador flexível */}
                            <div className="flex-1" />

                            {/* Grupo 2: ações de status */}
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleStatus(p.id, "enviada")}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full
                             bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                >
                                    <Send className="h-3 w-3" />
                                    Enviar
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleStatus(p.id, "aprovada")}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full
                             bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                                >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Aprovada
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleStatus(p.id, "inativa")}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full
                             bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                >
                                    <Ban className="h-3 w-3" />
                                    Inativar
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(p.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full
                             bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Remover
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
