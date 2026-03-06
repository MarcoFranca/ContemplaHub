"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type ClientesViewModeToggleProps = {
    currentMode: "cards" | "lista";
};

export function ClientesViewModeToggle({
                                           currentMode,
                                       }: ClientesViewModeToggleProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    function setMode(mode: "cards" | "lista") {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", "clientes");
        params.set("mode", mode);

        document.cookie = `carteira_clientes_mode=${mode}; path=/; max-age=31536000; samesite=lax`;

        router.replace(`/app/carteira?${params.toString()}`);
    }

    return (
        <div className="inline-flex rounded-md border border-white/10 bg-white/5 p-1">
            <Button
                size="sm"
                variant={currentMode === "cards" ? "default" : "ghost"}
                onClick={() => setMode("cards")}
                type="button"
            >
                Cards
            </Button>

            <Button
                size="sm"
                variant={currentMode === "lista" ? "default" : "ghost"}
                onClick={() => setMode("lista")}
                type="button"
            >
                Lista
            </Button>
        </div>
    );
}