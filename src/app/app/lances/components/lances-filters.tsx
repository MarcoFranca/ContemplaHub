"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Filter, RotateCcw, SlidersHorizontal } from "lucide-react";

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

type DraftState = {
    competencia: string;
    statusCota: string;
    administradoraId: string;
    produto: string;
    q: string;
    somenteAutorizadas: boolean;
};

function buildQueryFromDraft(draft: DraftState) {
    const params = new URLSearchParams();

    if (draft.competencia) params.set("competencia", draft.competencia);
    if (draft.statusCota && draft.statusCota !== "all") {
        params.set("status_cota", draft.statusCota);
    }
    if (draft.administradoraId) {
        params.set("administradora_id", draft.administradoraId);
    }
    if (draft.produto) {
        params.set("produto", draft.produto);
    }
    if (draft.q.trim()) {
        params.set("q", draft.q.trim());
    }
    if (draft.somenteAutorizadas) {
        params.set("somente_autorizadas", "1");
    }

    return params.toString();
}

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

    const [open, setOpen] = useState(false);

    const administradoras = useMemo(() => {
        const map = new Map<string, string>();

        for (const item of regras) {
            if (!item.administradora_id) continue;
            map.set(item.administradora_id, item.administradora_nome || "Operadora");
        }

        return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
    }, [regras]);

    const [draft, setDraft] = useState<DraftState>({
        competencia,
        statusCota,
        administradoraId,
        produto,
        q,
        somenteAutorizadas,
    });

    function updateParam(key: string, value?: string) {
        const params = new URLSearchParams(search.toString());

        if (!value) params.delete(key);
        else params.set(key, value);

        router.push(`${pathname}?${params.toString()}`);
    }

    function resetAllDesktop() {
        router.push(`${pathname}?competencia=${competencia}`);
    }

    function applyMobileFilters() {
        const query = buildQueryFromDraft(draft);
        router.push(`${pathname}?${query}`);
        setOpen(false);
    }

    function resetMobileFilters() {
        const nextDraft: DraftState = {
            competencia,
            statusCota: "ativa",
            administradoraId: "",
            produto: "",
            q: "",
            somenteAutorizadas: false,
        };

        setDraft(nextDraft);

        const query = buildQueryFromDraft(nextDraft);
        router.push(`${pathname}?${query}`);
        setOpen(false);
    }

    const activeBadges = [
        statusCota && statusCota !== "all" ? `Status: ${statusCota}` : null,
        administradoraId
            ? `Operadora: ${
                administradoras.find((a) => a.id === administradoraId)?.nome || administradoraId
            }`
            : null,
        produto ? `Produto: ${produto}` : null,
        q ? `Busca: ${q}` : null,
        somenteAutorizadas ? "Somente autorizadas" : null,
    ].filter(Boolean) as string[];

    return (
        <div className="space-y-3">
            <div className="md:hidden">
                <div className="flex items-center gap-2">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="inline-flex w-full items-center justify-center gap-2"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filtros
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                            <SheetHeader className="mb-4">
                                <SheetTitle>Filtros de lances</SheetTitle>
                            </SheetHeader>

                            <div className="grid gap-3">
                                <Input
                                    type="date"
                                    value={draft.competencia}
                                    onChange={(e) =>
                                        setDraft((prev) => ({ ...prev, competencia: e.target.value }))
                                    }
                                />

                                <Select
                                    value={draft.statusCota}
                                    onValueChange={(value) =>
                                        setDraft((prev) => ({ ...prev, statusCota: value }))
                                    }
                                >
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
                                    value={draft.administradoraId || "__all__"}
                                    onValueChange={(value) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            administradoraId: value === "__all__" ? "" : value,
                                        }))
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
                                    value={draft.produto || "__all__"}
                                    onValueChange={(value) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            produto: value === "__all__" ? "" : value,
                                        }))
                                    }
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
                                    placeholder="Buscar cliente, grupo ou cota"
                                    value={draft.q}
                                    onChange={(e) =>
                                        setDraft((prev) => ({ ...prev, q: e.target.value }))
                                    }
                                />

                                <Button
                                    type="button"
                                    variant={draft.somenteAutorizadas ? "default" : "outline"}
                                    className="w-full"
                                    onClick={() =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            somenteAutorizadas: !prev.somenteAutorizadas,
                                        }))
                                    }
                                >
                                    Autorizadas
                                </Button>
                            </div>

                            <SheetFooter className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={resetMobileFilters}
                                    className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Limpar
                                </Button>

                                <Button type="button" onClick={applyMobileFilters} className="w-full sm:w-auto">
                                    Aplicar filtros
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" className="inline-flex items-center gap-1">
                        <Filter className="h-3.5 w-3.5" />
                        {competencia}
                    </Badge>

                    {activeBadges.map((badge) => (
                        <Badge key={badge} variant="secondary">
                            {badge}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="hidden gap-2 md:grid md:grid-cols-[minmax(140px,0.95fr)_minmax(140px,0.8fr)_minmax(190px,1fr)_minmax(180px,0.9fr)_minmax(220px,1.2fr)_minmax(180px,0.9fr)]">
                <Input
                    type="date"
                    value={competencia}
                    onChange={(e) => updateParam("competencia", e.target.value)}
                    className="h-9 text-sm"
                />

                <Select
                    value={statusCota}
                    onValueChange={(value) => updateParam("status_cota", value)}
                >
                    <SelectTrigger className="h-9 text-sm">
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
                    <SelectTrigger className="h-9 text-sm">
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
                    onValueChange={(value) =>
                        updateParam("produto", value === "__all__" ? "" : value)
                    }
                >
                    <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Produto" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__all__">Todos os produtos</SelectItem>
                        <SelectItem value="imobiliario">Imobiliário</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                </Select>

                <Input
                    placeholder="Buscar cliente, grupo ou cota"
                    defaultValue={q}
                    className="h-9 text-sm"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            updateParam("q", (e.currentTarget as HTMLInputElement).value);
                        }
                    }}
                />

                <div className="flex min-w-0 gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant={somenteAutorizadas ? "default" : "outline"}
                        className="h-9 min-w-0 flex-1"
                        onClick={() =>
                            updateParam("somente_autorizadas", somenteAutorizadas ? "" : "1")
                        }
                    >
                        Autorizadas
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={resetAllDesktop}
                        className="h-9 shrink-0 px-3"
                    >
                        Limpar
                    </Button>
                </div>
            </div>
        </div>
    );
}
