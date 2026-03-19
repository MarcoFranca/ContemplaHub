"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    loading?: boolean;
    onSaveWithoutProjection: () => Promise<void>;
    onSaveWithAdesao: (dataAdesao: string) => Promise<void>;
};

export function MissingAdesaoDialog({
                                        open,
                                        onOpenChange,
                                        loading,
                                        onSaveWithoutProjection,
                                        onSaveWithAdesao,
                                    }: Props) {
    const [dataAdesao, setDataAdesao] = React.useState("");

    React.useEffect(() => {
        if (!open) {
            setDataAdesao("");
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Data de adesão necessária</DialogTitle>
                    <DialogDescription>
                        Para gerar os lançamentos da comissão, a carta precisa ter data de
                        adesão. Você pode salvar a comissão sem projeção agora ou informar a
                        data e concluir tudo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Data de adesão</label>
                        <Input
                            type="date"
                            value={dataAdesao}
                            onChange={(e) => setDataAdesao(e.target.value)}
                        />
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-muted-foreground">
                        Sem data de adesão, a comissão pode ser salva, mas os lançamentos
                        não serão projetados.
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void onSaveWithoutProjection()}
                        disabled={loading}
                    >
                        Salvar comissão sem lançamentos
                    </Button>

                    <Button
                        type="button"
                        onClick={() => void onSaveWithAdesao(dataAdesao)}
                        disabled={loading || !dataAdesao}
                    >
                        Salvar data e gerar lançamentos
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}