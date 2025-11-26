// src/app/app/leads/ui/DeleteLeadButton.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { deleteLead } from "@/app/app/leads/actions";

export function DeleteLeadButton({
                                     leadId,
                                     leadName,
                                 }: {
    leadId: string;
    leadName?: string | null;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        startTransition(async () => {
            try {
                await deleteLead(leadId);
                toast.success("Lead deletado", {
                    description:
                        "O lead e todos os dados relacionados foram removidos do sistema.",
                });
                router.refresh();
            } catch (e) {
                console.error(e);
                toast.error("Erro ao deletar lead", {
                    description:
                        "Não foi possível excluir o lead. Tente novamente em instantes.",
                });
            }
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md border border-red-500/40 bg-red-500/5 px-2 py-1 text-[11px] text-red-300 hover:bg-red-500/10"
                >
                    <Trash2 className="h-3 w-3" />
                    <span>Excluir</span>
                </button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-slate-950 border border-red-500/40">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-300">
                        Excluir lead definitivamente?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-300 text-sm">
                        Esta ação não poderá ser desfeita. O lead{" "}
                        <span className="font-semibold">
              {leadName || "sem nome"}
            </span>{" "}
                        e <strong>tudo relacionado a ele</strong> será removido:
                        <br />
                        <br />
                        • Diagnósticos<br />
                        • Propostas<br />
                        • Cotas / contratos vinculados<br />
                        • Qualquer outro registro dependente
                        <br />
                        <br />
                        Confirme apenas se você tiver certeza absoluta.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isPending}
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-500 text-white"
                    >
                        Sim, excluir tudo
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
