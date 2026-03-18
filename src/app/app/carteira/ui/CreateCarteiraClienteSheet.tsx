"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Mail, MapPin, Phone, Plus, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { createClienteCarteiraAction } from "../novo/actions";
import { BrazilPhoneInput } from "@/components/app/shared/SmartInputs";
import { SectionFX } from "@/components/marketing/SectionFX";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Props = {
    variant?: "button" | "fab";
};

export function CreateCarteiraClienteSheet({ variant = "button" }: Props) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [showExtra, setShowExtra] = React.useState(false);

    const trigger =
        variant === "fab" ? (
            <Button
                className="h-8 w-8 bg-emerald-600 p-0 shadow-lg hover:bg-emerald-500"
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
                className="isolate w-[400px] border-l border-white/10 bg-slate-950/70 px-0 shadow-2xl backdrop-blur-xl sm:w-[560px]"
            >
                <SectionFX preset="nebula" variant="emerald" showGrid className="absolute inset-0 -z-10" />

                <SheetHeader className="border-b border-white/10 px-6 pt-6 pb-3">
                    <SheetTitle className="flex items-center gap-2 text-base">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/30">
              <Users className="h-3.5 w-3.5 text-emerald-300" />
            </span>
                        Novo cliente da carteira
                    </SheetTitle>
                </SheetHeader>

                <form
                    action={async (fd: FormData) => {
                        const toastId = toast.loading("Criando cliente...");

                        try {
                            const result = await createClienteCarteiraAction({}, fd);

                            if (result && typeof result === "object" && "error" in result && result.error) {
                                toast.error(String(result.error), { id: toastId });
                                return;
                            }

                            toast.success("Cliente criado com sucesso!", { id: toastId });
                            setOpen(false);

                            setTimeout(() => {
                                router.refresh();
                            }, 150);
                        } catch (error) {
                            console.error("Erro após criar cliente:", error);

                            toast.success("Cliente criado com sucesso!", { id: toastId });
                            setOpen(false);

                            setTimeout(() => {
                                router.refresh();
                            }, 150);
                        }
                    }}
                    className="relative flex h-[calc(100dvh-56px)] flex-col overflow-hidden"
                >
                    <div className="flex-1 space-y-6 overflow-auto px-6 py-5">
                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Cadastro rápido
                            </legend>

                            <div className="mt-3 space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nome" className="flex items-center gap-2 text-xs">
                                        <UserRound className="h-3.5 w-3.5"/>
                                        Nome
                                    </Label>
                                    <Input id="nome" name="nome" required placeholder="Ex.: João Silva"/>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="flex items-center gap-2 text-xs">
                                            <Phone className="h-3.5 w-3.5"/>
                                            Telefone
                                        </Label>
                                        <BrazilPhoneInput
                                            nameDisplay="telefone_visual"
                                            nameNormalized="telefone"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="flex items-center gap-2 text-xs">
                                            <Mail className="h-3.5 w-3.5"/>
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

                        <Collapsible
                            open={showExtra}
                            onOpenChange={setShowExtra}
                            className="rounded-2xl border border-white/10 bg-white/5"
                        >
                            <CollapsibleTrigger asChild>
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                                >
                                    <div>
                                        <div className="text-sm font-medium">Cadastro completo</div>
                                        <div className="text-xs text-muted-foreground">
                                            Adicione mais dados quando fizer sentido
                                        </div>
                                    </div>

                                    <ChevronDown
                                        className={`h-4 w-4 transition ${showExtra ? "rotate-180" : ""}`}
                                    />
                                </button>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="space-y-5 px-4 pb-4">
                                <Separator className="bg-white/10"/>

                                <div className="space-y-3">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
                                        Dados pessoais
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="cpf" className="text-xs">CPF</Label>
                                            <Input id="cpf" name="cpf" placeholder="000.000.000-00"/>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="nascimento" className="text-xs">Data de nascimento</Label>
                                            <Input id="nascimento" name="nascimento" type="date"/>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
                                        Endereço
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="cep" className="text-xs">CEP</Label>
                                            <Input id="cep" name="cep" placeholder="00000-000"/>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="cidade" className="flex items-center gap-2 text-xs">
                                                <MapPin className="h-3.5 w-3.5"/>
                                                Cidade
                                            </Label>
                                            <Input id="cidade" name="cidade" placeholder="São Paulo"/>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="estado" className="text-xs">UF</Label>
                                            <Input id="estado" name="estado" placeholder="SP" maxLength={2}/>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="endereco" className="text-xs">Endereço</Label>
                                            <Input id="endereco" name="endereco" placeholder="Rua, número, bairro"/>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
                                        Contexto comercial
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="produto_interesse" className="text-xs">
                                                Produto de interesse
                                            </Label>
                                            <select
                                                id="produto_interesse"
                                                name="produto_interesse"
                                                className="h-10 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
                                            >
                                                <option value="">Selecionar</option>
                                                <option value="imobiliario">Imobiliário</option>
                                                <option value="auto">Auto</option>
                                                <option value="pesados">Pesados</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="objetivo" className="text-xs">Objetivo</Label>
                                            <Input id="objetivo" name="objetivo"
                                                   placeholder="Compra, troca, investimento..."/>
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>

                    <SheetFooter
                        className="sticky bottom-0 w-full border-t border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-xl">
                        <div className="flex w-full items-center justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>

                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500">
                                Salvar cliente
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}