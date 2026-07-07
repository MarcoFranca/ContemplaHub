"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Globe2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Administradora } from "../actions";
import {
    createAdministradoraAction,
    deleteAdministradoraAction,
    updateAdministradoraAction,
} from "../actions";

export function OperadorasManager({ initial }: { initial: Administradora[] }) {
    const router = useRouter();
    const [editing, setEditing] = React.useState<Administradora | null>(null);
    const [creating, setCreating] = React.useState(false);
    const formOpen = creating || editing !== null;

    return (
        <div className="space-y-4">
            {!formOpen && (
                <Button onClick={() => setCreating(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova operadora
                </Button>
            )}

            {formOpen && (
                <OperadoraForm
                    operadora={editing}
                    onClose={() => {
                        setCreating(false);
                        setEditing(null);
                    }}
                    onSaved={() => {
                        setCreating(false);
                        setEditing(null);
                        router.refresh();
                    }}
                />
            )}

            <div className="grid gap-3">
                {initial.map((o) => (
                    <Card key={o.id} className="border-white/10">
                        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                                        <Building2 className="h-4 w-4" />
                                    </span>
                                    <h3 className="font-semibold">{o.nome}</h3>
                                    {o.is_global ? (
                                        <Badge variant="outline" className="gap-1 border-white/15">
                                            <Globe2 className="h-3 w-3" /> Global
                                        </Badge>
                                    ) : o.is_override ? (
                                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300">
                                            Editada por você
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                                            Sua operadora
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-1 pl-10 text-xs text-muted-foreground">
                                    {o.cnpj ? `CNPJ ${o.cnpj}` : "Sem CNPJ"}
                                    {o.site ? ` · ${o.site}` : ""}
                                </div>
                            </div>
                            <div className="flex shrink-0 gap-2">
                                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(o)}>
                                    <Pencil className="h-3.5 w-3.5" /> Editar
                                </Button>
                                {!o.is_global && (
                                    <DeleteButton
                                        id={o.id}
                                        nome={o.nome}
                                        isOverride={o.is_override}
                                        onDone={() => router.refresh()}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function DeleteButton({
    id,
    nome,
    isOverride,
    onDone,
}: {
    id: string;
    nome: string;
    isOverride: boolean;
    onDone: () => void;
}) {
    const [pending, start] = React.useTransition();
    return (
        <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
            disabled={pending}
            onClick={() => {
                const msg = isOverride
                    ? `Remover sua versão de "${nome}"? A operadora global volta a aparecer.`
                    : `Excluir a operadora "${nome}"?`;
                if (!confirm(msg)) return;
                start(async () => {
                    const res = await deleteAdministradoraAction(id);
                    if (!res.ok) {
                        toast.error(res.error || "Erro ao excluir.");
                        return;
                    }
                    toast.success(isOverride ? "Versão removida. Global restaurada." : "Operadora excluída.");
                    onDone();
                });
            }}
        >
            <Trash2 className="h-3.5 w-3.5" /> {isOverride ? "Restaurar global" : "Excluir"}
        </Button>
    );
}

function OperadoraForm({
    operadora,
    onClose,
    onSaved,
}: {
    operadora: Administradora | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [nome, setNome] = React.useState(operadora?.nome ?? "");
    const [cnpj, setCnpj] = React.useState(operadora?.cnpj ?? "");
    const [site, setSite] = React.useState(operadora?.site ?? "");
    const [pending, start] = React.useTransition();
    const editingGlobal = operadora?.is_global ?? false;

    const save = () => {
        if (!nome.trim()) return toast.error("Informe o nome da operadora.");
        start(async () => {
            const input = { nome, cnpj, site };
            const res = operadora
                ? await updateAdministradoraAction(operadora.id, input)
                : await createAdministradoraAction(input);
            if (!res.ok) {
                toast.error(res.error || "Erro ao salvar.");
                return;
            }
            toast.success(
                editingGlobal
                    ? "Criada sua versão desta operadora (a global fica oculta para você)."
                    : operadora
                        ? "Operadora atualizada."
                        : "Operadora criada.",
            );
            onSaved();
        });
    };

    return (
        <Card className="border-emerald-500/20">
            <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                        {operadora ? (editingGlobal ? "Personalizar operadora global" : "Editar operadora") : "Nova operadora"}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose} title="Fechar">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {editingGlobal && (
                    <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-xs text-amber-100">
                        Isto cria uma <strong>versão sua</strong> desta operadora. A global deixa de aparecer para você
                        (e volta se você restaurar). Nenhuma outra organização é afetada.
                    </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">Nome</label>
                        <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Porto Seguro" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">CNPJ (opcional)</label>
                        <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Site (opcional)</label>
                        <Input value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://..." />
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
                    <Button variant="outline" onClick={onClose} disabled={pending}>
                        Cancelar
                    </Button>
                    <Button onClick={save} disabled={pending}>
                        {pending ? "Salvando..." : "Salvar"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
