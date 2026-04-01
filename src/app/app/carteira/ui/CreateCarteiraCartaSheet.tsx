"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { ContratoFormShellV2 } from "@/features/contratos/components/contrato-form-shell-v2";
import type {
    AdministradoraOption,
    ParceiroOption,
} from "@/features/contratos/types/contrato-form.types";

export type ClienteCartaOption = {
    id: string;
    nome: string;
    telefone?: string;
    email?: string;
};

interface Props {
    clientes: ClienteCartaOption[];
    administradoras?: AdministradoraOption[];
    parceiros?: ParceiroOption[];

    clienteId?: string;

    triggerLabel?: string;
    triggerVariant?: "default" | "outline" | "secondary" | "ghost";
    triggerClassName?: string;
    triggerIcon?: React.ReactNode;
}

export function CreateCarteiraCartaSheet({
                                             clientes,
                                             administradoras = [],
                                             parceiros = [],
                                             clienteId,
                                             triggerLabel = "Cadastrar carta",
                                             triggerVariant = "outline",
                                             triggerClassName,
                                             triggerIcon,
                                         }: Props) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [selectedClienteId, setSelectedClienteId] = React.useState<string>(
        clienteId ?? ""
    );
    console.log("administradoras sheet", administradoras);
    const clienteSelecionado = React.useMemo(
        () => clientes.find((cliente) => cliente.id === selectedClienteId) ?? null,
        [clientes, selectedClienteId]
    );

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);

        if (nextOpen && clienteId) {
            setSelectedClienteId(clienteId);
        }

        if (!nextOpen && !clienteId) {
            setSelectedClienteId("");
        }
    }

    function handleCloseAndRefresh() {
        setOpen(false);
        setSelectedClienteId(clienteId ?? "");
        router.refresh();
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button
                    type="button"
                    variant={triggerVariant}
                    size={triggerLabel ? "default" : "icon"}
                    className={triggerClassName}
                >
                    {triggerIcon}
                    {triggerLabel ? <span>{triggerLabel}</span> : null}
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="w-full overflow-y-auto sm:max-w-[980px]"
            >
                <SheetHeader className="mb-6">
                    <SheetTitle>
                        {!clienteSelecionado
                            ? "Selecionar cliente"
                            : "Cadastrar carta / contrato"}
                    </SheetTitle>

                    <SheetDescription>
                        {!clienteSelecionado
                            ? "Escolha um cliente da carteira para cadastrar uma nova carta e contrato."
                            : `Cadastro para ${clienteSelecionado.nome}.`}
                    </SheetDescription>
                </SheetHeader>

                {!clienteSelecionado ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Cliente</Label>
                            <Select
                                value={selectedClienteId}
                                onValueChange={setSelectedClienteId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientes.map((cliente) => (
                                        <SelectItem key={cliente.id} value={cliente.id}>
                                            {cliente.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : administradoras.length === 0 ? (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                        Não foi possível carregar as administradoras. Recarregue a página e tente novamente.
                    </div>
                ) : (
                    <ContratoFormShellV2
                        mode="registerExisting"
                        leadId={clienteSelecionado.id}
                        administradoras={administradoras}
                        parceiros={parceiros}
                        onSuccess={handleCloseAndRefresh}
                        insideSheet
                    />
                )}
            </SheetContent>
        </Sheet>
    );
}