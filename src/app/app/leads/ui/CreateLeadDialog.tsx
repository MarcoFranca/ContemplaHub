"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createLeadManual } from "@/app/app/leads/actions";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { BrazilPhoneInput } from "@/components/app/shared/SmartInputs";
import { formatMoneyBR, parseMoneyBR } from "@/lib/formatters";

export function CreateLeadDialog({ variant = "button" }: { variant?: "button" | "fab" }) {
    const [open, setOpen] = React.useState(false);

    const trigger =
        variant === "fab" ? (
            <Button className="bg-emerald-600 hover:bg-emerald-500" title="Novo lead">
                <Plus className="h-6 w-6 text-white" />
            </Button>
        ) : (
            <Button title="Novo lead">
                <Plus className="mr-2 h-4 w-4" />
                Novo lead
            </Button>
        );

    const [valorMasked, setValorMasked] = React.useState("");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Novo lead</DialogTitle>
                </DialogHeader>

                <form
                    action={async (fd: FormData) => {
                        const masked = fd.get("valorTotal")?.toString() || "";
                        const parsed = parseMoneyBR(masked);
                        if (masked && parsed == null) {
                            toast.error("Valor total inválido.");
                            return;
                        }
                        toast.loading("Salvando lead…");
                        await createLeadManual(fd);
                        toast.dismiss();
                        toast.success("Lead criado com sucesso!");
                        setOpen(false);
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" name="nome" required placeholder="Ex.: Ana Lima" />
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Telefone</Label>
                            <BrazilPhoneInput nameDisplay="telefone_visual" nameNormalized="telefone" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" name="email" placeholder="ana@exemplo.com" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Origem</Label>
                        <Select name="origem" defaultValue="orgânico">
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="orgânico">Orgânico</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="indicacao">Indicação</SelectItem>
                                <SelectItem value="lp">Landing Page</SelectItem>
                                <SelectItem value="pago">Tráfego Pago</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                        <p className="text-sm font-medium">Interesse (opcional)</p>
                        <div className="grid gap-2 md:grid-cols-2 mt-2">
                            <div className="grid gap-2">
                                <Label>Produto</Label>
                                <Select name="produto" defaultValue="">
                                    <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="imobiliario">Imobiliário</SelectItem>
                                        <SelectItem value="auto">Auto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="valorTotal">Valor total</Label>
                                <Input
                                    id="valorTotal"
                                    name="valorTotal"
                                    placeholder="Ex.: 350.000,00"
                                    inputMode="numeric"
                                    value={valorMasked}
                                    onChange={(e) => setValorMasked(formatMoneyBR(e.target.value))}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="prazoMeses">Prazo (meses)</Label>
                                <Input id="prazoMeses" name="prazoMeses" type="number" placeholder="Ex.: 180" />
                            </div>

                            <div className="grid gap-2">
                                <Label>Perfil</Label>
                                <Select name="perfilDesejado" defaultValue="">
                                    <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="disciplinado_acumulador">Disciplinado acumulador</SelectItem>
                                        <SelectItem value="sonhador_familiar">Sonhador familiar</SelectItem>
                                        <SelectItem value="corporativo_racional">Corporativo racional</SelectItem>
                                        <SelectItem value="impulsivo_emocional">Impulsivo emocional</SelectItem>
                                        <SelectItem value="estrategico_oportunista">Estratégico oportunista</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2 mt-2">
                            <Label htmlFor="objetivo">Objetivo</Label>
                            <Input id="objetivo" name="objetivo" placeholder="Compra de imóvel / troca do carro / etc." />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="observacao">Observação</Label>
                            <Textarea
                                id="observacao"
                                name="observacao"
                                className="min-h-[80px]"
                                placeholder="Notas adicionais sobre o interesse…"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit">Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
