"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Plus, Users } from "lucide-react";
import { toast } from "sonner";

import { createClienteCarteiraAction } from "../novo/actions";
import { BrazilPhoneInput } from "@/components/app/shared/SmartInputs";
import { SectionFX } from "@/components/marketing/SectionFX";

type Props = {
    variant?: "button" | "fab";
};

export function CreateCarteiraClienteSheet({ variant = "button" }: Props) {
    const [open, setOpen] = React.useState(false);

    const trigger =
        variant === "fab" ? (
            <Button
                className="h-8 w-8 p-0 shadow-lg bg-emerald-600 hover:bg-emerald-500"
                title="Novo cliente da carteira"
            >
                <Plus className="h-6 w-6 text-white" />
            </Button>
        ) : (
            <Button>
                <Users className="mr-2 h-4 w-4" />
                Novo cliente
            </Button>
        );

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>

            <SheetContent
                side="right"
                className="
          isolate
          w-[400px] sm:w-[520px]
          bg-slate-950/70 backdrop-blur-xl
          border-l border-white/10 shadow-2xl px-0
        "
            >
                <SectionFX preset="nebula" variant="emerald" showGrid className="absolute inset-0 -z-10" />

                <SheetHeader className="px-6 pt-6 pb-3 border-b border-white/10">
                    <SheetTitle className="flex items-center gap-2 text-base">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/30">
              <Users className="h-3.5 w-3.5 text-emerald-300" />
            </span>
                        Novo cliente da carteira
                    </SheetTitle>
                </SheetHeader>

                <form
                    action={async (fd: FormData) => {
                        toast.dismiss();
                        toast.loading("Criando cliente...");

                        const result = await createClienteCarteiraAction({}, fd);

                        toast.dismiss();

                        if (result?.error) {
                            toast.error(result.error);
                            return;
                        }

                        toast.success("Cliente criado com sucesso!");
                        setOpen(false);

                        window.location.reload();
                    }}
                    className="relative flex h-[calc(100dvh-56px)] flex-col overflow-hidden"
                >
                    <div className="flex-1 overflow-auto px-6 py-5 space-y-6">
                        {/* IDENTIFICAÇÃO */}
                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Cliente
                            </legend>

                            <div className="mt-3 space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nome" className="text-xs">
                                        Nome
                                    </Label>
                                    <Input
                                        id="nome"
                                        name="nome"
                                        required
                                        placeholder="Ex.: João Silva"
                                    />
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Telefone</Label>
                                        <BrazilPhoneInput
                                            nameDisplay="telefone_visual"
                                            nameNormalized="telefone"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-xs">
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="cliente@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="observacoes" className="text-xs">
                                        Observações
                                    </Label>
                                    <Textarea
                                        id="observacoes"
                                        name="observacoes"
                                        placeholder="Notas iniciais sobre o cliente"
                                        className="min-h-[96px]"
                                    />
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    <SheetFooter className="sticky bottom-0 w-full bg-slate-950/80 backdrop-blur-xl border-t border-white/10 px-6 py-4">
                        <div className="flex w-full items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-500"
                            >
                                Salvar cliente
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}