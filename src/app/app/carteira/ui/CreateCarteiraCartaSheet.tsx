"use client";

import * as React from "react";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { CartaSheet } from "@/app/app/lances/components/carta-sheet/CartaSheet";
import { getEmptyCartaData } from "@/app/app/lances/components/carta-sheet/get-empty-carta-data";
import { fireConfetti } from "@/lib/ui/confetti";

export type ClienteCartaOption = {
    id: string;
    nome: string;
    telefone?: string;
    email?: string;
};

type Props = {
    clientes?: ClienteCartaOption[];
    clienteId?: string;
    triggerLabel?: string;
    triggerVariant?: "default" | "outline" | "secondary" | "ghost";
};

export function CreateCarteiraCartaSheet({
                                             clientes = [],
                                             clienteId,
                                             triggerLabel = "Cadastrar carta",
                                             triggerVariant = "default",
                                         }: Props) {
    const [openSelector, setOpenSelector] = React.useState(false);
    const [openCarta, setOpenCarta] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [selectedCliente, setSelectedCliente] = React.useState<ClienteCartaOption | null>(null);

    const clientePreSelecionado = React.useMemo(() => {
        if (!clienteId) return null;
        return clientes.find((c) => c.id === clienteId) ?? null;
    }, [clienteId, clientes]);

    const filtered = React.useMemo(() => {
        return clientes.filter((c) =>
            c.nome.toLowerCase().includes(search.toLowerCase())
        );
    }, [clientes, search]);

    const data = React.useMemo(() => {
        const base = getEmptyCartaData();
        return {
            ...base,
            clienteId: selectedCliente?.id || clientePreSelecionado?.id || "",
        };
    }, [selectedCliente, clientePreSelecionado]);

    function handleTriggerClick() {
        if (clientePreSelecionado) {
            setSelectedCliente(clientePreSelecionado);
            setOpenCarta(true);
            return;
        }

        setOpenSelector(true);
    }

    return (
        <>
            <Button type="button" variant={triggerVariant} onClick={handleTriggerClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {triggerLabel}
            </Button>

            <Sheet open={openSelector} onOpenChange={setOpenSelector}>
                <SheetContent className="w-[420px] sm:w-[520px]">
                    <SheetHeader>
                        <SheetTitle>Selecionar cliente</SheetTitle>
                    </SheetHeader>

                    <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar cliente..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="max-h-[60vh] space-y-2 overflow-auto">
                            {filtered.map((cliente, index) => (
                                <button
                                    key={cliente.id || `cliente-${index}`}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCliente(cliente);
                                        setOpenSelector(false);
                                        setOpenCarta(true);
                                    }}
                                    className="w-full rounded-lg border p-3 text-left hover:bg-muted/40"
                                >
                                    <div className="font-medium">{cliente.nome}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {cliente.email || cliente.telefone || "—"}
                                    </div>
                                </button>
                            ))}

                            {!filtered.length && (
                                <div className="py-10 text-center text-sm text-muted-foreground">
                                    Nenhum cliente encontrado
                                </div>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <CartaSheet
                open={openCarta}
                onOpenChange={setOpenCarta}
                mode="create"
                data={data}
                onSuccess={() => {
                    setOpenCarta(false);
                    fireConfetti();
                    toast.success("Carta cadastrada com sucesso!");
                }}
            />
        </>
    );
}