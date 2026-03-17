"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    onCancelComissao: () => void;
    onDeleteComissao: () => void;
    onDeleteCarta: () => void;
    cancelingComissao: boolean;
    deletingComissao: boolean;
    deletingCarta: boolean;
};

export function SensitiveActionsSection({
                                            onCancelComissao,
                                            onDeleteComissao,
                                            onDeleteCarta,
                                            cancelingComissao,
                                            deletingComissao,
                                            deletingCarta,
                                        }: Props) {
    return (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
            <div className="space-y-1">
                <h3 className="font-medium inline-flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    Ações sensíveis
                </h3>
                <p className="text-xs text-muted-foreground">
                    Use com cuidado em ambiente de testes ou para correção operacional.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={onCancelComissao} disabled={cancelingComissao}>
                    Cancelar comissão
                </Button>

                <Button type="button" variant="outline" onClick={onDeleteComissao} disabled={deletingComissao}>
                    Excluir comissão
                </Button>

                <Button type="button" variant="destructive" onClick={onDeleteCarta} disabled={deletingCarta}>
                    Excluir carta
                </Button>
            </div>
        </div>
    );
}

