// src/app/app/leads/[leadId]/LeadPropostasCard.tsx
import Link from "next/link";
import { FileSignature } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeadPropostasList } from "./LeadPropostasList";

export function LeadPropostasCard({ leadId }: { leadId: string }) {
    return (
        <Card className="bg-slate-950/70 border-slate-800/80">
            <CardHeader
                className="
          flex flex-col gap-3
          sm:flex-row sm:items-center sm:justify-between
        "
            >
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">
                        Propostas consultivas
                    </CardTitle>
                    <p className="text-[11px] text-slate-400 max-w-md">
                        Organize seus cenários de consórcio, acompanhe status e acesse
                        rapidamente o link público de cada proposta.
                    </p>
                </div>

                <Link
                    href={`/app/leads/${leadId}/propostas/nova`}
                    className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded
                     bg-emerald-600 text-white hover:bg-emerald-500
                     whitespace-nowrap"
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
