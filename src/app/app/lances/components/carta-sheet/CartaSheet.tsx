"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import type { EditCartaSheetInitialData } from "@/app/app/lances/[cotaId]/components/edit-carta-v2/types";
import { CartaGeralForm } from "@/app/app/lances/[cotaId]/components/edit-carta-v2/forms/CartaGeralForm";
import { CartaEstrategiaForm } from "@/app/app/lances/[cotaId]/components/edit-carta-v2/forms/CartaEstrategiaForm";
import { CartaModalidadesForm } from "@/app/app/lances/[cotaId]/components/edit-carta-v2/forms/CartaModalidadesForm";
import { CartaOperacaoForm } from "@/app/app/lances/[cotaId]/components/edit-carta-v2/forms/CartaOperacaoForm";
import { CartaComissoesForm } from "@/app/app/lances/[cotaId]/components/edit-carta-v2/forms/CartaComissoesForm";
import { ContratoPdfUploadCard } from "./ContratoPdfUploadCard";

type CartaSheetMode = "create" | "edit";

type CartaSheetTab =
    | "geral"
    | "operacao"
    | "estrategia"
    | "modalidades"
    | "comissoes";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: CartaSheetMode;
    data: EditCartaSheetInitialData & {
        contractId?: string | null;
    };
    onSuccess?: (result?: { cotaId?: string }) => void;
};

export function CartaSheet({
                               open,
                               onOpenChange,
                               mode,
                               data,
                               onSuccess,
                           }: Props) {
    const [tab, setTab] = React.useState<CartaSheetTab>("geral");

    const isCreate = mode === "create";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full max-w-none overflow-hidden p-0 sm:max-w-5xl"
            >
                <div className="flex h-full min-h-0 flex-col bg-background">
                    {/* Header */}
                    <div className="shrink-0 border-b bg-background">
                        <SheetHeader className="px-6 py-4 text-left">
                            <SheetTitle>{isCreate ? "Nova carta" : "Editar carta"}</SheetTitle>
                            <SheetDescription>
                                Grupo {data.geral.grupoCodigo || "—"} · Cota {data.geral.numeroCota || "—"} ·{" "}
                                {data.geral.produto || "imobiliario"}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="px-6 pb-4">
                            <Tabs
                                value={tab}
                                onValueChange={(value) => setTab(value as CartaSheetTab)}
                                className="flex min-h-0 flex-1 flex-col"
                            >
                                <TabsList className="grid w-full grid-cols-5">
                                    <TabsTrigger value="geral">Geral</TabsTrigger>
                                    <TabsTrigger value="operacao">Operação</TabsTrigger>
                                    <TabsTrigger value="estrategia">Estratégia</TabsTrigger>
                                    <TabsTrigger value="modalidades">Modalidades</TabsTrigger>
                                    <TabsTrigger value="comissoes">Comissões</TabsTrigger>
                                </TabsList>

                                <div className="mt-4 min-h-0 flex-1 overflow-hidden">
                                    <div className="h-[calc(100dvh-210px)] overflow-y-auto">
                                        <div className="space-y-6 px-1 pb-10">
                                            <TabsContent value="geral" className="mt-0 space-y-4">
                                                <CartaGeralForm
                                                    cotaId={data.cotaId}
                                                    initialValues={data.geral}
                                                />

                                                <ContratoPdfUploadCard
                                                    contractId={data.contractId ?? null}
                                                />
                                            </TabsContent>

                                            <TabsContent value="operacao" className="mt-0">
                                                <CartaOperacaoForm
                                                    cotaId={data.cotaId}
                                                    competencia={data.competencia}
                                                    initialValues={data.operacao}
                                                />
                                            </TabsContent>

                                            <TabsContent value="estrategia" className="mt-0">
                                                <CartaEstrategiaForm
                                                    cotaId={data.cotaId}
                                                    initialValues={data.estrategia}
                                                />
                                            </TabsContent>

                                            <TabsContent value="modalidades" className="mt-0">
                                                <CartaModalidadesForm
                                                    cotaId={data.cotaId}
                                                    initialValues={data.modalidades}
                                                />
                                            </TabsContent>

                                            <TabsContent value="comissoes" className="mt-0">
                                                <CartaComissoesForm
                                                    cotaId={data.cotaId}
                                                    dataAdesao={data.geral.dataAdesao ?? null}
                                                    grupoCodigo={data.geral.grupoCodigo}
                                                    numeroCota={data.geral.numeroCota}
                                                    produto={data.geral.produto as "imobiliario" | "auto"}
                                                    valorCarta={data.geral.valorCarta ?? 0}
                                                    onSuccess={() => onSuccess?.({ cotaId: data.cotaId })}
                                                />
                                            </TabsContent>
                                        </div>
                                    </div>
                                </div>
                            </Tabs>
                        </div>
                    </div>

                    {/* Footer global: só fechar */}
                    <div className="sticky bottom-0 z-20 shrink-0 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                        <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" onClick={() => onOpenChange(false)}>
                                Fechar
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}