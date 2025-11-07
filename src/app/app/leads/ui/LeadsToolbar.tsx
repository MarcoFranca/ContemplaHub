// src/app/app/leads/ui/LeadsToolbar.tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function LeadsToolbar() {
    const router = useRouter();
    const sp = useSearchParams();

    const showActive = sp.get("ativos") === "1";
    const showLost = sp.get("perdidos") === "1";

    const debounceRef = React.useRef<number | null>(null);

    function setParam(key: string, val: string | null) {
        const url = new URL(window.location.href);
        const current = url.searchParams.get(key);
        // ✅ não faz nada se não mudou
        if ((current ?? null) === val) return;

        if (val === null) url.searchParams.delete(key);
        else url.searchParams.set(key, val);

        // ✅ debounce: evita várias navegações em sequência
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            router.replace(
                url.pathname + (url.searchParams.size ? `?${url.searchParams.toString()}` : ""),
                { scroll: false }
            );
            // ❌ sem router.refresh(): a troca de searchParams já reexecuta o Server Component
        }, 80);
    }

    return (
        <div className=" flex items-center gap-6">
            <div className="flex items-center gap-2">
                <Switch
                    id="ativos"
                    checked={showActive}
                    onCheckedChange={(v) => setParam("ativos", v ? "1" : null)}
                />
                <Label htmlFor="ativos" className="text-sm">Mostrar Ativos</Label>
            </div>
            <div className="flex items-center gap-2">
                <Switch
                    id="perdidos"
                    checked={showLost}
                    onCheckedChange={(v) => setParam("perdidos", v ? "1" : null)}
                />
                <Label htmlFor="perdidos" className="text-sm">Mostrar Perdidos</Label>
            </div>
        </div>
    );
}
