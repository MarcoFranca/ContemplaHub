"use client";

import * as React from "react";
import { PlusCircle, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// import { CartaSheet } from "@/app/app/lances/components/carta-sheet/CartaSheet";
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
    triggerClassName?: string;
    triggerIcon?: React.ReactNode;
};

export function CreateCarteiraCartaSheet({
                                             clientes = [],
                                             clienteId,
                                             triggerLabel = "Cadastrar carta",
                                             triggerVariant = "default",
                                             triggerClassName,
                                             triggerIcon,
                                         }: Props) {
    const [openSelector, setOpenSelector] = React.useState(false);
    const [openCarta, setOpenCarta] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [selectedCliente, setSelectedCliente] =
        React.useState<ClienteCartaOption | null>(null);

    const clientePreSelecionado = React.useMemo(() => {
        if (!clienteId) return null;
        return clientes.find((c) => c.id === clienteId) ?? null;
    }, [clienteId, clientes]);

    const filtered = React.useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return clientes;

        return clientes.filter((c) => {
            const nome = c.nome?.toLowerCase() ?? "";
            const email = c.email?.toLowerCase() ?? "";
            const telefone = c.telefone?.toLowerCase() ?? "";
            return (
                nome.includes(term) ||
                email.includes(term) ||
                telefone.includes(term)
            );
        });
    }, [clientes, search]);

    const resolvedCliente = selectedCliente ?? clientePreSelecionado;

    const data = React.useMemo(() => {
        const base = getEmptyCartaData();

        return {
            ...base,
            clienteId: resolvedCliente?.id || "",
            clienteNome: resolvedCliente?.nome || null,
        };
    }, [resolvedCliente]);

    function handleOpenFlow() {
        if (clientePreSelecionado) {
            setSelectedCliente(clientePreSelecionado);
            setOpenCarta(true);
            return;
        }

        setOpenSelector(true);
    }

    function handleSelectCliente(cliente: ClienteCartaOption) {
        setSelectedCliente(cliente);
        setOpenSelector(false);

        window.setTimeout(() => {
            setOpenCarta(true);
        }, 50);
    }

    return (
        <>
            <Button
                type="button"
                variant={triggerVariant}
                className={triggerClassName}
                onClick={handleOpenFlow}
            >
                {triggerIcon ?? <PlusCircle className="mr-2 h-4 w-4" />}
                {triggerLabel ? <span>{triggerLabel}</span> : null}
            </Button>

            <Dialog open={openSelector} onOpenChange={setOpenSelector}>
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>Selecionar cliente</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                placeholder="Buscar por nome, email ou telefone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
                            {filtered.map((cliente) => (
                                <button
                                    key={cliente.id}
                                    type="button"
                                    onClick={() => handleSelectCliente(cliente)}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]"
                                >
                                    <div className="font-medium text-foreground">{cliente.nome}</div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        {cliente.email || cliente.telefone || "Sem contato"}
                                    </div>
                                </button>
                            ))}

                            {filtered.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center text-sm text-muted-foreground">
                                    Nenhum cliente encontrado.
                                </div>
                            ) : null}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/*<CartaSheet*/}
            {/*    open={openCarta}*/}
            {/*    onOpenChange={setOpenCarta}*/}
            {/*    mode="create"*/}
            {/*    data={data}*/}
            {/*    onSuccess={() => {*/}
            {/*        setOpenCarta(false);*/}
            {/*        fireConfetti();*/}
            {/*        toast.success("Carta cadastrada com sucesso!");*/}
            {/*    }}*/}
            {/*/>*/}
        </>
    );
}