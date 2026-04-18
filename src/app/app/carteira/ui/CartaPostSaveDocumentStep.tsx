"use client";

import { FileCheck2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DocumentoSection } from "@/features/contratos/components/sections/documento-section";

interface Props {
    contractId: string;
    onFinish: () => void;
}

export function CartaPostSaveDocumentStep({
                                              contractId,
                                              onFinish,
                                          }: Props) {
    return (
        <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6">
                <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-2 text-blue-300">
                        <FileCheck2 className="h-5 w-5" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-semibold text-white">
                            Incluir documento do contrato
                        </h3>
                        <p className="max-w-2xl text-sm leading-6 text-slate-300">
                            O cadastro da carta já foi concluído. Agora você pode anexar o
                            documento do contrato usando o identificador já salvo no sistema.
                        </p>
                    </div>
                </div>
            </div>

            <DocumentoSection contractId={contractId} />

            <div className="flex justify-end">
                <Button onClick={onFinish}>Concluir</Button>
            </div>
        </div>
    );
}