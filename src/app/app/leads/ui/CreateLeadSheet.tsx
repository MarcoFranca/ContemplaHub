"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createLeadManual } from "@/app/app/leads/actions";
import { BrazilPhoneInput } from "@/components/app/shared/SmartInputs";
import { formatMoneyBR, parseMoneyBR } from "@/lib/formatters";
import { SectionFX } from "@/components/marketing/SectionFX";

type Props = { variant?: "button" | "fab" };

export function CreateLeadSheet({ variant = "button" }: Props) {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        function isTypingInEditable(e: KeyboardEvent) {
            const el = e.target as HTMLElement | null;
            if (!el) return false;
            if (el.isContentEditable) return true;

            const tag = el.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;

            // Combobox/Select do Radix/Shadcn
            if (el.closest('[role="combobox"]')) return true;

            return false;
        }

        function onKey(e: KeyboardEvent) {
            const key = e.key.toLowerCase();

            // só abre com "n", sem modificadores, sheet fechado e fora de campos editáveis
            if (
                key === "n" &&
                !e.metaKey && !e.ctrlKey && !e.altKey &&
                !open &&
                !isTypingInEditable(e)
            ) {
                e.preventDefault();
                setOpen(true);
            }
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const trigger =
        variant === "fab" ? (
            <Button
                className=" bottom-4 right-4 md:bottom-6 md:right-6 z-50  h-8 w-8 p-0 shadow-lg bg-emerald-600 hover:bg-emerald-500"
                title="Novo lead (N)"
            >
                <Plus className="h-6 w-6 text-white" />
            </Button>
        ) : (
            <Button title="Novo lead (N)">
                <Plus className="mr-2 h-4 w-4" />
                Novo lead
            </Button>
        );

    const [valorMasked, setValorMasked] = React.useState("0,00");

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>

            <SheetContent
                side="right"
                className="
          isolate
          w-[400px] sm:w-[540px]
          bg-slate-950/70 backdrop-blur-xl
          border-l border-white/10 shadow-2xl px-0
        "
            >
                <SectionFX preset="nebula" variant="emerald" showGrid className="absolute inset-0 -z-10" />

                <SheetHeader className="px-6 pt-6 pb-3 border-b border-white/10">
                    <SheetTitle className="flex items-center gap-2 text-base">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/30">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            </span>
                        Novo lead
                        <span className="ml-2 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/70 ring-1 ring-white/10">
              Atalho: N
            </span>
                    </SheetTitle>
                </SheetHeader>

                {/* FORM: o footer fica DENTRO do form e é sticky */}
                <form
                    action={async (fd: FormData) => {
                        const masked = fd.get("valorTotal")?.toString() || "";
                        const parsed = parseMoneyBR(masked);       // ex.: "250.000,00" -> 250000.00
                        if (masked && parsed == null) {
                            toast.error("Valor total inválido.");
                            return;
                        }
                        if (parsed != null) {
                            fd.set("valorTotal", String(Math.round(parsed))); // envia REAIS inteiros (250000)
                        }

                        toast.loading("Salvando lead…");
                        await createLeadManual(fd);
                        toast.dismiss();
                        toast.success("Lead criado com sucesso!");
                        setOpen(false);
                    }}
                    className="relative flex h-[calc(100dvh-56px)] flex-col overflow-hidden"
                >
                    {/* conteúdo rolável */}
                    <div className="flex-1 overflow-auto px-6 py-5 space-y-6">
                        {/* IDENTIFICAÇÃO */}
                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Identificação
                            </legend>

                            <div className="mt-3 space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nome" className="text-xs">Nome</Label>
                                    <Input id="nome" name="nome" required placeholder="Ex.: Ana Lima" className="min-w-0" />
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5 min-w-0">
                                        <Label className="text-xs">Telefone (WhatsApp)</Label>
                                        <BrazilPhoneInput nameDisplay="telefone_visual" nameNormalized="telefone" />
                                    </div>
                                    <div className="space-y-1.5 min-w-0">
                                        <Label htmlFor="email" className="text-xs">E-mail</Label>
                                        <Input id="email" type="email" name="email" placeholder="ana@exemplo.com" className="min-w-0" />
                                    </div>
                                </div>

                                <div className="space-y-1.5 min-w-0">
                                    <Label className="text-xs">Origem</Label>
                                    <Select defaultValue="orgânico" name="origem">
                                        <SelectTrigger className="h-9 min-w-0 truncate">
                                            <SelectValue placeholder="Selecione a origem" />
                                        </SelectTrigger>
                                        <SelectContent
                                            position="popper"
                                            sideOffset={6}
                                            className="z-[70] min-w-[--radix-select-trigger-width] rounded-xl border-white/10 bg-slate-900/95 backdrop-blur-md"
                                        >
                                            <SelectItem value="orgânico">Orgânico</SelectItem>
                                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                            <SelectItem value="indicacao">Indicação</SelectItem>
                                            <SelectItem value="lp">Landing Page</SelectItem>
                                            <SelectItem value="pago">Tráfego Pago</SelectItem>
                                            <SelectItem value="outro">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </fieldset>

                        {/* INTERESSE */}
                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Interesse (opcional)
                            </legend>

                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <div className="space-y-1.5 min-w-0">
                                    <Label className="text-xs">Produto</Label>
                                    <Select name="produto" defaultValue="__produto">
                                        <SelectTrigger className="h-9 min-w-0 truncate">
                                            <SelectValue placeholder="—" />
                                        </SelectTrigger>
                                        <SelectContent
                                            position="popper"
                                            sideOffset={6}
                                            className="z-[70] min-w-[--radix-select-trigger-width] rounded-xl border-white/10 bg-slate-900/95 backdrop-blur-md"
                                        >
                                            <SelectItem value="__produto">—</SelectItem>
                                            <SelectItem value="imobiliario">Imobiliário</SelectItem>
                                            <SelectItem value="auto">Auto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5 min-w-0">
                                    <Label htmlFor="valorTotal" className="text-xs">Valor desejado</Label>
                                    <Input
                                        id="valorTotal"
                                        name="valorTotal"
                                        placeholder="0,00"
                                        inputMode="numeric"
                                        value={valorMasked}
                                        onChange={(e) => setValorMasked(formatMoneyBR(e.target.value))}
                                        className="min-w-0"
                                    />
                                </div>

                                <div className="space-y-1.5 min-w-0">
                                    <Label htmlFor="prazoMeses" className="text-xs">Prazo (meses)</Label>
                                    <Input id="prazoMeses" name="prazoMeses" type="number" placeholder="Ex.: 180" className="min-w-0" />
                                </div>

                                <div className="space-y-1.5 min-w-0">
                                    <Label className="text-xs">Perfil</Label>
                                    <Select name="perfilDesejado" defaultValue="__perfil">
                                        <SelectTrigger className="h-9 min-w-0 truncate">
                                            <SelectValue placeholder="—" />
                                        </SelectTrigger>
                                        <SelectContent
                                            position="popper"
                                            sideOffset={6}
                                            className="z-[70] min-w-[--radix-select-trigger-width] rounded-xl border-white/10 bg-slate-900/95 backdrop-blur-md"
                                        >
                                            <SelectItem value="__perfil">—</SelectItem>
                                            <SelectItem value="disciplinado_acumulador">Disciplinado acumulador</SelectItem>
                                            <SelectItem value="sonhador_familiar">Sonhador familiar</SelectItem>
                                            <SelectItem value="corporativo_racional">Corporativo racional</SelectItem>
                                            <SelectItem value="impulsivo_emocional">Impulsivo emocional</SelectItem>
                                            <SelectItem value="estrategico_oportunista">Estrategista oportunista</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="mt-3 space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="objetivo" className="text-xs">Objetivo</Label>
                                    <Input id="objetivo" name="objetivo" placeholder="Compra do imóvel / troca do carro…" className="min-w-0" />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="observacao" className="text-xs">Observação</Label>
                                    <Textarea id="observacao" name="observacao" placeholder="Notas adicionais sobre o interesse…" className="min-h-[96px]" />
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    {/* footer STICKY e DENTRO do form */}
                    <SheetFooter className="sticky bottom-0 w-full bg-slate-950/80 backdrop-blur-xl border-t border-white/10 px-6 py-4 shadow-[0_-12px_24px_-12px_rgba(0,0,0,0.5)]">
                        <div className="flex w-full items-center justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500">
                                Salvar
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
