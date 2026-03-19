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

import type { EditCartaSheetInitialData } from "./types";
import { CartaGeralForm } from "./forms/CartaGeralForm";
import { CartaEstrategiaForm } from "./forms/CartaEstrategiaForm";
import { CartaModalidadesForm } from "./forms/CartaModalidadesForm";
import { CartaOperacaoForm } from "./forms/CartaOperacaoForm";
import { CartaComissoesForm } from "./forms/CartaComissoesForm";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: EditCartaSheetInitialData;
    onSuccess?: () => void;
};

type EditTab =
    | "geral"
    | "estrategia"
    | "modalidades"
    | "operacao"
    | "comissoes";

export function EditCartaSheetV2({
                                     open,
                                     onOpenChange,
                                     data,
                                     onSuccess,
                                 }: Props) {
    const [tab, setTab] = React.useState<EditTab>("geral");

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full overflow-hidden p-0 sm:max-w-5xl">
                <div className="flex h-full flex-col">
                    <SheetHeader className="shrink-0 border-b px-6 py-4 text-left">
                        <SheetTitle>Editar carta</SheetTitle>
                        <SheetDescription>
                            Grupo {data.geral.grupoCodigo} · Cota {data.geral.numeroCota} ·{" "}
                            {data.geral.produto}
                        </SheetDescription>
                    </SheetHeader>

                    <Tabs
                        value={tab}
                        onValueChange={(value) => setTab(value as EditTab)}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <div className="shrink-0 border-b px-6 py-3">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="geral">Geral</TabsTrigger>
                                <TabsTrigger value="estrategia">Estratégia</TabsTrigger>
                                <TabsTrigger value="modalidades">Modalidades</TabsTrigger>
                                <TabsTrigger value="operacao">Operação</TabsTrigger>
                                <TabsTrigger value="comissoes">Comissões</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                            <TabsContent value="geral" className="mt-0">
                                <CartaGeralForm cotaId={data.cotaId} initialValues={data.geral} />
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

                            <TabsContent value="operacao" className="mt-0">
                                <CartaOperacaoForm
                                    cotaId={data.cotaId}
                                    competencia={data.competencia}
                                    initialValues={data.operacao}
                                />
                            </TabsContent>

                            <TabsContent value="comissoes" className="mt-0">
                                <CartaComissoesForm
                                    cotaId={data.cotaId}
                                    dataAdesao={data.geral.dataAdesao ?? null}
                                    grupoCodigo={data.geral.grupoCodigo}
                                    numeroCota={data.geral.numeroCota}
                                    produto={data.geral.produto as "imobiliario" | "auto"}
                                    onSuccess={onSuccess}
                                />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}