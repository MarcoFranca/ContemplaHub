"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mail, Pencil, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { SectionFX } from "@/components/marketing/SectionFX";
import { updateCarteiraClienteContatoAction } from "../actions/clientes";

type Props = {
    lead: {
        id: string;
        nome: string | null;
        telefone: string | null;
        email: string | null;
    };
    compact?: boolean;
};

export function EditClienteCarteiraSheet({ lead, compact = false }: Props) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {compact ? (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Editar cliente
                    </Button>
                )}
            </SheetTrigger>

            <SheetContent
                side="right"
                className="isolate w-[400px] border-l border-white/10 bg-slate-950/70 px-0 shadow-2xl backdrop-blur-xl sm:w-[560px]"
            >
                <SectionFX preset="nebula" variant="emerald" showGrid className="absolute inset-0 -z-10" />

                <SheetHeader className="border-b border-white/10 px-6 pb-3 pt-6">
                    <SheetTitle className="flex items-center gap-2 text-base">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/30">
                            <Pencil className="h-3.5 w-3.5 text-emerald-300" />
                        </span>
                        Editar contato do cliente
                    </SheetTitle>
                </SheetHeader>

                <form
                    action={async (formData: FormData) => {
                        const toastId = toast.loading("Salvando alteracoes...");
                        const result = await updateCarteiraClienteContatoAction(lead.id, formData);

                        if (!result.ok) {
                            toast.error(result.error, { id: toastId });
                            return;
                        }

                        toast.success("Cliente atualizado com sucesso!", { id: toastId });
                        setOpen(false);
                        router.refresh();
                    }}
                    className="relative flex h-[calc(100dvh-56px)] flex-col overflow-hidden"
                >
                    <div className="flex-1 space-y-6 overflow-auto px-6 py-5">
                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Dados principais
                            </legend>

                            <div className="mt-3 space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nome" className="flex items-center gap-2 text-xs">
                                        <UserRound className="h-3.5 w-3.5" />
                                        Nome
                                    </Label>
                                    <Input id="nome" name="nome" required defaultValue={lead.nome ?? ""} />
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="telefone" className="flex items-center gap-2 text-xs">
                                            <Phone className="h-3.5 w-3.5" />
                                            Telefone
                                        </Label>
                                        <Input
                                            id="telefone"
                                            name="telefone"
                                            defaultValue={lead.telefone ?? ""}
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="flex items-center gap-2 text-xs">
                                            <Mail className="h-3.5 w-3.5" />
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            defaultValue={lead.email ?? ""}
                                            placeholder="cliente@email.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    <SheetFooter className="sticky bottom-0 w-full border-t border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-xl">
                        <div className="flex w-full items-center justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500">
                                Salvar alteracoes
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
