"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { AdminOption, GrupoOption } from "../actions";
import { createContractFromLead } from "@/app/app/leads/actions";

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
    const router = useRouter();

    const [open, setOpen] = React.useState(false);
    const [admId, setAdmId] = React.useState<string>("");
    const [grupoId, setGrupoId] = React.useState<string>("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const gruposFiltrados = React.useMemo(
        () => grupos.filter((g) => g.administradoraId === admId),
        [grupos, admId]
    );

    const grupoSelecionado = React.useMemo(
        () => gruposFiltrados.find((g) => g.id === grupoId) ?? null,
        [gruposFiltrados, grupoId]
    );

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = e.currentTarget;
        const fd = new FormData(form);

        if (
            !fd.get("administradoraId") ||
            !fd.get("grupoCodigo") ||
            !fd.get("numeroCota") ||
            !fd.get("valorCarta")
        ) {
            toast.error("Preencha os campos obrigatórios.");
            return;
        }

        const toastId = toast.loading("Criando contrato...");

        try {
            setIsSubmitting(true);

            const result = await createContractFromLead(fd);

            const errorMessage =
                typeof result === "object" &&
                result !== null &&
                "error" in result &&
                typeof result.error === "string"
                    ? result.error
                    : typeof result === "object" &&
                    result !== null &&
                    "message" in result &&
                    typeof result.message === "string"
                        ? result.message
                        : null;

            if (errorMessage) {
                toast.error(errorMessage, { id: toastId });
                return;
            }

            toast.success("Contrato criado com sucesso!", { id: toastId });
            setOpen(false);

            onSuccess?.();
            router.refresh();
        } catch (error) {
            console.error("Erro ao criar contrato:", error);
            toast.error("Não foi possível criar o contrato.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Nova carta</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Nova carta / contrato — {leadName}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <input type="hidden" name="leadId" value={leadId} />
                    <input
                        type="hidden"
                        name="grupoCodigo"
                        value={grupoSelecionado?.codigo ?? ""}
                    />

                    <div className="grid gap-2">
                        <Label>Administradora</Label>
                        <select
                            name="administradoraId"
                            value={admId}
                            onChange={(e) => {
                                setAdmId(e.target.value);
                                setGrupoId("");
                            }}
                            className="h-9 rounded-md border bg-background px-2 text-sm"
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">Selecione…</option>
                            {administradoras.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Grupo</Label>
                        <select
                            name="grupoId"
                            value={grupoId}
                            onChange={(e) => setGrupoId(e.target.value)}
                            className="h-9 rounded-md border bg-background px-2 text-sm"
                            required
                            disabled={isSubmitting || !admId}
                        >
                            <option value="">Selecione…</option>
                            {gruposFiltrados.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.codigo ?? g.id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Número da cota</Label>
                        <Input
                            name="numeroCota"
                            placeholder="Ex.: 12345"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Produto</Label>
                        <select
                            name="produto"
                            defaultValue="imobiliario"
                            className="h-9 rounded-md border bg-background px-2 text-sm"
                            disabled={isSubmitting}
                        >
                            <option value="imobiliario">Imobiliário</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Valor da carta</Label>
                        <Input
                            name="valorCarta"
                            placeholder="Ex.: 350.000,00"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label>Prazo (opcional)</Label>
                            <Input
                                type="number"
                                name="prazo"
                                placeholder="Ex.: 180"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Forma de pagamento (opcional)</Label>
                            <Input
                                name="formaPagamento"
                                placeholder="Ex.: boleto"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Índice de correção (opcional)</Label>
                        <Input
                            name="indiceCorrecao"
                            placeholder="Ex.: INCC / IPCA"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label>Data de adesão (opcional)</Label>
                            <Input type="date" name="dataAdesao" disabled={isSubmitting} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Data de assinatura (opcional)</Label>
                            <Input
                                type="date"
                                name="dataAssinatura"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Nº do contrato (opcional)</Label>
                        <Input
                            name="numero"
                            placeholder="Ex.: 2025-000123"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="parcelaReduzida"
                                disabled={isSubmitting}
                            />
                            Parcela reduzida
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="fgtsPermitido"
                                disabled={isSubmitting}
                            />
                            FGTS permitido
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="embutidoPermitido"
                                disabled={isSubmitting}
                            />
                            Embutido permitido
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="autorizacaoGestao"
                                disabled={isSubmitting}
                            />
                            Autorização de gestão
                        </label>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Criando..." : "Criar contrato"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}