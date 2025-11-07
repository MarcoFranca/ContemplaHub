// src/app/app/leads/ui/CreateLeadDialog.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLeadManual } from "@/app/app/leads/actions";
import {Plus} from "lucide-react";

export function CreateLeadDialog({ variant = "button" }: { variant?: "button" | "fab" }) {
    const trigger =
        variant === "fab" ? (
            <Button
                className="bg-emerald-600 hover:bg-emerald-500"
                title="Novo lead"
            >
                <Plus className="h-6 w-6 text-white" />
            </Button>
        ) : (
            <Button>Novo lead</Button>
        );

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Novo lead </DialogTitle>
                </DialogHeader>
                <form action={createLeadManual} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" name="nome" required placeholder="Ex.: Ana Lima" />
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input id="telefone" name="telefone" placeholder="(11) 99999-9999" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" name="email" placeholder="ana@exemplo.com" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="origem">Origem</Label>
                        <select
                            id="origem"
                            name="origem"
                            defaultValue="orgânico"
                            className="h-9 rounded-md bg-background border px-2 text-sm"
                        >
                            <option value="orgânico">Orgânico</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="indicacao">Indicação</option>
                            <option value="lp">Landing Page</option>
                            <option value="pago">Tráfego Pago</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                        <p className="text-sm font-medium">Interesse (opcional)</p>
                        <div className="grid gap-2 md:grid-cols-2 mt-2">
                            <div className="grid gap-2">
                                <Label htmlFor="produto">Produto</Label>
                                <select id="produto" name="produto" className="h-9 rounded-md bg-background border px-2 text-sm">
                                    <option value="">—</option>
                                    <option value="imobiliario">Imobiliário</option>
                                    <option value="auto">Auto</option>
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="valorTotal">Valor total</Label>
                                <Input id="valorTotal" name="valorTotal" placeholder="Ex.: 350.000,00" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="prazoMeses">Prazo (meses)</Label>
                                <Input id="prazoMeses" name="prazoMeses" type="number" placeholder="Ex.: 180" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="perfilDesejado">Perfil</Label>
                                <select id="perfilDesejado" name="perfilDesejado" className="h-9 rounded-md bg-background border px-2 text-sm">
                                    <option value="">—</option>
                                    <option value="disciplinado_acumulador">Disciplinado acumulador</option>
                                    <option value="sonhador_familiar">Sonhador familiar</option>
                                    <option value="corporativo_racional">Corporativo racional</option>
                                    <option value="impulsivo_emocional">Impulsivo emocional</option>
                                    <option value="estrategico_oportunista">Estratégico oportunista</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-2 mt-2">
                            <Label htmlFor="objetivo">Objetivo</Label>
                            <Input id="objetivo" name="objetivo" placeholder="Compra de imóvel / troca do carro / etc." />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="observacao">Observação</Label>
                            <textarea
                                id="observacao"
                                name="observacao"
                                className="min-h-[80px] rounded-md bg-background border px-3 py-2 text-sm"
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
