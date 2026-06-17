"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2 } from "lucide-react";
import {
    importarDocumentoCartaAction,
    type DocumentoImportado,
} from "../actions/importar-documento";

type Props = {
    onImported: (data: DocumentoImportado, file: File) => void;
    label?: string;
    className?: string;
};

export function ImportarDocumentoButton({ onImported, label = "Importar PDF (extrato/apólice)", className }: Props) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [loading, setLoading] = React.useState(false);

    async function handleFile(file: File) {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.set("file", file, file.name);
            const result = await importarDocumentoCartaAction(formData);
            if (!result.ok) {
                toast.error(result.error);
                return;
            }
            const tipo = result.data.tipo_documento === "extrato" ? "extrato" : "proposta";
            const preenchidos = Object.keys(result.data.dados).length;
            toast.success(`Documento (${tipo}) lido: ${preenchidos} campo(s) preenchido(s). Revise antes de salvar.`);
            if (result.data.avisos?.length) {
                result.data.avisos.forEach((a) => toast.warning(a));
            }
            onImported(result.data, file);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Erro ao importar documento.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) void handleFile(f);
                }}
            />
            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => inputRef.current?.click()}
                className={className}
            >
                {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <FileUp className="mr-2 h-4 w-4" />
                )}
                {label}
            </Button>
        </>
    );
}
