// src/app/app/leads/[leadId]/LeadPropostasCard.tsx
import Link from "next/link";
import { FileSignature } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeadPropostasList } from "./LeadPropostasList";

export function LeadPropostasCard({ leadId }: { leadId: string }) {
    return (
        <Card>
            <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                    Propostas consultivas
                </CardTitle>

                <Link
                    href={`/app/leads/${leadId}/propostas/nova`}
                    className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                >
                    <FileSignature className="h-3.5 w-3.5" />
                    Nova proposta
                </Link>
            </CardHeader>

            <CardContent>
                <LeadPropostasList leadId={leadId} />
            </CardContent>
        </Card>
    );
}
