"use client";

import { FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ContratoPdfUploadCard } from "@/app/app/lances/components/carta-sheet/ContratoPdfUploadCard";
import { PremiumFormSection } from "../section-base/premium-form-section";

interface Props {
  contractId?: string | null;
}

export function DocumentoSection({ contractId }: Props) {
  return (
    <PremiumFormSection
      title="Documento do contrato"
      description="Anexe o PDF para consolidar o fechamento e facilitar a consulta operacional depois do cadastro."
      eyebrow="Documento"
      icon={<FileText className="h-3.5 w-3.5" />}
    >
      {!contractId ? (
        <Alert className="border-white/10 bg-white/[0.03] text-slate-100">
          <AlertTitle className="text-white">Disponível após salvar</AlertTitle>
          <AlertDescription className="text-slate-400">
            Primeiro salve o contrato. Depois o upload do PDF ficará disponível nesta mesma área.
          </AlertDescription>
        </Alert>
      ) : (
        <ContratoPdfUploadCard contractId={contractId} />
      )}
    </PremiumFormSection>
  );
}
