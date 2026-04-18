"use client";

import { PartyPopper, FileText, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddDocumentNow: () => void;
    onFinish: () => void;
}

export function CartaCadastroSuccessDialog({
                                               open,
                                               onOpenChange,
                                               onAddDocumentNow,
                                               onFinish,
                                           }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-white/10 bg-slate-950 text-white sm:max-w-md">
                <DialogHeader className="space-y-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                        <PartyPopper className="h-6 w-6" />
                    </div>

                    <div className="space-y-1">
                        <DialogTitle className="text-xl font-semibold text-white">
                            Carta cadastrada com sucesso
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-slate-300">
                            O cadastro foi concluído. Você pode finalizar agora ou seguir para
                            incluir o documento do contrato.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                        <p>
                            A carta já foi salva. O próximo passo pode ser anexar o documento
                            do contrato agora ou concluir e fazer isso depois.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={onFinish}>
                        Finalizar
                    </Button>

                    <Button onClick={onAddDocumentNow}>
                        <FileText className="mr-2 h-4 w-4" />
                        Incluir documento agora
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}