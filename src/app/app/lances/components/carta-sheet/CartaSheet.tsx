// "use client";
//
// import * as React from "react";
// import {
//     Sheet,
//     SheetContent,
//     SheetDescription,
//     SheetHeader,
//     SheetTitle,
// } from "@/components/ui/sheet";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
//
// import type { EditCartaSheetInitialData } from "@/app/app/lances/[cotaId]/components/edit-carta-v2/types";
// import { CartaGeralForm } from "@/app/app/lances/[cotaId]/components/edit-carta-v2/forms/CartaGeralForm";
// import { CartaEstrategiaForm } from "@/app/app/lances/[cotaId]/components/edit-carta-v2/forms/CartaEstrategiaForm";
// import { CartaModalidadesForm } from "@/app/app/lances/[cotaId]/components/edit-carta-v2/forms/CartaModalidadesForm";
// import { CartaOperacaoForm } from "@/app/app/lances/[cotaId]/components/edit-carta-v2/forms/CartaOperacaoForm";
// import { CartaComissoesForm } from "@/app/app/lances/[cotaId]/components/edit-carta-v2/forms/CartaComissoesForm";
// import { ContratoPdfUploadCard } from "./ContratoPdfUploadCard";
// import {CartaContratoTab} from "@/app/app/lances/[cotaId]/components/edit-carta-v2/forms/CartaContratoTab";
//
// type CartaSheetMode = "create" | "edit";
//
// type CartaSheetTab =
//     | "contrato"
//     | "geral"
//     | "operacao"
//     | "estrategia"
//     | "modalidades"
//     | "comissoes";
//
// type AdministradoraOption = {
//     id: string;
//     nome: string;
// };
//
// type Props = {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//     mode: CartaSheetMode;
//     administradoras?: { id: string; nome: string }[];
//     data: EditCartaSheetInitialData & {
//         contractId?: string | null;
//         clienteId?: string | null;
//         clienteNome?: string | null;
//     };
//     onSuccess?: (result?: { cotaId?: string; contractId?: string }) => void;
// };
//
// function normalizeProduto(
//         value: string | null | undefined
//     ): "imobiliario" | "auto" {
//         return value === "auto" ? "auto" : "imobiliario";
//     }
//
//     function normalizeStatus(
//         value: string | null | undefined
//     ): "ativa" | "contemplada" | "cancelada" {
//         if (value === "contemplada") return "contemplada";
//         if (value === "cancelada") return "cancelada";
//         return "ativa";
//     }
//
// export function CartaSheet({
//                                open,
//                                onOpenChange,
//                                mode,
//                                administradoras,
//                                data,
//                                onSuccess,
//                            }: Props) {
//     const [tab, setTab] = React.useState<CartaSheetTab>(
//         mode === "create" ? "contrato" : "geral"
//     );
//     const [currentMode, setCurrentMode] = React.useState<CartaSheetMode>(mode);
//     const [currentData, setCurrentData] = React.useState(data);
//
//     React.useEffect(() => {
//         if (open) {
//             setCurrentMode(mode);
//             setCurrentData(data);
//             setTab(mode === "create" ? "contrato" : "geral");
//         }
//     }, [open, mode, data]);
//
//     const hasCotaId = Boolean(currentData.cotaId);
//     const hasContractId = Boolean(currentData.contractId);
//     const tabsLocked = currentMode === "create" && (!hasCotaId || !hasContractId);
//
//     function handleCreated(payload: {
//         contractId: string;
//         cotaId: string;
//         values: {
//             grupoCodigo: string;
//             numeroCota: string;
//             produto: "imobiliario" | "auto";
//             status: "ativa" | "contemplada" | "cancelada";
//             dataAdesao?: string | null;
//             prazo: number | null;
//             valorCarta: number | null;
//             valorParcela: number | null;
//         };
//     }) {
//         setCurrentData((prev) => ({
//             ...prev,
//             cotaId: payload.cotaId,
//             contractId: payload.contractId,
//             geral: {
//                 ...prev.geral,
//                 ...payload.values,
//             },
//         }));
//
//         setCurrentMode("edit");
//         setTab("geral");
//         onSuccess?.({
//             cotaId: payload.cotaId,
//             contractId: payload.contractId,
//         });
//     }
//
//     const contratoInitialValues = {
//         grupoCodigo: currentData.geral.grupoCodigo ?? "",
//         numeroCota: currentData.geral.numeroCota ?? "",
//         produto: normalizeProduto(currentData.geral.produto),
//         status: normalizeStatus(currentData.geral.status),
//         dataAdesao: currentData.geral.dataAdesao ?? "",
//         prazo: currentData.geral.prazo ?? null,
//         valorCarta: currentData.geral.valorCarta ?? null,
//         valorParcela: currentData.geral.valorParcela ?? null,
//     };
//
//
//     return (
//         <Sheet open={open} onOpenChange={onOpenChange}>
//             <SheetContent
//                 side="right"
//                 className="w-full max-w-none overflow-hidden p-0 sm:max-w-6xl"
//             >
//                 <div className="flex h-full min-h-0 flex-col bg-background">
//                     <div className="shrink-0 border-b bg-background">
//                         <SheetHeader className="px-6 py-4 text-left">
//                             <SheetTitle>
//                                 {currentMode === "create" ? "Nova carta" : "Editar carta"}
//                             </SheetTitle>
//                             <SheetDescription>
//                                 {currentMode === "create"
//                                     ? "Formalize o contrato primeiro e depois conclua a configuração da carta."
//                                     : `Grupo ${currentData.geral.grupoCodigo || "—"} · Cota ${
//                                         currentData.geral.numeroCota || "—"
//                                     } · ${currentData.geral.produto || "imobiliario"}`}
//                             </SheetDescription>
//                         </SheetHeader>
//
//                         <div className="px-6 pb-4">
//                             <Tabs
//                                 value={tab}
//                                 onValueChange={(value) => setTab(value as CartaSheetTab)}
//                                 className="flex min-h-0 flex-1 flex-col"
//                             >
//                                 <TabsList className="grid w-full grid-cols-6">
//                                     <TabsTrigger value="contrato">Contrato</TabsTrigger>
//                                     <TabsTrigger value="geral" disabled={tabsLocked}>
//                                         Geral
//                                     </TabsTrigger>
//                                     <TabsTrigger value="operacao" disabled={tabsLocked}>
//                                         Operação
//                                     </TabsTrigger>
//                                     <TabsTrigger value="estrategia" disabled={tabsLocked}>
//                                         Estratégia
//                                     </TabsTrigger>
//                                     <TabsTrigger value="modalidades" disabled={tabsLocked}>
//                                         Modalidades
//                                     </TabsTrigger>
//                                     <TabsTrigger value="comissoes" disabled={tabsLocked}>
//                                         Comissões
//                                     </TabsTrigger>
//                                 </TabsList>
//
//                                 {tabsLocked ? (
//                                     <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
//                                         Salve a aba <strong>Contrato</strong> primeiro para criar a cota e liberar as demais configurações.
//                                     </div>
//                                 ) : null}
//
//                                 <div className="mt-4 min-h-0 flex-1 overflow-hidden">
//                                     <div className="h-[calc(100dvh-220px)] overflow-y-auto">
//                                         <div className="space-y-6 px-1 pb-10">
//                                             <TabsContent value="contrato" className="mt-0">
//                                                 <CartaContratoTab
//                                                     leadId={currentData.clienteId ?? ""}
//                                                     leadName={currentData.clienteNome ?? "Cliente"}
//                                                     administradoras={administradoras ?? []}
//                                                     onCreated={({ contractId, cotaId }) => {
//                                                         handleCreated({
//                                                             contractId,
//                                                             cotaId,
//                                                             values: {
//                                                                 grupoCodigo: contratoInitialValues.grupoCodigo,
//                                                                 numeroCota: contratoInitialValues.numeroCota,
//                                                                 produto: contratoInitialValues.produto,
//                                                                 status: contratoInitialValues.status,
//                                                                 dataAdesao: contratoInitialValues.dataAdesao,
//                                                                 prazo: contratoInitialValues.prazo,
//                                                                 valorCarta: contratoInitialValues.valorCarta,
//                                                                 valorParcela: contratoInitialValues.valorParcela,
//                                                             },
//                                                         });
//                                                     }}
//                                                 />
//                                             </TabsContent>
//
//                                             <TabsContent value="geral" className="mt-0 space-y-4">
//                                                 {hasCotaId ? (
//                                                     <>
//                                                         <CartaGeralForm
//                                                             mode="edit"
//                                                             cotaId={currentData.cotaId}
//                                                             initialValues={currentData.geral}
//                                                         />
//
//                                                         <ContratoPdfUploadCard
//                                                             contractId={currentData.contractId ?? null}
//                                                         />
//                                                     </>
//                                                 ) : null}
//                                             </TabsContent>
//
//                                             <TabsContent value="operacao" className="mt-0">
//                                                 {hasCotaId ? (
//                                                     <CartaOperacaoForm
//                                                         cotaId={currentData.cotaId}
//                                                         competencia={currentData.competencia}
//                                                         initialValues={currentData.operacao}
//                                                     />
//                                                 ) : null}
//                                             </TabsContent>
//
//                                             <TabsContent value="estrategia" className="mt-0">
//                                                 {hasCotaId ? (
//                                                     <CartaEstrategiaForm
//                                                         cotaId={currentData.cotaId}
//                                                         initialValues={currentData.estrategia}
//                                                     />
//                                                 ) : null}
//                                             </TabsContent>
//
//                                             <TabsContent value="modalidades" className="mt-0">
//                                                 {hasCotaId ? (
//                                                     <CartaModalidadesForm
//                                                         cotaId={currentData.cotaId}
//                                                         initialValues={currentData.modalidades}
//                                                     />
//                                                 ) : null}
//                                             </TabsContent>
//
//                                             <TabsContent value="comissoes" className="mt-0">
//                                                 {hasCotaId ? (
//                                                     <CartaComissoesForm
//                                                         cotaId={currentData.cotaId}
//                                                         dataAdesao={currentData.geral.dataAdesao ?? null}
//                                                         grupoCodigo={currentData.geral.grupoCodigo}
//                                                         numeroCota={currentData.geral.numeroCota}
//                                                         produto={currentData.geral.produto as "imobiliario" | "auto"}
//                                                         valorCarta={currentData.geral.valorCarta ?? 0}
//                                                         onSuccess={() =>
//                                                             onSuccess?.({
//                                                                 cotaId: currentData.cotaId,
//                                                                 contractId: currentData.contractId ?? undefined,
//                                                             })
//                                                         }
//                                                     />
//                                                 ) : null}
//                                             </TabsContent>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </Tabs>
//                         </div>
//                     </div>
//
//                     <div className="sticky bottom-0 z-20 shrink-0 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
//                         <div className="flex items-center justify-end gap-2">
//                             <Button variant="ghost" onClick={() => onOpenChange(false)}>
//                                 Fechar
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </SheetContent>
//         </Sheet>
//     );
// }