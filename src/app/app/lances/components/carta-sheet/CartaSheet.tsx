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
    data: EditCartaSheetInitialData;
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
            <SheetContent side="right" className="w-full overflow-hidden p-0 sm:max-w-5xl">
                <div className="flex h-full flex-col">
                    <SheetHeader className="shrink-0 border-b px-6 py-4 text-left">
                        <SheetTitle>{isCreate ? "Nova carta" : "Editar carta"}</SheetTitle>
                        <SheetDescription>
                            Grupo {data.geral.grupoCodigo || "—"} · Cota {data.geral.numeroCota || "—"} ·{" "}
                            {data.geral.produto || "imobiliario"}
                        </SheetDescription>
                    </SheetHeader>

                    <Tabs
                        value={tab}
                        onValueChange={(value) => setTab(value as CartaSheetTab)}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <div className="shrink-0 border-b px-6 py-3">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="geral">Geral</TabsTrigger>
                                <TabsTrigger value="operacao">Operação</TabsTrigger>
                                <TabsTrigger value="estrategia">Estratégia</TabsTrigger>
                                <TabsTrigger value="modalidades">Modalidades</TabsTrigger>
                                <TabsTrigger value="comissoes">Comissões</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                            <TabsContent value="geral" className="mt-0 space-y-4">
                                <CartaGeralForm cotaId={data.cotaId} initialValues={data.geral} />

                                <ContratoPdfUploadCard
                                    cotaId={data.cotaId}
                                    contratoId={undefined}
                                    disabled={isCreate && !data.cotaId}
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
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}