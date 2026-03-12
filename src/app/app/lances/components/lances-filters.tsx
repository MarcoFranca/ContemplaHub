"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

type Regra = {
    administradora_id: string;
    administradora_nome?: string | null;
};

type Props = {
    competencia: string;
    statusCota: string;
    administradoraId: string;
    produto: string;
    q: string;
    somenteAutorizadas: boolean;
    regras: Regra[];
};

export function LancesFilters({
                                  competencia,
                                  statusCota,
                                  administradoraId,
                                  produto,
                                  q,
                                  somenteAutorizadas,
                                  regras,
                              }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const search = useSearchParams();

    const administradoras = useMemo(() => {
        const map = new Map<string, string>();
        for (const item of regras) {
            if (!item.administradora_id) continue;
            map.set(item.administradora_id, item.administradora_nome || "Operadora");
        }
        return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
    }, [regras]);

    function updateParam(key: string, value?: string) {
        const params = new URLSearchParams(search.toString());
        if (!value) params.delete(key);
        else params.set(key, value);
        router.push(`${pathname}?${params.toString()}`);
    }

    function resetAll() {
        router.push(`${pathname}?competencia=${competencia}`);
    }

    return (
        <div className="grid gap-3 md:grid-cols-6">
            <Input
                type="date"
                value={competencia}
                onChange={(e) => updateParam("competencia", e.target.value)}
            />

            <Select value={statusCota} onValueChange={(value) => updateParam("status_cota", value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Status da carta" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ativa">Ativas</SelectItem>
                    <SelectItem value="contemplada">Contempladas</SelectItem>
                    <SelectItem value="cancelada">Canceladas</SelectItem>
                    <SelectItem value="all">Todas</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={administradoraId || "__all__"}
                onValueChange={(value) =>
                    updateParam("administradora_id", value === "__all__" ? "" : value)
                }
            >
                <SelectTrigger>
                    <SelectValue placeholder="Operadora" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="__all__">Todas as operadoras</SelectItem>
                    {administradoras.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                            {item.nome}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={produto || "__all__"}
                onValueChange={(value) => updateParam("produto", value === "__all__" ? "" : value)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Produto" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="__all__">Todos os produtos</SelectItem>
                    <SelectItem value="imobiliario">Imobiliário</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
            </Select>

            <Input
                placeholder="Buscar grupo ou cota"
                defaultValue={q}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        updateParam("q", (e.currentTarget as HTMLInputElement).value);
                    }
                }}
            />

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant={somenteAutorizadas ? "default" : "outline"}
                    className="w-full"
                    onClick={() =>
                        updateParam("somente_autorizadas", somenteAutorizadas ? "" : "1")
                    }
                >
                    Autorizadas
                </Button>
                <Button type="button" variant="ghost" onClick={resetAll}>
                    Limpar
                </Button>
            </div>
        </div>
    );
}