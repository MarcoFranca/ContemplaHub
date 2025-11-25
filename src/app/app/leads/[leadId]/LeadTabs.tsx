"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LeadPropostasList } from "./LeadPropostasList";

export function LeadTabs({ leadId }: { leadId: string }) {
    return (
        <Tabs defaultValue="overview" className="w-full mt-4">
            <TabsList className="grid grid-cols-4 bg-slate-800/60 border border-white/10">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
                <TabsTrigger value="estrategias">Estratégias</TabsTrigger>
                <TabsTrigger value="propostas">Propostas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="pt-4">
                <p className="text-sm text-slate-400">
                    Aqui vai o resumo do lead, interesse, dados principais.
                </p>
            </TabsContent>

            <TabsContent value="diagnostico" className="pt-4">
                <p className="text-sm text-slate-400">
                    Aqui encaixaremos o diagnóstico do lead.
                </p>
            </TabsContent>

            <TabsContent value="estrategias" className="pt-4">
                <p className="text-sm text-slate-400">
                    Estratégias de lance, oportunidades e previsões.
                </p>
            </TabsContent>

            <TabsContent value="propostas" className="pt-4">
                <LeadPropostasList leadId={leadId} />
            </TabsContent>
        </Tabs>
    );
}
