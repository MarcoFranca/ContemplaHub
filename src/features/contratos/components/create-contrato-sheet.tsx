"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ContratoFormShellV2 } from "./contrato-form-shell-v2";
import type {
    AdministradoraOption,
    ContratoFormMode,
    ParceiroOption,
} from "../types/contrato-form.types";

interface CreateContratoSheetProps {
    mode: ContratoFormMode;
    leadId: string;
    dealId?: string | null;
    administradoras: AdministradoraOption[];
    parceiros?: ParceiroOption[];
    trigger: React.ReactNode;
}

export function CreateContratoSheet({
                                        mode,
                                        leadId,
                                        dealId,
                                        administradoras,
                                        parceiros = [],
                                        trigger,
                                    }: CreateContratoSheetProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>

            <SheetContent
                side="right"
                className="w-full overflow-y-auto sm:max-w-[900px]"
            >
                <SheetHeader className="mb-6">
                    <SheetTitle>
                        {mode === "fromLead"
                            ? "Novo contrato"
                            : "Cadastrar contrato existente"}
                    </SheetTitle>

                    <SheetDescription>
                        {mode === "fromLead"
                            ? "Formalize a venda com contrato e carta/cota."
                            : "Cadastre uma carta/contrato de cliente já ativo na carteira."}
                    </SheetDescription>
                </SheetHeader>

                <ContratoFormShellV2
                    mode={mode}
                    leadId={leadId}
                    dealId={dealId}
                    administradoras={administradoras}
                    parceiros={parceiros}
                />
            </SheetContent>
        </Sheet>
    );
}