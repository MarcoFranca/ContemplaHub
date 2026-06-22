"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Scale } from "lucide-react";
import { ConsorcioSimulator } from "./ConsorcioSimulator";
import { ComparativoSimulator } from "./ComparativoSimulator";

type SimId = "consorcio" | "comparativo";

const SIMS: Array<{ id: SimId; label: string; icon: React.ComponentType<{ className?: string }>; titulo: string }> = [
    { id: "consorcio", label: "Consórcio (lance)", icon: Calculator, titulo: "Simulador de Consórcio — Lance" },
    { id: "comparativo", label: "Consórcio x Financiamento", icon: Scale, titulo: "Comparativo: Consórcio x Financiamento" },
];

export function SimuladoresHub({ organizacaoNome }: { organizacaoNome?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const search = useSearchParams();

    // Sincroniza com o sidebar/URL via ?sim=
    const simParam = search.get("sim") as SimId | null;
    const sim: SimId = SIMS.some((s) => s.id === simParam) ? (simParam as SimId) : "consorcio";
    const atual = SIMS.find((s) => s.id === sim)!;

    const setSim = (id: SimId) => {
        const params = new URLSearchParams(search.toString());
        params.set("sim", id);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {SIMS.map((s) => {
                    const Icon = s.icon;
                    const active = s.id === sim;
                    return (
                        <Button
                            key={s.id}
                            type="button"
                            variant={active ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSim(s.id)}
                            className={active ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {s.label}
                        </Button>
                    );
                })}
            </div>

            <Card className="border-white/10 bg-white/5">
                <CardHeader>
                    <CardTitle className="text-base">{atual.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                    {sim === "consorcio" ? (
                        <ConsorcioSimulator organizacaoNome={organizacaoNome} />
                    ) : (
                        <ComparativoSimulator organizacaoNome={organizacaoNome} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
