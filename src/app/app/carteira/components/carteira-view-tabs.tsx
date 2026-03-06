"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

type CarteiraViewTabsProps = {
    currentView: "clientes" | "cartas";
};

export function CarteiraViewTabs({ currentView }: CarteiraViewTabsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    function setView(view: "clientes" | "cartas") {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", view);

        document.cookie = `carteira_view=${view}; path=/; max-age=31536000; samesite=lax`;

        router.replace(`/app/carteira?${params.toString()}`);
    }

    return (
        <TabsList>
            <TabsTrigger
                value="clientes"
                onClick={() => setView("clientes")}
            >
                Clientes
            </TabsTrigger>

            <TabsTrigger
                value="cartas"
                onClick={() => setView("cartas")}
            >
                Cartas
            </TabsTrigger>
        </TabsList>
    );
}