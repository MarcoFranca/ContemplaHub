"use client";

import * as React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    deleteParceiroAction,
    getParceiroDeleteCheckAction,
    type DeleteCheckResponse,
} from "../actions";
import type { ParceiroWithAccess } from "../types";
import { Button } from "@/components/ui/button";
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

type Props = {
    parceiro: ParceiroWithAccess;
};

export function DeleteParceiroDialog({ parceiro }: Props) {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [check, setCheck] = React.useState<DeleteCheckResponse | null>(null);

    async function handleOpenChange(next: boolean) {
        setOpen(next);

        if (!next) {
            setCheck(null);
            return;
        }

        try {
            setLoading(true);
            const result = await getParceiroDeleteCheckAction(parceiro.id);
            setCheck(result);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Erro ao validar exclusão do parceiro.";
            toast.error(message);
            setOpen(false);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        try {
            setLoading(true);
            await deleteParceiroAction(parceiro.id);
            toast.success("Parceiro excluído com sucesso.");
            setOpen(false);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Erro ao excluir parceiro.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    const blocked = check ? !check.can_delete : false;

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Excluir
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        {blocked ? "Exclusão bloqueada" : "Excluir parceiro"}
                    </AlertDialogTitle>

                    <AlertDialogDescription asChild>
                        <div className="space-y-3 text-sm">
                            {loading && <p>Validando vínculos do parceiro...</p>}

                            {!loading && check && blocked && (
                                <>
                                    <p>
                                        Este parceiro não pode ser excluído enquanto existirem vínculos
                                        ativos no sistema.
                                    </p>

                                    <div className="rounded-lg border bg-muted/40 p-3">
                                        <div className="space-y-1">
                                            {check.counts.partner_users > 0 && (
                                                <p>• {check.counts.partner_users} acesso(s) de parceiro</p>
                                            )}
                                            {check.counts.cotas > 0 && (
                                                <p>• {check.counts.cotas} carta(s)/cota(s) vinculada(s)</p>
                                            )}
                                            {check.counts.contratos > 0 && (
                                                <p>• {check.counts.contratos} contrato(s) vinculado(s)</p>
                                            )}
                                            {check.counts.comissoes > 0 && (
                                                <p>• {check.counts.comissoes} lançamento(s) de comissão</p>
                                            )}
                                        </div>
                                    </div>

                                    {!!check.reasons.length && (
                                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-amber-700 dark:text-amber-300">
                                            <div className="space-y-1">
                                                {check.reasons.map((reason) => (
                                                    <p key={reason}>• {reason}</p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {!loading && check && !blocked && (
                                <p>
                                    Tem certeza que deseja excluir <strong>{parceiro.nome}</strong>?
                                    Essa ação remove o cadastro permanentemente.
                                </p>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        {blocked ? "Fechar" : "Cancelar"}
                    </AlertDialogCancel>

                    {!blocked && !loading && (
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                void handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Excluir parceiro
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}