// src/app/app/leads/[leadId]/LeadPropostasCard.tsx
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, FileSignature } from "lucide-react";
import { LeadPropostasList } from "./LeadPropostasList";

export function LeadPropostasCard({ leadId }: { leadId: string }) {
    return (
        <Card className="border-white/10 bg-white/5">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
              <FileSignature className="h-4 w-4 text-emerald-300" />
            </span>
                        Propostas
                    </CardTitle>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Acompanhe propostas, simulações e andamento comercial do lead.
                    </p>
                </div>

                <Link href={`/app/leads/${leadId}/propostas/nova`}>
                    <Button size="sm" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500">
                        <ArrowUpRight className="h-4 w-4" />
                        Nova proposta
                    </Button>
                </Link>
            </CardHeader>

            <CardContent>
                <LeadPropostasList leadId={leadId} />
            </CardContent>
        </Card>
    );
}