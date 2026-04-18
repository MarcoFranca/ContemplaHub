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

import { CartaCadastroSuccessDialog } from "./CartaCadastroSuccessDialog";
import { CartaPostSaveDocumentStep } from "./CartaPostSaveDocumentStep";

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

type PostSaveMode = "form" | "document";

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

  const [savedContractId, setSavedContractId] = React.useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [postSaveMode, setPostSaveMode] = React.useState<PostSaveMode>("form");

  const clienteSelecionado = React.useMemo(
      () => clientes.find((cliente) => cliente.id === selectedClienteId) ?? null,
      [clientes, selectedClienteId]
  );

  function resetInternalState() {
    setSavedContractId(null);
    setShowSuccessDialog(false);
    setPostSaveMode("form");

    if (!clienteId) {
      setSelectedClienteId("");
    } else {
      setSelectedClienteId(clienteId);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen && clienteId) {
      setSelectedClienteId(clienteId);
    }

    if (!nextOpen) {
      resetInternalState();
    }
  }

  function handleCadastroSuccess(params: { contractId: string | null }) {
    setSavedContractId(params.contractId ?? null);
    setShowSuccessDialog(true);
    router.refresh();
  }

  function handleFinishFlow() {
    setShowSuccessDialog(false);
    setOpen(false);
    resetInternalState();
    router.refresh();
  }

  function handleAddDocumentNow() {
    setShowSuccessDialog(false);
    setPostSaveMode("document");
  }

  const hiddenTitle = clienteSelecionado
      ? "Cadastrar carta da carteira"
      : "Selecionar cliente da carteira";

  const hiddenDescription = clienteSelecionado
      ? `Cadastro de carta e contrato para ${clienteSelecionado.nome}.`
      : "Escolha um cliente da carteira para iniciar o cadastro.";

  return (
      <>
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
              size="full"
              className="overflow-hidden border-l border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.10),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(37,99,235,0.14),_transparent_30%),linear-gradient(180deg,_#07111f_0%,_#091427_42%,_#08111d_100%)] p-0 text-white"
          >
            <SheetTitle className="sr-only">{hiddenTitle}</SheetTitle>
            <SheetDescription className="sr-only">
              {hiddenDescription}
            </SheetDescription>

            <div className="flex h-full min-h-0 flex-col">
              <div className="border-b border-white/10 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                <SheetHeader className="space-y-4 text-left">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                    Experiência premium de cadastro
                  </div>

                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                      <SheetTitle className="text-3xl font-semibold tracking-tight text-white">
                        {!clienteSelecionado
                            ? "Cadastro de carta da carteira"
                            : postSaveMode === "document"
                                ? "Documento do contrato"
                                : "Cadastrar carta / contrato"}
                      </SheetTitle>

                      <SheetDescription className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                        {!clienteSelecionado
                            ? "Escolha um cliente da carteira para iniciar o cadastro com contexto, fluidez e leitura operacional."
                            : postSaveMode === "document"
                                ? `Cadastro concluído para ${clienteSelecionado.nome}. Agora você pode anexar o documento do contrato.`
                                : `Cadastro para ${clienteSelecionado.nome}. Fluxo guiado, elegante e integrado ao operacional da carteira.`}
                      </SheetDescription>
                    </div>

                    {clienteSelecionado ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Cliente selecionado
                          </div>
                          <div className="mt-1 text-sm font-medium text-slate-100">
                            {clienteSelecionado.nome}
                          </div>
                          {clienteSelecionado.telefone || clienteSelecionado.email ? (
                              <div className="mt-1 text-xs text-slate-400">
                                {clienteSelecionado.telefone ?? clienteSelecionado.email}
                              </div>
                          ) : null}
                        </div>
                    ) : null}
                  </div>
                </SheetHeader>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-8">
                {!clienteSelecionado ? (
                    <div className="mx-auto max-w-2xl">
                      <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6">
                        <div className="space-y-2">
                          <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                            Seleção inicial
                          </div>
                          <h3 className="text-2xl font-semibold text-white">
                            Escolha o cliente
                          </h3>
                          <p className="text-sm leading-6 text-slate-300">
                            Selecione um cliente da carteira para abrir o fluxo
                            completo de cadastro da carta.
                          </p>
                        </div>

                        <div className="mt-6 space-y-2">
                          <Label className="text-slate-200">Cliente</Label>
                          <Select
                              value={selectedClienteId}
                              onValueChange={setSelectedClienteId}
                          >
                            <SelectTrigger className="h-12 border-white/10 bg-white/[0.03] text-white">
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
                    </div>
                ) : administradoras.length === 0 ? (
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                      Não foi possível carregar as administradoras. Recarregue a
                      página e tente novamente.
                    </div>
                ) : postSaveMode === "document" && savedContractId ? (
                    <CartaPostSaveDocumentStep
                        contractId={savedContractId}
                        onFinish={handleFinishFlow}
                    />
                ) : (
                    <ContratoFormShellV2
                        mode="registerExisting"
                        leadId={clienteSelecionado.id}
                        administradoras={administradoras}
                        parceiros={parceiros}
                        onSuccess={handleCadastroSuccess}
                        insideSheet
                    />
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <CartaCadastroSuccessDialog
            open={showSuccessDialog}
            onOpenChange={setShowSuccessDialog}
            onAddDocumentNow={handleAddDocumentNow}
            onFinish={handleFinishFlow}
        />
      </>
  );
}