"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    type Campanha,
    createCampanhaAction,
    updateCampanhaAction,
    deleteCampanhaAction,
} from "./actions";

const PRODUTOS = [
    { v: "", label: "Geral (todos)" },
    { v: "imovel", label: "Imóvel" },
    { v: "auto", label: "Auto" },
    { v: "pesados", label: "Pesados" },
];

function num(v: string): number | null {
    if (v.trim() === "") return null;
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : null;
}

function CampanhaCard({ c, onChanged }: { c: Campanha; onChanged: () => void }) {
    const [pending, start] = React.useTransition();

    function patch(p: Parameters<typeof updateCampanhaAction>[1]) {
        start(async () => {
            const res = await updateCampanhaAction(c.id, p);
            if (!res.ok) {
                toast.error(res.error || "Falha ao salvar.");
                return;
            }
            onChanged();
        });
    }

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Input
                    defaultValue={c.nome}
                    className="max-w-xs font-medium"
                    onBlur={(e) => e.target.value.trim() && e.target.value !== c.nome && patch({ nome: e.target.value.trim() })}
                />
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Switch checked={c.ativo} onCheckedChange={(v) => patch({ ativo: v })} />
                        <span className="text-sm text-muted-foreground">{c.ativo ? "Ativa" : "Inativa"}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-300 hover:bg-red-500/10"
                        disabled={pending}
                        onClick={() => {
                            if (!confirm(`Excluir a campanha "${c.nome}"?`)) return;
                            start(async () => {
                                const res = await deleteCampanhaAction(c.id);
                                if (!res.ok) {
                                    toast.error(res.error || "Falha ao excluir.");
                                    return;
                                }
                                toast.success("Campanha excluída.");
                                onChanged();
                            });
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div>
                    <Label className="text-xs text-muted-foreground">Operadora (interno)</Label>
                    <Input
                        defaultValue={c.administradora_nome ?? ""}
                        placeholder="Ex.: Porto"
                        className="mt-1"
                        onBlur={(e) => (e.target.value.trim() || null) !== c.administradora_nome && patch({ administradora_nome: e.target.value.trim() || null })}
                    />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Produto</Label>
                    <select
                        defaultValue={c.produto ?? ""}
                        onChange={(e) => patch({ produto: e.target.value || null })}
                        className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-2 py-1.5 text-sm"
                    >
                        {PRODUTOS.map((p) => (
                            <option key={p.v} value={p.v}>{p.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Taxa adm (%)</Label>
                    <Input type="number" step="0.1" defaultValue={c.taxa_admin_pct ?? ""} className="mt-1"
                        onBlur={(e) => num(e.target.value) !== c.taxa_admin_pct && patch({ taxa_admin_pct: num(e.target.value) })} />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Redutor (%)</Label>
                    <Input type="number" step="0.1" defaultValue={c.redutor_pct ?? ""} className="mt-1"
                        onBlur={(e) => num(e.target.value) !== c.redutor_pct && patch({ redutor_pct: num(e.target.value) })} />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Fundo reserva (%)</Label>
                    <Input type="number" step="0.1" defaultValue={c.fundo_reserva_pct ?? ""} className="mt-1"
                        onBlur={(e) => num(e.target.value) !== c.fundo_reserva_pct && patch({ fundo_reserva_pct: num(e.target.value) })} />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Prazo (meses)</Label>
                    <Input type="number" defaultValue={c.prazo_meses ?? ""} className="mt-1"
                        onBlur={(e) => num(e.target.value) !== c.prazo_meses && patch({ prazo_meses: num(e.target.value) })} />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Embutido máx (%)</Label>
                    <Input type="number" step="0.1" defaultValue={c.embutido_max_pct ?? ""} className="mt-1"
                        onBlur={(e) => num(e.target.value) !== c.embutido_max_pct && patch({ embutido_max_pct: num(e.target.value) })} />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Vigência (fim)</Label>
                    <Input type="date" defaultValue={c.vigencia_fim ?? ""} className="mt-1"
                        onBlur={(e) => (e.target.value || null) !== c.vigencia_fim && patch({ vigencia_fim: e.target.value || null })} />
                </div>
            </div>
        </div>
    );
}

export function CampanhasClient({ initial }: { initial: Campanha[] }) {
    const router = useRouter();
    const onChanged = () => router.refresh();
    const [pending, start] = React.useTransition();
    const [nome, setNome] = React.useState("");

    function criar() {
        const n = nome.trim();
        if (!n) {
            toast.error("Dê um nome à campanha.");
            return;
        }
        start(async () => {
            const res = await createCampanhaAction({
                nome: n,
                administradora_nome: null,
                produto: null,
                taxa_admin_pct: 20,
                redutor_pct: 30,
                fundo_reserva_pct: 2,
                prazo_meses: null,
                embutido_max_pct: null,
                observacao: null,
                ativo: true,
                vigencia_inicio: null,
                vigencia_fim: null,
            });
            if (!res.ok) {
                toast.error(res.error || "Falha ao criar.");
                return;
            }
            setNome("");
            toast.success("Campanha criada.");
            onChanged();
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Nova campanha</Label>
                    <Input placeholder="Ex.: Campanha imóvel julho" value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1" />
                </div>
                <Button className="gap-1.5" disabled={pending} onClick={criar}>
                    <Plus className="h-4 w-4" /> Criar
                </Button>
            </div>

            {initial.length ? (
                initial.map((c) => <CampanhaCard key={c.id} c={c} onChanged={onChanged} />)
            ) : (
                <div className="rounded-xl border border-white/10 p-8 text-center text-muted-foreground">
                    <Megaphone className="mx-auto mb-2 h-7 w-7 text-emerald-500/60" />
                    Nenhuma campanha cadastrada. O agente usa o padrão (taxa 20% / redutor 30% / FR 2%).
                </div>
            )}
        </div>
    );
}
