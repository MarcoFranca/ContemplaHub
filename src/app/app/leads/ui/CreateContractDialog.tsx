// src/app/app/leads/ui/CreateContractDialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react";
import type { AdminOption, GrupoOption } from "../actions";
import { createContractFromLead } from "@/app/app/leads/actions";
import { toast } from "sonner";

export function CreateContractDialog({
                                         leadId,
                                         leadName,
                                         administradoras,
                                         grupos,
                                         onSuccess,
                                     }: {
    leadId: string;
    leadName: string;
    administradoras: AdminOption[];
    grupos: GrupoOption[];
    onSuccess?: () => void;
}) {
    const [open, setOpen] = React.useState(false);
    const [admId, setAdmId] = React.useState<string>("");

    const gruposFiltrados = React.useMemo(
        () => grupos.filter((g) => g.administradoraId === admId),
        [grupos, admId]
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Gerar contrato</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Novo contrato — {leadName}</DialogTitle>
                </DialogHeader>

                <form
                    action={createContractFromLead}
                    onSubmit={(e) => {
                        const fd = new FormData(e.currentTarget);
                        if (!fd.get("administradoraId") || !fd.get("grupoId") || !fd.get("valorCarta")) {
                            e.preventDefault();
                            return;
                        }
                        setOpen(false);
                        toast.loading("Criando contrato…");
                        onSuccess?.();
                    }}
                    className="space-y-3"
                >
                    <input type="hidden" name="leadId" value={leadId} />

                    <div className="grid gap-2">
                        <Label>Administradora</Label>
                        <select
                            name="administradoraId"
                            value={admId}
                            onChange={(e) => setAdmId(e.target.value)}
                            className="h-9 rounded-md bg-background border px-2 text-sm"
                            required
                        >
                            <option value="">Selecione…</option>
                            {administradoras.map((a) => (
                                <option key={a.id} value={a.id}>{a.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Grupo</Label>
                        <select name="grupoId" className="h-9 rounded-md bg-background border px-2 text-sm" required>
                            <option value="">Selecione…</option>
                            {gruposFiltrados.map((g) => (
                                <option key={g.id} value={g.id}>{g.codigo ?? g.id}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Produto</Label>
                        <select name="produto" defaultValue="imobiliario" className="h-9 rounded-md bg-background border px-2 text-sm">
                            <option value="imobiliario">Imobiliário</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Valor da carta</Label>
                        <Input name="valorCarta" placeholder="Ex.: 350.000,00" required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label>Data de adesão (opcional)</Label>
                            <Input type="date" name="dataAdesao" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Data de assinatura (opcional)</Label>
                            <Input type="date" name="dataAssinatura" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Nº do contrato (opcional)</Label>
                        <Input name="numero" placeholder="Ex.: 2025-000123" />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Criar contrato</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
