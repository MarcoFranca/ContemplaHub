"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, Upload } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
    cotaId?: string;
    contratoId?: string;
    disabled?: boolean;
};

export function ContratoPdfUploadCard({
                                          cotaId,
                                          contratoId,
                                          disabled,
                                      }: Props) {
    const [uploading, setUploading] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    async function onSelectFile(file: File) {
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Envie um arquivo PDF.");
            return;
        }

        if (!cotaId && !contratoId) {
            toast.error("Salve a carta antes de anexar o contrato.");
            return;
        }

        try {
            setUploading(true);
            toast.loading("Enviando contrato...");

            const formData = new FormData();
            formData.append("file", file);
            if (cotaId) formData.append("cota_id", cotaId);
            if (contratoId) formData.append("contrato_id", contratoId);

            const response = await fetch("/api/lances/cartas/upload-contrato", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Não foi possível enviar o PDF do contrato.");
            }

            toast.dismiss();
            toast.success("Contrato enviado com sucesso.");
        } catch (error) {
            toast.dismiss();
            toast.error(error instanceof Error ? error.message : "Erro ao enviar contrato.");
        } finally {
            setUploading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Contrato e documentos</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="rounded-xl border border-dashed p-4">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-muted p-2">
                            <FileText className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="font-medium">PDF do contrato</div>
                            <p className="text-sm text-muted-foreground">
                                Anexe aqui o contrato da carta para centralizar a documentação.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <input
                            ref={inputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onSelectFile(file);
                            }}
                        />

                        <Button
                            type="button"
                            variant="outline"
                            disabled={disabled || uploading}
                            onClick={() => inputRef.current?.click()}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {uploading ? "Enviando..." : "Enviar PDF"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}