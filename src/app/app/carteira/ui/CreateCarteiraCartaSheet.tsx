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
    administradoras: AdministradoraOption[];
    parceiros?: ParceiroOption[];
    triggerLabel?: string;
    triggerVariant?: "default" | "outline" | "secondary";
}

export function CreateCarteiraCartaSheet({
                                             clientes,
                                             administradoras,
                                             parceiros = [],
                                             triggerLabel = "Cadastrar carta",
                                             triggerVariant = "outline",
                                         }: Props) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [clienteId, setClienteId] = React.useState<string>("");

    const clienteSelecionado = React.useMemo(
        () => clientes.find((cliente) => cliente.id === clienteId) ?? null,
        [clientes, clienteId]
    );

    function handleCloseAndRefresh() {
        setOpen(false);
        setClienteId("");
        router.refresh();
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant={triggerVariant}>{triggerLabel}</Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="w-full overflow-y-auto sm:max-w-[980px]"
            >
                <SheetHeader className="mb-6">
                    <SheetTitle>
                        {!clienteSelecionado ? "Selecionar cliente" : "Cadastrar carta / contrato"}
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
                            <Select value={clienteId} onValueChange={setClienteId}>
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
                ) : (
                    <ContratoFormShellV2
                        mode="registerExisting"
                        leadId={clienteSelecionado.id}
                        administradoras={administradoras}
                        parceiros={parceiros}
                        onSuccess={() => handleCloseAndRefresh()}
                        insideSheet
                    />
                )}
            </SheetContent>
        </Sheet>
    );
}