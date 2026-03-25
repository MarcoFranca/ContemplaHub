"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ContratoPdfUploadCard } from "@/app/app/lances/components/carta-sheet/ContratoPdfUploadCard";

interface Props {
    contractId?: string | null;
}

export function DocumentoSection({ contractId }: Props) {
    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle>Documento do contrato</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {!contractId ? (
                    <Alert>
                        <AlertTitle>Disponível após salvar</AlertTitle>
                        <AlertDescription>
                            Primeiro salve o contrato. Depois o upload do PDF ficará disponível.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <ContratoPdfUploadCard contractId={contractId} />
                )}
            </CardContent>
        </Card>
    );
}