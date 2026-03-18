"use client";

import useSWR from "swr";
import Link from "next/link";
import {
    CheckCircle2,
    ExternalLink,
    FileSignature,
    LayoutTemplate,
    Loader2,
    Ban,
    Send,
    Trash2,
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

function ActionChip({
                        onClick,
                        className,
                        icon,
                        children,
                    }: {
    onClick?: () => void;
    className: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition ${className}`}
        >
            {icon}
            {children}
        </button>
    );
}

export function LeadPropostasList({ leadId }: { leadId: string }) {
    const { data, error, isLoading, mutate } = useSWR<LeadProposalListItem[]>(
        `/api/lead-propostas/lead/${leadId}`,
        fetcher
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
            "Tem certeza que deseja remover esta proposta? Essa ação não pode ser desfeita."
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
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando propostas...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300">
                Erro ao carregar propostas.
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-xs text-muted-foreground">
                Nenhuma proposta criada ainda para este lead.
            </div>
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
                        className="rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-emerald-400/20 hover:bg-white/5"
                    >
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15">
                      <FileSignature className="h-4 w-4 text-emerald-300" />
                    </span>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-foreground">
                                                {p.titulo ?? "Proposta sem título"}
                                            </p>

                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 ${statusClass[status] ?? statusClass.rascunho}`}
                        >
                          {statusLabel[status] ?? status}
                        </span>

                                                <span className="truncate">
                          Campanha: {p.campanha ?? "—"}
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {createdAt && (
                                    <div className="text-[10px] text-slate-500 lg:text-right">
                                        Criada em {createdAt}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
                                <div className="flex flex-wrap items-center gap-2">
                                    {p.public_hash && (
                                        <Link
                                            href={`/propostas/${p.public_hash}`}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300 transition hover:bg-emerald-500/20"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            Ver como cliente
                                        </Link>
                                    )}

                                    <Link
                                        href={`/app/leads/${leadId}/propostas/${p.id}`}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] text-sky-300 transition hover:bg-sky-500/20"
                                    >
                                        <LayoutTemplate className="h-3 w-3" />
                                        Detalhes internos
                                    </Link>
                                </div>

                                <div className="hidden xl:block xl:flex-1" />

                                <div className="flex flex-wrap items-center gap-2">
                                    <ActionChip
                                        onClick={() => handleStatus(p.id, "enviada")}
                                        className="bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                        icon={<Send className="h-3 w-3" />}
                                    >
                                        Enviar
                                    </ActionChip>

                                    <ActionChip
                                        onClick={() => handleStatus(p.id, "aprovada")}
                                        className="bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                                        icon={<CheckCircle2 className="h-3 w-3" />}
                                    >
                                        Aprovada
                                    </ActionChip>

                                    <ActionChip
                                        onClick={() => handleStatus(p.id, "inativa")}
                                        className="bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                        icon={<Ban className="h-3 w-3" />}
                                    >
                                        Inativar
                                    </ActionChip>

                                    <ActionChip
                                        onClick={() => handleDelete(p.id)}
                                        className="bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                        icon={<Trash2 className="h-3 w-3" />}
                                    >
                                        Remover
                                    </ActionChip>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}