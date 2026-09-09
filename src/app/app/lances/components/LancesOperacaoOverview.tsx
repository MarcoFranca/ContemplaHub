import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CheckCheck,
    CircleDashed,
    ClipboardCheck,
    ListTodo,
    Trophy,
    WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LanceOperacaoOverview } from "../types";

type Props = {
    overview: LanceOperacaoOverview;
};

type OverviewCard = {
    label: string;
    value: number;
    icon: LucideIcon;
};

export function LancesOperacaoOverview({ overview }: Props) {
    const cards: OverviewCard[] = [
        { label: "Pendentes", value: overview.pendentes, icon: ListTodo },
        { label: "Planejados", value: overview.planejados, icon: WalletCards },
        { label: "Baixados", value: overview.baixados, icon: ClipboardCheck },
        { label: "Sem lance", value: overview.sem_lance, icon: CircleDashed },
        { label: "Contempladas", value: overview.contempladas, icon: Trophy },
        { label: "Total", value: overview.total, icon: CheckCheck },
    ];

    return (
        <>
            <div className="md:hidden">
                <div className="-mx-4 overflow-x-auto px-4 pb-1">
                    <div className="flex gap-3 min-w-max">
                        {cards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <Card
                                    key={card.label}
                                    className="w-[180px] shrink-0 border-white/10 bg-white/5"
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm text-slate-300">
                                            <Icon className="h-4 w-4" />
                                            {card.label}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="text-2xl font-semibold text-white">
                                        {card.value}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-6">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <Card key={card.label} className="border-white/10 bg-white/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm text-slate-300">
                                    <Icon className="h-4 w-4" />
                                    {card.label}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="text-2xl font-semibold text-white">
                                {card.value}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </>
    );
}
