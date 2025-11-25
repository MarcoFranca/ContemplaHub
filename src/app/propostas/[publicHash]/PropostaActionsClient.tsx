// src/app/propostas/[publicHash]/PropostaActionsClient.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    updatePropostaStatus,
    inativarProposta,
    deleteProposta,
} from "@/app/app/leads/actions.propostas";

export function PropostaActionsClient({
                                          propostaId,
                                          currentStatus,
                                      }: {
    propostaId: string;
    currentStatus?: string;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const disabled = isPending;

    function changeStatus(status: string) {
        startTransition(async () => {
            try {
                await updatePropostaStatus(propostaId, status);
                toast.success("Status atualizado");
                router.refresh(); // recarrega os dados da página
            } catch (e) {
                console.error(e);
                toast.error("Falha ao atualizar status");
            }
        });
    }

    function handleInativar() {
        startTransition(async () => {
            try {
                await inativarProposta(propostaId);
                toast.success("Proposta inativada");
                router.refresh();
            } catch (e) {
                console.error(e);
                toast.error("Falha ao inativar proposta");
            }
        });
    }

    function handleDelete() {
        const ok = window.confirm(
            "Tem certeza que deseja deletar esta proposta? Esta ação é irreversível."
        );
        if (!ok) return;

        startTransition(async () => {
            try {
                await deleteProposta(propostaId);
                toast.success("Proposta removida");
                // aqui você pode redirecionar pro lead depois
                router.push("/app/leads");
            } catch (e) {
                console.error(e);
                toast.error("Erro ao deletar proposta");
            }
        });
    }

    return (
        <div className="flex flex-wrap gap-2 mt-6 text-xs">
            <button
                onClick={() => changeStatus("enviada")}
                disabled={disabled}
                className="px-3 py-2 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60"
            >
                Marcar enviada
            </button>

            <button
                onClick={() => changeStatus("aprovada")}
                disabled={disabled}
                className="px-3 py-2 rounded bg-blue-700 hover:bg-blue-600 disabled:opacity-60"
            >
                Marcar aprovada
            </button>

            <button
                onClick={handleInativar}
                disabled={disabled}
                className="px-3 py-2 rounded bg-yellow-700 hover:bg-yellow-600 disabled:opacity-60"
            >
                Inativar
            </button>

            <button
                onClick={handleDelete}
                disabled={disabled}
                className="px-3 py-2 rounded bg-red-700 hover:bg-red-600 disabled:opacity-60"
            >
                Deletar
            </button>
        </div>
    );
}
