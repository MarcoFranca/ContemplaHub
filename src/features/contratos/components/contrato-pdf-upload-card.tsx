"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Eye,
  FileText,
  Lock,
  RefreshCcw,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ContractDocumentMeta = {
  ok: boolean;
  contract_id: string;
  has_document: boolean;
  pdf_path?: string | null;
  pdf_filename?: string | null;
  pdf_mime_type?: string | null;
  pdf_size_bytes?: number | null;
  pdf_uploaded_at?: string | null;
  pdf_uploaded_by?: string | null;
  pdf_uploaded_actor_type?: string | null;
  pdf_version?: number | null;
  pdf_status?: string | null;
};

type SignedUrlResponse = {
  ok: boolean;
  contract_id: string;
  signed_url: string;
  expires_in: number;
};

interface Props {
  contractId?: string | null;
}

export function ContratoPdfUploadCard({ contractId }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [meta, setMeta] = React.useState<ContractDocumentMeta | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const disabled = !contractId;

  const loadMetadata = React.useCallback(async () => {
    if (!contractId) return;

    try {
      const res = await fetch(`/api/contracts/${contractId}/document`, {
        method: "GET",
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Erro ao carregar metadados do contrato.");
      }

      setMeta(json);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar metadados do contrato.",
      );
    }
  }, [contractId]);

  React.useEffect(() => {
    if (contractId) {
      void loadMetadata();
    } else {
      setMeta(null);
    }
  }, [contractId, loadMetadata]);

  async function onSelectFile(file: File) {
    if (!file || !contractId) return;

    if (file.type !== "application/pdf") {
      toast.error("Envie um arquivo PDF.");
      return;
    }

    try {
      setLoading(true);
      const toastId = toast.loading("Enviando contrato...");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/contracts/${contractId}/document`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Erro ao enviar PDF do contrato.");
      }

      await loadMetadata();
      toast.success("Contrato enviado com sucesso.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar contrato.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handlePreview() {
    if (!contractId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/contracts/${contractId}/document/signed-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expires_in: 3600 }),
      });

      const json = (await res.json()) as SignedUrlResponse & { error?: string };

      if (!res.ok || !json?.signed_url) {
        throw new Error(json?.error || "Erro ao gerar URL do contrato.");
      }

      window.open(json.signed_url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao abrir contrato.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!contractId) return;

    try {
      setLoading(true);
      const toastId = toast.loading("Removendo contrato...");

      const res = await fetch(`/api/contracts/${contractId}/document`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Erro ao remover contrato.");
      }

      await loadMetadata();
      toast.success("Contrato removido com sucesso.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao remover contrato.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contrato e documentos</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {disabled ? (
          <div className="rounded-xl border border-dashed p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Lock className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-medium">PDF do contrato</div>
                <p className="text-sm text-muted-foreground">
                  O upload do contrato fica disponível após a criação do contrato.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Button type="button" variant="outline" disabled>
                <Upload className="mr-2 h-4 w-4" />
                Enviar PDF do contrato
              </Button>
            </div>
          </div>
        ) : !meta?.has_document ? (
          <div className="rounded-xl border border-dashed p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-muted p-2">
                <FileText className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-medium">PDF do contrato</div>
                <p className="text-sm text-muted-foreground">
                  Anexe o contrato em PDF para centralizar a documentação da carta.
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
                  if (file) void onSelectFile(file);
                }}
              />

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {loading ? "Enviando..." : "Enviar PDF do contrato"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <FileText className="h-4 w-4 text-emerald-400" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{meta.pdf_filename || "contrato.pdf"}</div>
                <p className="text-sm text-muted-foreground">PDF anexado com sucesso.</p>

                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div>Status: {meta.pdf_status || "disponivel"}</div>
                  <div>Versão: {meta.pdf_version ?? 1}</div>
                  <div>
                    Tamanho:{" "}
                    {typeof meta.pdf_size_bytes === "number"
                      ? `${(meta.pdf_size_bytes / 1024).toFixed(1)} KB`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handlePreview} disabled={loading}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </Button>

              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onSelectFile(file);
                }}
              />

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => inputRef.current?.click()}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Substituir
              </Button>

              <Button type="button" variant="destructive" disabled={loading} onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remover
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
